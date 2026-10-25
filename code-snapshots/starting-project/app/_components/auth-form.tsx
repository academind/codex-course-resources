import Link from "next/link";
export function AuthForm({ register = false }: { register?: boolean }) {
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
        <form aria-label={register ? "Registration preview" : "Login preview"}>
          {register && (
            <label>
              Name
              <input autoComplete="name" placeholder="Alex Morgan" disabled />
            </label>
          )}
          <label>
            Email address
            <input type="email" autoComplete="email" placeholder="you@example.com" disabled />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              placeholder="Enter your password"
              disabled
            />
          </label>
          <button className="button full" type="button" disabled>
            {register ? "Create account" : "Log in"}
          </button>
          <p className="hint">Static preview · Account forms are not connected.</p>
          <details className="validation">
            <summary>Example validation message</summary>
            <p>Please check your email address and password.</p>
          </details>
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to TinyNotes?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
        <Link className="preview-link" href="/notes">
          Explore the sample notebook ?
        </Link>
      </div>
    </section>
  );
}
