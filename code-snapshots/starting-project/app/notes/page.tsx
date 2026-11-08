import Link from "next/link";
import { notes } from "../_lib/fixtures";
export const metadata = { title: "Your notes" };
export default function NotesPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A LITTLE SPACE, JUST FOR YOU</p>
          <h1>Your notes</h1>
          <p>Ideas, plans, and everything in between.</p>
        </div>
        <Link href="/notes/new" className="button">
          + New note
        </Link>
      </div>
      <div className="list-caption">
        <span>All notes</span>
        <span>3 notes · Recently updated</span>
      </div>
      <div className="note-grid">
        {notes.map((note) => (
          <Link className="card note-card" href={`/notes/${note.id}`} key={note.id}>
            <span className={`badge ${note.shared ? "shared" : ""}`}>
              {note.shared ? "Shared" : "Private"}
            </span>
            <h2>{note.title}</h2>
            <p>{note.excerpt}</p>
            <div className="note-date">
              {note.date}
              <span aria-hidden="true">?</span>
            </div>
          </Link>
        ))}
      </div>
      <details className="empty-preview">
        <summary>Preview an empty notebook</summary>
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            ?
          </span>
          <h2>A fresh page awaits</h2>
          <p>Your ideas belong here. Start with your first note.</p>
          <Link href="/notes/new" className="button">
            Create a note
          </Link>
        </div>
      </details>
    </>
  );
}
