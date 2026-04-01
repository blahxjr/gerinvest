import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/cadastro", "/esqueci-senha", "/api/auth", "/api/auth/", "/api/auth/signin", "/api/auth/callback"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protege a rota /(app)/* e qualquer rota não pública
  if (pathname.startsWith("/(app)") || pathname !== "/") {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(app)(.*)", "/login", "/cadastro", "/esqueci-senha"],
};
