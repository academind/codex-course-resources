import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}
