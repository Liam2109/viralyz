"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Turnstile } from "@marsidev/react-turnstile";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!turnstileToken) {
      setError("Vérification anti-bot requise.");
      setLoading(false);
      return;
    }

    const verifyRes = await fetch("/api/auth/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: turnstileToken }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      setError("Vérification anti-bot échouée. Réessayez.");
      setLoading(false);
      return;
    }

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
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="vous@exemple.com" />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="text-sm font-medium text-muted">Mot de passe</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="••••••••" />
          </div>

          <div className="mt-4 flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setTurnstileToken(token)}
            />
          </div>

          <button type="submit" disabled={loading || !turnstileToken}
            className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? "Se connecter..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-accent hover:underline">S&apos;inscrire</Link>
        </p>
      </div>
    </div>
  );
}