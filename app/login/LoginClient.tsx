"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const redirect = searchParams.get("redirect") ?? "/dashboard";
    const url = searchParams.get("url");
    window.location.href = url
      ? `${redirect}?url=${encodeURIComponent(url)}`
      : redirect;
  }

  async function handleGoogleLogin() {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">V</span>
            <span className="text-xl font-semibold text-foreground">Viralyz</span>
          </Link>
          <h1 className="mt-8 text-2xl font-bold text-foreground">Se connecter</h1>
          <p className="mt-2 text-sm text-muted">Accédez à votre dashboard d&apos;analyses virales.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-border bg-surface p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-muted">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="text-sm font-medium text-muted">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Se connecter..." : "Se connecter"}
          </button>

          <div className="mt-4">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />
              <span className="bg-surface px-3 text-xs text-muted absolute">ou</span>
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-accent transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A353" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
              </svg>
              Continuer avec Google
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-accent hover:underline">S&apos;inscrire</Link>
        </p>
      </div>
    </div>
  );
}