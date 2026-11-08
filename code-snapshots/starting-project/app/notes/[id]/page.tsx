import { notFound } from "next/navigation";
import { NoteEditor } from "../../_components/note-editor";
import { notes } from "../../_lib/fixtures";
export const metadata = { title: "Note" };
export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = notes.find((note) => note.id === id);
  if (!note) notFound();
  return <NoteEditor note={note} />;
}
