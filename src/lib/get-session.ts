import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Retrieve the current session on the server and optionally enforce a role.
 * Throws if the user is not authenticated or does not have the required role.
 */
export async function requireRole(role: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== role) {
    throw new Error("Forbidden");
  }

  return session;
}
