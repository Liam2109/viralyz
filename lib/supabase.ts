import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

let browserClient: SupabaseClient | null = null;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!;
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}

export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!browserClient) browserClient = createBrowserSupabaseClient();
    const value = browserClient[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(browserClient) : value;
  },
});

export function getSupabase(): SupabaseClient {
  if (!browserClient) browserClient = createBrowserSupabaseClient();
  return browserClient;
}
