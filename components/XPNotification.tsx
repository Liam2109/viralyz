"use client"
import { useEffect, useState } from "react"

interface XPNotificationProps {
  xp: number
  badge?: { emoji: string; label: string }
  onClose: () => void
}

export function XPNotification({ xp, badge, onClose }: XPNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-surface px-4 py-3 shadow-xl animate-fade-up">
        <span className="text-2xl">⚡</span>
        <div>
          <p className="text-sm font-bold text-accent">+{xp} XP gagné !</p>
          <p className="text-xs text-muted">Continue comme ça 🚀</p>
        </div>
      </div>
      {badge && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 shadow-xl animate-fade-up">
          <span className="text-2xl">{badge.emoji}</span>
          <div>
            <p className="text-sm font-bold text-yellow-400">Badge débloqué !</p>
            <p className="text-xs text-muted">{badge.label}</p>
          </div>
        </div>
      )}
    </div>
  )
}
