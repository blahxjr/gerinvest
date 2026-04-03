import { NextResponse } from "next/server";

export function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}
