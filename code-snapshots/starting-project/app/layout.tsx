import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TinyNotes", template: "%s | TinyNotes" },
  description: "A little space for your thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <header>
          <div className="header-inner">
            <Link className="logo" href="/">
              TinyNotes<span>.</span>
            </Link>
            <nav aria-label="Account">
              <Link href="/login">Login</Link>
              <Link className="button small" href="/register">
                Register
              </Link>
            </nav>
          </div>
        </header>
        <main id="content">{children}</main>
        <footer>TinyNotes · A little space for your thoughts.</footer>
      </body>
    </html>
  );
}
