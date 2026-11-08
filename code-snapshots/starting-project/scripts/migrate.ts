import { Database } from "bun:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
type MigrationOptions = { dbPath?: string; migrationsDir?: string; direction?: "up" | "down" };

export function migrate({
  dbPath = process.env.DB_PATH ?? "./data/tinynotes.db",
  migrationsDir = resolve(projectRoot, "migrations"),
  direction = "up",
}: MigrationOptions = {}): string[] {
  if (!dbPath.trim()) throw new Error("DB_PATH must not be empty.");
  const files = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name);
  const versions = new Set<string>();
  for (const filename of files) {
    const match = /^(\d{4}_[a-z0-9_]+)\.(up|down)\.sql$/.exec(filename);
    if (!match) throw new Error(`Invalid migration filename: ${filename}`);
    versions.add(match[1]);
  }
  for (const version of versions) {
    if (!files.includes(`${version}.up.sql`) || !files.includes(`${version}.down.sql`)) {
      throw new Error(`Missing migration pair: ${version}`);
    }
  }
  const databasePath = dbPath === ":memory:" ? dbPath : resolve(projectRoot, dbPath);
  if (databasePath !== ":memory:") mkdirSync(dirname(databasePath), { recursive: true });
  const db = new Database(databasePath, { create: true, strict: true });
  try {
    db.run("PRAGMA busy_timeout = 5000;");
    db.run("PRAGMA foreign_keys = ON;");
    db.run(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );`);

    // Keep schema changes and history changes in the same synchronous transaction.
    if (direction === "down") {
      return db
        .transaction(() => {
          const latest = db
            .query<{ version: string }, []>(
              "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
            )
            .get();
          if (!latest) return [];
          if (!versions.has(latest.version))
            throw new Error(`Missing migration pair: ${latest.version}`);
          db.run(readFileSync(resolve(migrationsDir, `${latest.version}.down.sql`), "utf8"));
          db.query("DELETE FROM schema_migrations WHERE version = ?").run(latest.version);
          return [latest.version];
        })
        .immediate();
    }

    const applied: string[] = [];
    for (const version of [...versions].sort()) {
      const didApply = db
        .transaction(() => {
          if (db.query("SELECT version FROM schema_migrations WHERE version = ?").get(version))
            return false;
          const latest = db
            .query<{ version: string }, []>(
              "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
            )
            .get();
          if (latest && version < latest.version) {
            throw new Error(
              `Migration ${version} precedes applied migration ${latest.version}; add a newer migration instead.`,
            );
          }
          db.run(readFileSync(resolve(migrationsDir, `${version}.up.sql`), "utf8"));
          db.query("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(
            version,
            new Date().toISOString(),
          );
          return true;
        })
        .immediate();
      if (didApply) applied.push(version);
    }
    return applied;
  } finally {
    db.close();
  }
}

if (import.meta.main) {
  try {
    const [direction = "up", ...extra] = process.argv.slice(2);
    if ((direction !== "up" && direction !== "down") || extra.length) {
      throw new Error("Usage: bun scripts/migrate.ts [up|down]");
    }
    const changed = migrate({ direction });
    for (const version of changed)
      console.log(`${direction === "up" ? "Applied" : "Reverted"} ${version}`);
    console.log(
      changed.length
        ? `Completed ${changed.length} ${direction} migration(s).`
        : "No migrations to run.",
    );
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  }
}
