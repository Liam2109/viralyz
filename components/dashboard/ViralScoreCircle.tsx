"use client";

import { useEffect, useState } from "react";
import { getViralScoreStrokeColor } from "@/lib/dashboard-utils";

const R = 45;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function ViralScoreCircle({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getViralScoreStrokeColor(score);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1500;
    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-muted">Score viral</p>
      <div className="relative mt-3 h-36 w-36 sm:h-40 sm:w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r={R} fill="none" stroke="#1E1E2E" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={
              {
                strokeDashoffset: CIRCUMFERENCE - (displayScore / 100) * CIRCUMFERENCE,
                transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease",
              } as React.CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {displayScore}
          </span>
          <span className="text-sm text-muted">/100</span>
        </div>
      </div>
    </div>
  );
}
