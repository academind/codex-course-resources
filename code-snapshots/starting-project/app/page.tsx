import { getCurrentSession } from "./_lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getCurrentSession();
  redirect(session ? "/notes" : "/login");
}
