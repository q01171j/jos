import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

const AUTH_PATHS = ["/login"];
const PROTECTED_PATHS = ["/dashboard", "/incidents", "/reports", "/settings"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        res.cookies.set({ name, value, ...options });
      });
    }
  };

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: cookieMethods
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.delete("redirect");
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/incidents/:path*", "/reports/:path*", "/settings/:path*", "/login"]
};
