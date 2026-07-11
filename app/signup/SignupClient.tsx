"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [niche, setNiche] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { name, niche: niche.trim() || undefined },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await getSupabase().auth.getSession();

    if (session) {
      await fetch("/api/auth/setup-user", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }

    const plan = searchParams.get("plan");
    if (plan === "creator" || plan === "pro") {
      if (session) {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
              V
            </span>
            <span className="text-xl font-semibold text-foreground">Viralyz</span>
          </Link>
          <h1 className="mt-8 text-2xl font-bold text-foreground">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-muted">
            2 crédits gratuits par mois — sans carte bancaire.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-border bg-surface p-8"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-sm font-medium text-muted">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="Votre nom"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="text-sm font-medium text-muted">
              Email
            </label>
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
            <label htmlFor="niche" className="text-sm font-medium text-muted">
              Votre niche principale{" "}
              <span className="text-xs text-muted/70">(optionnel)</span>
            </label>
            <input
              id="niche"
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="ex: productivité, fitness, finance..."
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="text-sm font-medium text-muted">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="Min. 6 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white btn-animated disabled:opacity-50"
          >
            {loading ? "Création..." : "Start free"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
