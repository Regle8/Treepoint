'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

type Props = {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  splitBy?: 'word' | 'char';
  stagger?: number;
  delay?: number;
  trigger?: 'self' | 'view';
};

/**
 * Word-by-word reveal triggered by intersection (or immediately for `trigger="self"`).
 * Pure CSS transitions, no GSAP.
 *
 * Holds the "visible" state until `siteLoaded` is true so reveals don't fire
 * while the TreeRings loading overlay still covers the page.
 */
export default function SplitReveal({
  children,
  as = 'span',
  className = '',
  splitBy = 'word',
  stagger = 0.05,
  delay = 0,
  trigger = 'view',
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [intersected, setIntersected] = useState(trigger === 'self');
  const siteLoaded = useStore((s) => s.siteLoaded);

  const parts =
    splitBy === 'word'
      ? children.split(/(\s+)/)
      : Array.from(children);

  useEffect(() => {
    if (trigger === 'self') {
      setIntersected(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIntersected(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIntersected(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [trigger]);

  const visible = intersected && siteLoaded;

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref as React.MutableRefObject<HTMLElement>}
      className={className}
      style={{ perspective: 800 }}
    >
      {parts.map((p, i) => {
        if (splitBy === 'word' && /^\s+$/.test(p)) return <span key={i}>{p}</span>;
        const partDelay = delay + i * stagger;
        return (
          <span
            key={i}
            className="split-word"
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              transform: visible
                ? 'translate3d(0, 0, 0) rotateX(0deg)'
                : 'translate3d(0, 0.7em, 0) rotateX(20deg)',
              opacity: visible ? 1 : 0,
              transition: `transform 1s cubic-bezier(0.22, 1, 0.36, 1) ${partDelay}s, opacity 0.9s ease ${partDelay}s`,
              transformOrigin: '50% 100%',
            }}
          >
            {p}
          </span>
        );
      })}
    </Tag>
  );
}
