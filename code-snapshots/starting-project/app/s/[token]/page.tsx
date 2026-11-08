import Link from "next/link";
import { notFound } from "next/navigation";
import { notes, sampleToken } from "../../_lib/fixtures";
export const metadata = { title: "Shared note" };
export default async function SharedNotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token !== sampleToken) notFound();
  const note = notes[0];
  return (
    <>
      <p className="eyebrow">A THOUGHT WORTH SHARING</p>
      <article className="card shared-article">
        <span className="badge shared">Shared note · Sample</span>
        <h1>{note.title}</h1>
        <p className="note-date">Updated {note.date} · Read only</p>
        <hr />
        <div className="prose">
          {note.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>
      <p className="shared-caption">A little inspiration, shared with TinyNotes.</p>
      <Link className="preview-link" href="/register">
        Make a space for your own thoughts ?
      </Link>
    </>
  );
}
