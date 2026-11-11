import type { Metadata } from "next";
import Link from "next/link";
import { AccountNavigation } from "./_components/account-navigation";
import { getCurrentSession } from "./_lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TinyNotes", template: "%s | TinyNotes" },
  description: "A little space for your thoughts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

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
            {session ? (
              <AccountNavigation userName={session.user.name} />
            ) : (
              <nav aria-label="Account">
                <Link href="/login">Login</Link>
                <Link className="button small" href="/register">
                  Register
                </Link>
              </nav>
            )}
          </div>
        </header>
        <main id="content">{children}</main>
        <footer>TinyNotes · A little space for your thoughts.</footer>
      </body>
    </html>
  );
}
