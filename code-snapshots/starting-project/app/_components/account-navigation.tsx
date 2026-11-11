"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../_lib/auth-client";

export function AccountNavigation({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/login");
          router.refresh();
        },
        onError() {
          setIsSigningOut(false);
        },
      },
    });
  }

  return (
    <nav aria-label="Account">
      <span className="account-name">{userName}</span>
      <button className="button small" type="button" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? "Logging out…" : "Log out"}
      </button>
    </nav>
  );
}
