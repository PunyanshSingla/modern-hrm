
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
