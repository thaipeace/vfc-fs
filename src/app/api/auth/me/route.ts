import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;

  if (!session) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return Response.json({
    user: {
      id: session.sub,
      phone: session.phone,
      role: session.role,
    },
  });
}
