import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware is disabled in favor of explicit route-level guard via api/auth and requireAuth.
// Keep this file for backwards compatibility; no routing decisions are made here.

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
