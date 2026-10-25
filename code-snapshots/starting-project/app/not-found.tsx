import Link from "next/link";
export default function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">404 · A MISSING PAGE</p>
      <h1>This page slipped away.</h1>
      <p>The page or note you’re looking for isn’t available.</p>
      <Link href="/notes" className="button">
        Back to sample notes
      </Link>
    </section>
  );
}
