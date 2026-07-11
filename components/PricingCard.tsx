import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  discrete?: boolean;
  cta: string;
  href: string;
}

export default function PricingCard({
  name,
  price,
  period = "/mois",
  description,
  features,
  highlighted = false,
  discrete = false,
  cta,
  href,
}: PricingCardProps) {
  return (
    <div
      className={`pricing-card relative flex flex-col rounded-2xl border p-6 ${
        highlighted
          ? "pricing-card-highlighted border-accent bg-surface z-10"
          : discrete
            ? "pricing-card-discrete border-border/60 bg-surface/50"
            : "border-border bg-surface"
      }`}
    >
      {highlighted && (
        <span className="badge-populaire absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-accent bg-accent px-4 py-1 text-xs font-semibold text-white">
          Populaire
        </span>
      )}
      <h3
        className={`text-lg font-semibold ${discrete ? "text-muted" : "text-foreground"}`}
      >
        {name}
      </h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span
          className={`text-4xl font-bold ${discrete ? "text-muted" : "text-foreground"}`}
        >
          {price}
        </span>
        {price !== "0€" && (
          <span className="text-sm text-muted">{period}</span>
        )}
      </div>
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-muted">
            <svg
              className={`mt-0.5 h-4 w-4 shrink-0 ${discrete ? "text-muted" : "text-secondary"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`btn-animated mt-8 block rounded-lg py-2.5 text-center text-sm font-medium ${
          highlighted
            ? "bg-accent text-white hover:bg-accent-dark"
            : discrete
              ? "border border-border/60 text-muted hover:border-accent-light hover:text-foreground"
              : "border border-border text-foreground hover:border-accent-light"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
