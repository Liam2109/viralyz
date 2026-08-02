"use client"
import { useState } from "react"

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 rounded-lg bg-surface border border-border px-3 py-2 text-xs text-muted shadow-xl">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface" />
        </div>
      )}
    </div>
  )
}
