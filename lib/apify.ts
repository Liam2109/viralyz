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

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runRes.ok) {
    console.error("APIFY RUN ERROR:", runRes.status, await runRes.text());
    return null;
  }

  const runData = await runRes.json() as { data?: { id?: string } };
  const runId = runData?.data?.id;

  if (!runId) {
    console.error("APIFY NO RUN ID");
    return null;
  }

  console.log("APIFY RUN ID:", runId);

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2500));

    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
    );
    const statusData = await statusRes.json() as { data?: { status?: string } };
    const status = statusData?.data?.status;

    console.log("APIFY STATUS:", status);

    if (status === "SUCCEEDED") {
      const itemsRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}`
      );
      const items = await itemsRes.json();
      console.log("APIFY TIKTOK KEYS:", Object.keys(Array.isArray(items) ? (items[0] ?? {}) : {}));
      return Array.isArray(items) ? items[0] : null;
    }

    if (status === "FAILED" || status === "ABORTED") {
      console.error("APIFY RUN FAILED:", status);
      return null;
    }
  }

  console.error("APIFY TIMEOUT");
  return null;
}

export async function fetchTikTokData(url: string): Promise<ApifyVideoData | null> {
  try {
    const raw = await runApifyActor("clockworks~tiktok-scraper", {
      postURLs: [url],
      resultsPerPage: 1,
    }) as Record<string, unknown> | null;

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