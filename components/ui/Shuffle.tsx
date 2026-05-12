'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Character-shuffle reveal. Used by the services list — hovering a service
 * shuffles random glyphs in the title before resolving to the real string.
 *
 * Honours reduced motion by skipping the shuffle.
 */
const GLYPHS = '·×∗+ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function Shuffle({ text, active }: { text: string; active: boolean }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const start = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOut(text);
      return;
    }
    cancelAnimationFrame(raf.current);
    start.current = performance.now();
    const duration = active ? 520 : 380;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start.current) / duration);
      let s = '';
      for (let i = 0; i < text.length; i++) {
        const charTime = i / text.length;
        if (t > charTime + 0.18) {
          s += text[i];
        } else if (text[i] === ' ') {
          s += ' ';
        } else {
          s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setOut(s);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, active]);

  return <span aria-label={text}>{out}</span>;
}
