export function LoadingPreview({ shared = false }: { shared?: boolean }) {
  return (
    <div className="loading-state" role="status">
      <p className="eyebrow">
        {shared ? "OPENING A LITTLE INSPIRATION" : "MAKING ROOM FOR YOUR THOUGHTS"}
      </p>
      <p>{shared ? "Loading shared note…" : "Loading notes…"}</p>
      <div className="card skeleton-card" aria-hidden="true">
        <div className="skeleton short" />
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton short" />
      </div>
    </div>
  );
}
