export function PlatformSupportBadges() {
  const badges = [
    { name: "YouTube", emoji: "✅", status: "Supporté", supported: true },
    { name: "TikTok", emoji: "🔜", status: "Bientôt", supported: false },
    { name: "Instagram", emoji: "🔜", status: "Bientôt", supported: false },
    { name: "X", emoji: "🔜", status: "Bientôt", supported: false },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((badge) => (
        <span
          key={badge.name}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            badge.supported
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-border bg-surface text-muted"
          }`}
        >
          {badge.name} {badge.emoji}
          <span className={badge.supported ? "text-green-400" : "text-muted"}>
            {badge.status}
          </span>
        </span>
      ))}
    </div>
  );
}
