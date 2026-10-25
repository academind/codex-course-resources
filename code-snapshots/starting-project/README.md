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

There is no authentication, database, TipTap integration, persistence, autosave, token generation, server action, or API. The public preview renders hard-coded text through React, not external HTML. Sample notes live in `app/_lib/fixtures.ts`.

Checks: `bun run lint` and `bun run build`.
