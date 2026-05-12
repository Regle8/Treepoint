'use client';

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  /** Optional small leading marker — e.g. "01", "04" — rendered as a numeral. */
  numeral?: string;
  /** The clickable summary line. */
  summary: ReactNode;
  children: ReactNode;
};

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Editorial accordion row. Parent owns open state so a group can enforce
 * "only one open at a time" semantics. Smooth height transition; respects
 * prefers-reduced-motion (snaps open/closed instantly).
 */
export default function Disclosure({ isOpen, onToggle, numeral, summary, children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useIsoLayoutEffect(() => {
    if (!contentRef.current) return;
    setHeight(isOpen ? contentRef.current.scrollHeight : 0);
  }, [isOpen, children]);

  // Re-measure on window resize so reflowing copy doesn't get clipped.
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => {
      if (contentRef.current) setHeight(contentRef.current.scrollHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  return (
    <div className="disclosure border-b border-bone/15">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="disclosure-summary w-full flex items-baseline justify-between gap-6 py-7 md:py-8 text-left"
      >
        <span className="flex items-baseline gap-6 md:gap-10 min-w-0 flex-1">
          {numeral && (
            <span className="numeral text-sm md:text-base text-bone/55 tabular shrink-0 w-6 md:w-8">
              {numeral}
            </span>
          )}
          <span
            className={`font-display text-[clamp(1.15rem,2.2vw,1.6rem)] leading-[1.25] tracking-tight transition-colors duration-500 ${
              isOpen ? 'text-bone' : 'text-bone/85'
            }`}
            style={{ fontVariationSettings: "'opsz' 48, 'wght' 400" }}
          >
            {summary}
          </span>
        </span>
        <span
          className={`disclosure-icon shrink-0 ${isOpen ? 'open' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div
        className="disclosure-content"
        style={{
          height: reduced ? (isOpen ? 'auto' : 0) : `${height}px`,
          overflow: 'hidden',
          transition: reduced ? 'none' : 'height 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div ref={contentRef} className="disclosure-body pb-9 md:pl-14 pl-0 pr-4">
          {children}
        </div>
      </div>
    </div>
  );
}
