"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "#how-it-works", label: "Comment ça marche" },
  { href: "#demo", label: "Démo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

interface NavbarProps {
  variant?: "landing" | "minimal";
}

export default function Navbar({ variant = "landing" }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Viralyz
          </span>
        </Link>

        {variant === "landing" && (
          <>
            <ul className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="btn-animated rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                Start free
              </Link>
            </div>

            <button
              type="button"
              className="flex flex-col gap-1.5 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <span className="block h-0.5 w-6 bg-foreground" />
              <span className="block h-0.5 w-6 bg-foreground" />
              <span className="block h-0.5 w-6 bg-foreground" />
            </button>
          </>
        )}

        {variant === "minimal" && (
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            Dashboard
          </Link>
        )}
      </nav>

      {variant === "landing" && open && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/login" className="text-sm text-muted">
                Connexion
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="btn-animated inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                Start free
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
