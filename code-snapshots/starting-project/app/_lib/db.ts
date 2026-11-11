import "server-only";

import { Database } from "bun:sqlite";
import path from "node:path";

const databasePath = path.resolve(process.cwd(), process.env.DB_PATH ?? "./data/tinynotes.db");

const globalForDatabase = globalThis as typeof globalThis & {
  tinyNotesDatabase?: Database;
};

export const database =
  globalForDatabase.tinyNotesDatabase ?? new Database(databasePath, { create: true });

database.run("PRAGMA foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.tinyNotesDatabase = database;
}
