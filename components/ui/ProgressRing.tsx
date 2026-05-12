'use client';

import { useStore } from '@/lib/store';
import { SECTIONS } from '@/lib/season';
import { scrollToProgress } from '@/lib/scroll';
import { useEffect, useState } from 'react';

/**
 * Right-edge year-cycle indicator. A circle that fills clockwise as the year
 * progresses. Five clickable tick marks for the five sections.
 *
 * Designed to feel like a print page number, not a corporate progress bar.
 */
export default function ProgressRing() {
  const progress = useStore((s) => s.scrollProgress);
  const siteLoaded = useStore((s) => s.siteLoaded);
  const [visible, setVisible] = useState(false);
  const R = 22;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    if (siteLoaded) setVisible(true);
  }, [siteLoaded]);

  if (!visible) return null;

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 select-none"
      aria-label="Year progress"
    >
      <div className="relative w-[58px] h-[58px]" data-magnetic>
        <svg viewBox="0 0 58 58" className="w-full h-full -rotate-90">
          <circle cx="29" cy="29" r={R} stroke="rgba(245,241,232,0.18)" strokeWidth="1" fill="none" />
          <circle
            cx="29" cy="29" r={R}
            stroke="var(--amber)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
          />
          {/* tick marks */}
          {SECTIONS.map((s) => {
            const a = s.seasonAt * Math.PI * 2;
            const x1 = 29 + Math.cos(a) * (R - 3);
            const y1 = 29 + Math.sin(a) * (R - 3);
            const x2 = 29 + Math.cos(a) * (R + 3);
            const y2 = 29 + Math.sin(a) * (R + 3);
            return (
              <line
                key={s.id}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(245,241,232,0.55)"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="numeral text-[11px] text-bone/80 tabular">
            {Math.round(progress * 100).toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        {SECTIONS.map((s) => {
          const active = progress >= s.seasonAt - 0.08 && progress < s.seasonAt + 0.18;
          return (
            <button
              key={s.id}
              data-magnetic
              onClick={() => scrollToProgress(s.seasonAt)}
              className="group flex items-center gap-2 px-1 py-0.5 transition"
              aria-label={`Jump to ${s.label}`}
            >
              <span className={`smallcaps text-[10px] ${active ? 'text-amber' : 'text-bone/40 group-hover:text-bone/90'} transition`}>
                {s.numeral}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
