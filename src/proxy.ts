import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/shared/config/env";
import { isJwtExpired } from "@/shared/lib/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/shared/infrastructure/session/access-token-cookie";

/**
 * Proxy (dulu bernama middleware) berjalan sebelum halaman dirender.
 * Saat AUTH_MODE=api, halaman yang butuh login langsung diarahkan ke /login kalau
 * cookie token tidak ada, rusak, atau sudah kedaluwarsa. Cookie yang sudah tidak berguna ikut dihapus.
 *
 * Ini hanya pengecekan cepat (sesuai dokumentasi Next: "optimistic check"). Proxy tidak memeriksa
 * tanda tangan token. Penjaga yang sesungguhnya tetap backend, yang membalas 401 untuk token palsu.
 */
export function proxy(request: NextRequest) {
  if (env.AUTH_MODE !== "api") return NextResponse.next();

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token && !isJwtExpired(token)) return NextResponse.next();

  const response = NextResponse.redirect(new URL("/login", request.url));
  if (token) response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}

/** Halaman di grup (app) dan onboarding. Halaman Login, Daftar, dan reset password tidak dijaga. */
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/transactions/:path*",
    "/accounts/:path*",
    "/budget/:path*",
    "/insights/:path*",
    "/quick-add/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
