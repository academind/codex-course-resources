import { AuthForm } from "../_components/auth-form";
import { getCurrentSession } from "../_lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentSession()) {
    redirect("/notes");
  }

  return <AuthForm />;
}
