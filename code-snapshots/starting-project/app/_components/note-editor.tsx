import Link from "next/link";
import { notes, sampleToken } from "../_lib/fixtures";
export function NoteEditor({ note }: { note?: (typeof notes)[number] }) {
  return (
    <>
      <Link className="back-link" href="/notes">
        ? All notes
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{note ? "ROOM TO REFLECT" : "A FRESH START"}</p>
          <h1>{note ? "Your note" : "New note"}</h1>
        </div>
        <span className="badge">Editor preview</span>
      </div>
      <div className="editor-grid">
        <section className="card editor" aria-label="Note editor preview">
          <label className="sr-only" htmlFor="note-title">
            Note title
          </label>
          <input
            id="note-title"
            className="title-input"
            placeholder="Untitled note"
            defaultValue={note?.title}
            readOnly
          />
          <div className="toolbar" role="group" aria-label="Formatting preview">
            {["Heading", "Bold", "Italic", "List", "Quote", "Link", "Code", "Undo"].map((label) => (
              <button type="button" disabled key={label}>
                {label}
              </button>
            ))}
          </div>
          <div className="editor-content">
            {note ? (
              note.paragraphs.map((p) => <p key={p}>{p}</p>)
            ) : (
              <p className="placeholder">Every idea starts somewhere. Your words will go here…</p>
            )}
          </div>
          <div className="editor-footer">
            {note ? `Last updated ${note.date}` : "A blank page for your next idea"}
            <span>Not saved · Preview</span>
          </div>
        </section>
        <aside className="card share-panel">
          <h2>Share a little inspiration</h2>
          <p>Let someone read your note with a public link.</p>
          <span className={`badge ${note?.shared ? "shared" : ""}`}>
            {note?.shared ? "Shared sample" : "Private sample"}
          </span>
          {note?.shared ? (
            <>
              <label>
                Sample link
                <input value={`/s/${sampleToken}`} readOnly />
              </label>
              <Link className="preview-link" href={`/s/${sampleToken}`}>
                Open shared preview ?
              </Link>
              <button className="button secondary full" type="button" disabled>
                Disable link
              </button>
            </>
          ) : (
            <button className="button secondary full" type="button" disabled>
              Enable sharing
            </button>
          )}
          <hr />
          <button className="button full" type="button" disabled>
            {note ? "Save changes" : "Create note"}
          </button>
          {note && (
            <button className="delete-button" type="button" disabled>
              Delete note
            </button>
          )}
          <p className="hint">Editing, saving, and sharing are placeholders.</p>
        </aside>
      </div>
    </>
  );
}
