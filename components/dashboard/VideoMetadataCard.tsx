"use client";

import { formatViewCount } from "@/lib/dashboard-utils";

export interface VideoMetaProps {
  thumbnail?: string;
  videoTitle?: string | null;
  channel?: string;
  duration?: string;
  views?: number;
  likes?: number;
  comments?: number;
  detectedLanguage?: string;
  detectedNiche?: string;
  detectedTone?: string;
}

export default function VideoMetadataCard({
  thumbnail,
  videoTitle,
  channel,
  duration,
  views,
  likes,
  comments,
  detectedLanguage,
  detectedNiche,
  detectedTone,
}: VideoMetaProps) {
  if (!thumbnail) return null;

  return (
    <div className="animate-fade-up flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt=""
        className="h-auto w-full shrink-0 rounded-lg object-cover sm:w-40"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-foreground line-clamp-2">
          {videoTitle ?? "Vidéo analysée"}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {channel && <span>{channel}</span>}
          {channel && duration && " · "}
          {duration && <span>{duration}</span>}
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {views != null && <span>👁 {formatViewCount(views)}</span>}
          {likes != null && <span>👍 {formatViewCount(likes)}</span>}
          {comments != null && <span>💬 {formatViewCount(comments)}</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {detectedLanguage && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
              {detectedLanguage}
            </span>
          )}
          {detectedNiche && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs text-accent-light">
              {detectedNiche}
            </span>
          )}
          {detectedTone && (
            <span className="rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-0.5 text-xs text-secondary">
              {detectedTone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
