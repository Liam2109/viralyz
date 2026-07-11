interface PlatformIconsProps {
  size?: "sm" | "md";
}

export function PlatformIcons({ size = "md" }: PlatformIconsProps) {
  const iconSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div className="flex items-center justify-center gap-4">
      {/* YouTube */}
      <div className="flex flex-col items-center gap-1" title="YouTube">
        <div
          className={`${iconSize} flex items-center justify-center rounded-md`}
          style={{ color: "#FF0000" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
        <span className="text-[10px] text-muted">YouTube</span>
      </div>
      {/* TikTok */}
      <div className="flex flex-col items-center gap-1" title="TikTok">
        <div
          className={`${iconSize} flex items-center justify-center rounded-md bg-white`}
        >
          <svg viewBox="0 0 24 24" fill="#000000" className="h-full w-full">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
          </svg>
        </div>
        <span className="text-[10px] text-muted">TikTok</span>
      </div>
      {/* Instagram */}
      <div className="flex flex-col items-center gap-1" title="Instagram">
        <div className={`${iconSize} flex items-center justify-center rounded-md`}>
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <defs>
              <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80" />
                <stop offset="25%" stopColor="#F77737" />
                <stop offset="50%" stopColor="#E4405F" />
                <stop offset="75%" stopColor="#C13584" />
                <stop offset="100%" stopColor="#833AB4" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)" />
            <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
          </svg>
        </div>
        <span className="text-[10px] text-muted">Instagram</span>
      </div>
      {/* X */}
      <div className="flex flex-col items-center gap-1" title="X">
        <div
          className={`${iconSize} flex items-center justify-center rounded-md bg-white`}
        >
          <svg viewBox="0 0 24 24" fill="#000000" className="h-full w-full">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <span className="text-[10px] text-muted">X</span>
      </div>
    </div>
  );
}

export function PlatformIconSingle({
  platform,
  className = "h-5 w-5",
}: {
  platform: "youtube" | "tiktok" | "instagram" | "x" | null;
  className?: string;
}) {
  if (!platform) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  }

  const icons: Record<string, React.ReactNode> = {
    youtube: (
      <svg viewBox="0 0 24 24" fill="#FF0000" className={className}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="#000000" className={`${className} bg-white rounded`}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" className={className}>
        <defs>
          <linearGradient id="ig-single" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="50%" stopColor="#E4405F" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-single)" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24" fill="#000000" className={`${className} bg-white rounded`}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  };

  return <>{icons[platform]}</>;
}
