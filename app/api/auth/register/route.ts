import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const existing = await findUserByEmail(body.email);
  if (existing) {
    return NextResponse.json({ error: "email_already_exists" }, { status: 409 });
  }

  const user = await createUser(body.name, body.email, body.password);
  return NextResponse.json({ user }, { status: 201 });
}
