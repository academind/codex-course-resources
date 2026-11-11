"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "../_lib/auth-client";

export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    const result = register
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      setError(
        register
          ? "We could not create your account. Check your details and try again."
          : "The email address or password is incorrect.",
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/notes");
    router.refresh();
  }

  return (
    <section className="auth-grid">
      <div className="auth-intro">
        <p className="eyebrow">YOUR THOUGHTS, AT HOME</p>
        <h1>
          Small notes.
          <br />A clearer mind.
        </h1>
        <p>A quiet place to collect ideas, keep what matters, and share a little inspiration.</p>
        <div className="paper">
          <span className="eyebrow">A NOTE TO SELF</span>
          <h2>Make room for good ideas.</h2>
          <p>
            You don’t need the perfect words.
            <br />
            Just a place to start.
          </p>
        </div>
      </div>
      <div className="card auth-card">
        <p className="eyebrow">{register ? "A FRESH PAGE" : "YOUR OWN LITTLE CORNER"}</p>
        <h2>{register ? "Create your account" : "Welcome back"}</h2>
        <p>
          {register
            ? "Give your thoughts a place to land."
            : "Pick up where your thoughts left off."}
        </p>
        <form aria-label={register ? "Create your account" : "Log in"} onSubmit={handleSubmit}>
          {register && (
            <label>
              Name
              <input
                name="name"
                autoComplete="name"
                placeholder="Alex Morgan"
                required
                disabled={isSubmitting}
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </label>
          <button className="button full" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? register
                ? "Creating account…"
                : "Logging in…"
              : register
                ? "Create account"
                : "Log in"}
          </button>
          {error && (
            <p className="validation" role="alert">
              {error}
            </p>
          )}
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to TinyNotes?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  );
}
