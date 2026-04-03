import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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
  if (!authSecret) {
    return {
      authorized: false,
      response: NextResponse.json(
        { message: "Configuração do NEXTAUTH_SECRET ausente." },
        { status: 500 }
      ),
    };
  }

  const token = (await getToken({ req, secret: authSecret })) as
    | { role?: string; sub?: string; [key: string]: unknown }
    | null;

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ message: "Não autorizado." }, { status: 401 }),
    };
  }

  const role = token.role;
  if (!role || !allowedRoles.includes(role)) {
    return {
      authorized: false,
      response: NextResponse.json({ message: "Acesso negado." }, { status: 403 }),
    };
  }

  return { authorized: true, token };
}
