import "server-only";

import { betterAuth } from "better-auth";
import { database } from "./db";

export const auth = betterAuth({
  appName: "TinyNotes",
  database,
  baseURL: process.env.APP_URL,
  secret: process.env.AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
});
