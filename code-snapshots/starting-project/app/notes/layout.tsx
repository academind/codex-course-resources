import { redirect } from "next/navigation";
import { getCurrentSession } from "../_lib/session";

export default async function NotesLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="workspace">
      <div className="preview-banner">
        Sample notebook <span>Preview only · Changes are not saved</span>
      </div>
      {children}
    </div>
  );
}
