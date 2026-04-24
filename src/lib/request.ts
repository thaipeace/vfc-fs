import { NextRequest } from "next/server";
import { Role } from "@prisma/client";

export type RequestUser = {
  id: string;
  phone: string;
  role: Role;
};

/**
 * Extract user injected by middleware from request headers.
 * Returns null only if middleware was bypassed (should not happen in practice).
 */
export function getRequestUser(request: NextRequest): RequestUser | null {
  const id = request.headers.get("x-user-id");
  const phone = request.headers.get("x-user-phone");
  const role = request.headers.get("x-user-role") as Role | null;

  if (!id || !phone || !role) return null;
  return { id, phone, role };
}

export function requireRole(user: RequestUser, ...roles: Role[]): boolean {
  return roles.includes(user.role);
}

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function apiOk<T>(data: T, status = 200) {
  return Response.json(data, { status });
}
