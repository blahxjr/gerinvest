import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

export type GuardResult = {
  authorized: boolean;
  response?: NextResponse;
  token?: { role?: string; sub?: string; [key: string]: unknown };
};

export async function requireAuth(
  req: NextRequest,
  allowedRoles: string[] = ["ADMIN", "ADVISOR", "CLIENT"]
): Promise<GuardResult> {
  const getSessionUser = async (): Promise<{ id: string; role?: string } | null> => {
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) return null;

    const sessionQuery = `
      SELECT u.id, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.session_token = $1
        AND s.expires > NOW()
      LIMIT 1
    `;
    const sessionResult = await pool.query(sessionQuery, [sessionToken]);
    return (sessionResult.rows[0] as { id: string; role?: string } | undefined) ?? null;
  };

  const token = authSecret
    ? ((await getToken({ req, secret: authSecret })) as
        | { role?: string; sub?: string; [key: string]: unknown }
        | null)
    : null;

  const tokenRole = token?.role;
  if (token && tokenRole && allowedRoles.includes(tokenRole)) {
    return { authorized: true, token };
  }

  const sessionUser = await getSessionUser();
  if (sessionUser?.role && allowedRoles.includes(sessionUser.role)) {
    return {
      authorized: true,
      token: {
        sub: sessionUser.id,
        role: sessionUser.role,
      },
    };
  }

  if (!token && !sessionUser) {
    return {
      authorized: false,
      response: NextResponse.json({ message: "Não autorizado." }, { status: 401 }),
    };
  }

  return {
    authorized: false,
    response: NextResponse.json({ message: "Acesso negado." }, { status: 403 }),
  };
}
