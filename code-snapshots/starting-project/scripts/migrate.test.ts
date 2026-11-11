import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "./migrate";

const temporaryDirectories: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "tinynotes-migrations-"));
  temporaryDirectories.push(root);
  const migrationsDir = join(root, "migrations");
  mkdirSync(migrationsDir);
  return { root, dbPath: join(root, "nested", "test.db"), migrationsDir };
}
function pair(directory: string, version: string, up: string, down: string) {
  writeFileSync(join(directory, `${version}.up.sql`), up);
  writeFileSync(join(directory, `${version}.down.sql`), down);
}
function tables(db: Database) {
  return db
    .query<{ name: string }, []>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    )
    .all()
    .map((row) => row.name);
}
afterEach(() => {
  for (const root of temporaryDirectories.splice(0)) rmSync(root, { recursive: true, force: true });
});

test("real schema: up, repeat, down in reverse order, and reapply", () => {
  const { dbPath } = fixture();
  expect(migrate({ dbPath })).toEqual(["0001_init", "0002_notes"]);
  let db = new Database(dbPath);
  try {
    expect(tables(db)).toEqual([
      "account",
      "note",
      "note_share",
      "schema_migrations",
      "session",
      "user",
      "verification",
    ]);
    const ledger = db
      .query<{ version: string; applied_at: string }, []>(
        "SELECT * FROM schema_migrations ORDER BY version",
      )
      .all();
    expect(ledger).toHaveLength(2);
    expect(ledger.every((row) => new Date(row.applied_at).toISOString() === row.applied_at)).toBe(
      true,
    );
    expect(
      db
        .query<{ name: string }, []>("PRAGMA table_info(note)")
        .all()
        .map((row) => row.name),
    ).toContain("content_json");
    db.run("PRAGMA foreign_keys = ON");
    db.run(
      "INSERT INTO user VALUES ('u', 'Alex', 'alex@example.com', 0, NULL, '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z')",
    );
    db.run(
      "INSERT INTO note VALUES ('n', 'u', '', '{}', 0, '2026-10-25T00:00:00.000Z', '2026-10-25T00:00:00.000Z')",
    );
    db.run(
      "INSERT INTO note_share VALUES ('s', 'n', 'hash1', 1, '2026-10-25T00:00:00.000Z', NULL)",
    );
    expect(() =>
      db.run(
        "INSERT INTO note_share VALUES ('s2', 'n', 'hash2', 1, '2026-10-25T00:00:00.000Z', NULL)",
      ),
    ).toThrow();
    expect(() =>
      db.run("INSERT INTO note VALUES ('bad', 'missing', '', '{}', 0, 'now', 'now')"),
    ).toThrow();
    db.run("DELETE FROM user WHERE id = 'u'");
    expect(db.query("SELECT * FROM note").all()).toEqual([]);
    expect(db.query("SELECT * FROM note_share").all()).toEqual([]);
  } finally {
    db.close();
  }
  expect(migrate({ dbPath })).toEqual([]);
  expect(migrate({ dbPath, direction: "down" })).toEqual(["0002_notes"]);
  db = new Database(dbPath);
  try {
    expect(tables(db)).toContain("user");
    expect(tables(db)).not.toContain("note");
  } finally {
    db.close();
  }
  expect(migrate({ dbPath, direction: "down" })).toEqual(["0001_init"]);
  expect(migrate({ dbPath, direction: "down" })).toEqual([]);
  expect(migrate({ dbPath })).toEqual(["0001_init", "0002_notes"]);
});

test("filename ordering and failed up rollback preserve earlier migrations", () => {
  const options = fixture();
  pair(
    options.migrationsDir,
    "0002_second",
    "INSERT INTO first VALUES (2); CREATE TABLE partial (id); INSERT INTO missing VALUES (1);",
    "DROP TABLE partial;",
  );
  pair(
    options.migrationsDir,
    "0001_first",
    "CREATE TABLE first (id); INSERT INTO first VALUES (1);",
    "DROP TABLE first;",
  );
  pair(options.migrationsDir, "0003_third", "CREATE TABLE third (id);", "DROP TABLE third;");
  expect(() => migrate(options)).toThrow();
  const db = new Database(options.dbPath);
  try {
    expect(tables(db)).toEqual(["first", "schema_migrations"]);
    expect(db.query("SELECT * FROM first").all()).toEqual([{ id: 1 }]);
    expect(db.query("SELECT version FROM schema_migrations").all()).toEqual([
      { version: "0001_first" },
    ]);
  } finally {
    db.close();
  }
  writeFileSync(join(options.migrationsDir, "0002_second.up.sql"), "INSERT INTO first VALUES (2);");
  expect(migrate(options)).toEqual(["0002_second", "0003_third"]);
});

test("failed down restores schema, data, and the migration ledger", () => {
  const options = fixture();
  pair(
    options.migrationsDir,
    "0001_first",
    "CREATE TABLE first (id); INSERT INTO first VALUES (1);",
    "DROP TABLE first; DROP TABLE missing;",
  );
  migrate(options);
  expect(() => migrate({ ...options, direction: "down" })).toThrow();
  const db = new Database(options.dbPath);
  try {
    expect(db.query("SELECT * FROM first").all()).toEqual([{ id: 1 }]);
    expect(db.query("SELECT version FROM schema_migrations").all()).toEqual([
      { version: "0001_first" },
    ]);
  } finally {
    db.close();
  }
});

test("rejects missing down files before applying schema", () => {
  const options = fixture();
  writeFileSync(join(options.migrationsDir, "0001_first.up.sql"), "CREATE TABLE first (id);");
  expect(() => migrate(options)).toThrow("Missing migration pair");
});

test("CLI exits non-zero on migration failure", () => {
  const options = fixture();
  mkdirSync(join(options.root, "database-is-a-directory"));
  const result = Bun.spawnSync([process.execPath, join(import.meta.dir, "migrate.ts")], {
    env: { ...process.env, DB_PATH: join(options.root, "database-is-a-directory") },
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(result.exitCode).toBe(1);
  expect(result.stderr.toString()).toContain("Database migration failed");
});

test("refuses an older pending migration so rollback order stays correct", () => {
  const options = fixture();
  pair(options.migrationsDir, "0002_second", "CREATE TABLE second (id);", "DROP TABLE second;");
  migrate(options);
  pair(options.migrationsDir, "0001_first", "CREATE TABLE first (id);", "DROP TABLE first;");
  expect(() => migrate(options)).toThrow("precedes applied migration");
});

test("CLI supports up/down and rejects invalid commands", () => {
  const { dbPath } = fixture();
  const run = (direction: string) =>
    Bun.spawnSync([process.execPath, join(import.meta.dir, "migrate.ts"), direction], {
      env: { ...process.env, DB_PATH: dbPath },
      stdout: "pipe",
      stderr: "pipe",
    });
  expect(run("up").exitCode).toBe(0);
  expect(run("down").stdout.toString()).toContain("Reverted 0002_notes");
  expect(run("invalid").exitCode).toBe(1);
});
