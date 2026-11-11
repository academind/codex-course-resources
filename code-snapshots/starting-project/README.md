# TinyNotes UI preview

Presentation-only pages based on SPEC.MD, with static sample content and responsive aqua styling.

Run `bun install` and `bun run dev`.

## Routes

- `/`: redirects to `/login` without checking a session.
- `/login` and `/register`: disabled account form previews.
- `/notes`: three sample notes and an expandable empty-state preview.
- `/notes/new`: blank editor placeholder.
- `/notes/a-little-more-space`, `/notes/weekend-ideas`, `/notes/project-notebook`: sample editor pages with inactive save, delete, and share controls.
- `/s/sample-shared-note`: read-only shared sample.
- Unknown routes, note IDs, and share tokens show the custom 404.

The root layout supplies the header, main landmark, and footer. Notes and shared-note layouts supply their own content containers. Loading components cover notes and shared notes. Login and registration include an expandable validation-message example.

The UI remains a static preview without authentication, database integration, TipTap, autosave, token generation, server actions, or an API. The public preview renders hard-coded text through React, not external HTML. Sample notes live in `app/_lib/fixtures.ts`.

Checks: `bun run lint` and `bun run build`.

## SQLite migrations

Run `bun run db:migrate` to create/update `./data/tinynotes.db` using Bun's built-in
[`bun:sqlite`](https://bun.com/docs/runtime/sqlite) client. Set `DB_PATH` in `.env`
or the environment to choose another file. Relative paths resolve from the project
root; parent directories are created automatically. Database files are ignored by Git.

- `migrations/0001_init.up.sql`: the auth tables and indexes specified in `SPEC.MD`.
- `migrations/0002_notes.up.sql`: notes, hashed share tokens, indexes, and one active share per note.
- `scripts/migrate.ts`: runs paired `.up.sql` files in filename order and records the shared filename stem and
  UTC ISO timestamps in `schema_migrations`. Already-applied files are skipped.

Each migration and its ledger entry commit together. On failure, that migration
rolls back and the command exits non-zero; earlier successful migrations remain.
Foreign keys are enabled on the migration connection. Future application connections
must also enable `PRAGMA foreign_keys = ON` to enforce references and cascades.

Run `bun run db:rollback` to undo the latest applied migration using its paired `.down.sql` file. Repeat to undo earlier migrations. Down migrations drop tables and their data; back up valuable data first. The `schema_migrations` ledger remains so migrations can be reapplied.

Add future changes as paired files such as `0003_example.up.sql` and `0003_example.down.sql`, using a version newer than all applied migrations. Do not edit
applied files or include `BEGIN`/`COMMIT`/`ROLLBACK` statements: the runner owns transactions.
The migration command creates schema only and does not connect the preview UI to it.

Run `bun run test:migrations` for temporary-database tests covering schema, repeat runs,
ordering, failed up/down rollback, reapplication, and command failure.
