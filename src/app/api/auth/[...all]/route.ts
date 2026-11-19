import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
// Meneruskan endpoint GET dan POST autentikasi ke handler Better Auth.
export const { GET, POST } = toNextJsHandler(auth);
