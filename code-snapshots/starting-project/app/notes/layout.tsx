export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="workspace">
      <div className="preview-banner">
        Sample notebook <span>Preview only · Changes are not saved</span>
      </div>
      {children}
    </div>
  );
}
