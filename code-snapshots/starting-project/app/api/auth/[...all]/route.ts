import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../_lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
