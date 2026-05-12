'use client';

import Image from 'next/image';
import SplitReveal from '@/components/ui/SplitReveal';
import { HERO } from '@/lib/copy';

export default function Hero() {
  return (
    <section
      id="hero"
      className="section-content relative min-h-screen flex flex-col justify-between p-8 md:p-14"
      aria-label="Hero"
    >
      {/* Masthead — full lockup SVG (icon on right) in white, top-right of hero. */}
      <div className="flex justify-end">
        <a
          href="#hero"
          aria-label="Treepoint Consultants, return to top"
          className="block leading-none"
        >
          <Image
            src="/logo/treepoint-lockup-white.svg"
            alt="Treepoint Consultants"
            width={4096}
            height={1749}
            priority
            className="h-12 md:h-20 w-auto"
          />
        </a>
      </div>

      {/* Headline — each line at a different indent, drifting right then left. */}
      <div className="relative grid grid-cols-12 gap-4 mt-auto mb-24">
        <h1
          className="col-span-12 md:col-span-11 md:col-start-1 font-display text-hero leading-[0.9] text-bone optical"
          style={{ fontVariationSettings: "'opsz' 144, 'wght' 400, 'SOFT' 50" }}
        >
          {(['', 'md:pl-[8%]', 'md:pl-[28%]', 'md:pl-[4%]'] as const).map((indent, i) => (
            <SplitReveal
              key={i}
              as="span"
              className={`block ${indent}`}
              splitBy="word"
              stagger={0.07}
              delay={i * 0.06}
              trigger="self"
            >
              {HERO.headline[i]}
            </SplitReveal>
          ))}
        </h1>
      </div>

      {/* Bottom row — sub paragraph + scroll hint */}
      <div className="flex justify-between items-end">
        <p className="max-w-md text-bone/75 text-sm md:text-base leading-relaxed font-light">
          {HERO.sub}
        </p>
        <div className="flex items-center gap-3 smallcaps text-bone/60">
          <span>{HERO.scrollHint}</span>
          <svg width="28" height="48" viewBox="0 0 28 48" className="opacity-60">
            <rect x="1" y="1" width="26" height="46" rx="13" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="14" cy="14" r="3" fill="currentColor">
              <animate attributeName="cy" values="14;30;14" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
    </section>
  );
}
