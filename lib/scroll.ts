'use client';

import { useEffect } from 'react';
import { useStore } from './store';

/**
 * Plain window scroll listener writing scrollProgress (0..1) to the store.
 * Runs on rAF so the scene reads a fresh value every frame.
 */
export const useScrollProgress = () => {
  const setScrollProgress = useStore((s) => s.setScrollProgress);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let raf = 0;
    let target = 0;
    let current = 0;

    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? window.scrollY / max : 0;
    };

    const tick = () => {
      // light easing so the scene flows even after the user stops
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0001) current = target;
      setScrollProgress(current);
      raf = requestAnimationFrame(tick);
    };

    compute();
    current = target;
    setScrollProgress(current);

    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [setScrollProgress]);
};

export const scrollToProgress = (p: number) => {
  if (typeof window === 'undefined') return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: p * max, behavior: 'smooth' });
};

export const scrollToSection = (id: string) => {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
