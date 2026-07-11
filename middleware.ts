import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createMiddlewareSupabaseClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
