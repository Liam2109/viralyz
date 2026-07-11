export type PlatformKey = "youtube" | "tiktok" | "instagram" | "x" | null;

export function detectPlatformFromUrl(url: string): PlatformKey {
  if (!url.trim()) return null;
  const lower = url.toLowerCase();
  if (/youtube\.com|youtu\.be/.test(lower)) return "youtube";
  if (/tiktok\.com/.test(lower)) return "tiktok";
  if (/instagram\.com/.test(lower)) return "instagram";
  if (/x\.com|twitter\.com/.test(lower)) return "x";
  return null;
}

export function isNonYouTubeUrl(url: string): boolean {
  const platform = detectPlatformFromUrl(url);
  return platform !== null && platform !== "youtube";
}

export const PLATFORM_LABELS: Record<Exclude<PlatformKey, null>, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
};

export const PLATFORM_COLORS: Record<Exclude<PlatformKey, null>, string> = {
  youtube: "#FF0000",
  tiktok: "#000000",
  instagram: "#E4405F",
  x: "#000000",
};
