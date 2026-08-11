export interface ApifyVideoData {
  title: string | null;
  thumbnail: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  duration: string | null;
  channel: string | null;
  transcript: string | null;
}

async function runApifyActor(actorId: string, input: object): Promise<unknown> {
  const token = process.env.APIFY_API_TOKEN!;
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) throw new Error(`Apify error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data[0] : null;
}

export async function fetchTikTokData(url: string): Promise<ApifyVideoData | null> {
  try {
    const raw = await runApifyActor("clockworks~tiktok-scraper", {
      postURLs: [url],
      resultsPerPage: 1,
    }) as Record<string, unknown> | null;

    console.log("APIFY TIKTOK RAW:", JSON.stringify(raw, null, 2));

    if (!raw) return null;

    return {
      title: (raw.text as string) ?? null,
      thumbnail: (raw.covers as { default?: string })?.default ?? null,
      views: (raw.playCount as number) ?? null,
      likes: (raw.diggCount as number) ?? null,
      comments: (raw.commentCount as number) ?? null,
      duration: raw.videoMeta ? `${(raw.videoMeta as { duration?: number }).duration ?? 0}s` : null,
      channel: (raw.authorMeta as { name?: string })?.name ?? null,
      transcript: null,
    };
  } catch (err) {
    console.error("APIFY TIKTOK ERROR:", err);
    return null;
  }
}

export async function fetchInstagramData(url: string): Promise<ApifyVideoData | null> {
  try {
    const raw = await runApifyActor("apify~instagram-reel-scraper", {
      directUrls: [url],
      resultsLimit: 1,
    }) as Record<string, unknown> | null;

    if (!raw) return null;

    return {
      title: (raw.caption as string) ?? null,
      thumbnail: (raw.displayUrl as string) ?? null,
      views: (raw.videoPlayCount as number) ?? null,
      likes: (raw.likesCount as number) ?? null,
      comments: (raw.commentsCount as number) ?? null,
      duration: raw.videoDuration ? `${raw.videoDuration}s` : null,
      channel: (raw.ownerUsername as string) ?? null,
      transcript: null,
    };
  } catch (err) {
    console.error("APIFY INSTAGRAM ERROR:", err);
    return null;
  }
}