import { AuthForm } from "../_components/auth-form";
import { getCurrentSession } from "../_lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Register" };

export default async function RegisterPage() {
  if (await getCurrentSession()) {
    redirect("/notes");
  }

  return <AuthForm register />;
}
