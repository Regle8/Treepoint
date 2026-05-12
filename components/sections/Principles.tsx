'use client';

import SplitReveal from '@/components/ui/SplitReveal';
import { PRINCIPLES } from '@/lib/copy';

/**
 * Each principle lives at its own column position on a 12-col grid, so the
 * eye moves left → right → left → right down the page rather than tracking
 * a single column. The widths also vary; nothing is exactly the same.
 */
const PRINCIPLE_LAYOUTS: { col: string; span: string }[] = [
  { col: 'md:col-start-1',  span: 'md:col-span-5' },   // 01: hard left
  { col: 'md:col-start-8',  span: 'md:col-span-5' },   // 02: right
  { col: 'md:col-start-3',  span: 'md:col-span-6' },   // 03: centre-left wide
  { col: 'md:col-start-7',  span: 'md:col-span-5' },   // 04: right of centre
  { col: 'md:col-start-2',  span: 'md:col-span-5' },   // 05: left of centre
  { col: 'md:col-start-6',  span: 'md:col-span-7' },   // 06: centre-right wide
];

export default function Principles() {
  return (
    <section
      id="principles"
      className="section-content relative min-h-[160vh] flex flex-col justify-start p-8 md:p-14 py-24 md:py-32"
      aria-label={PRINCIPLES.label}
    >
      {/* Header — numeral on the left, heading right of centre */}
      <div className="grid grid-cols-12 mb-20 md:mb-28 max-w-6xl mx-auto w-full">
        <div className="col-span-12 md:col-span-4">
          <div className="numeral text-7xl md:text-8xl text-amber/85 leading-none mb-2">
            {PRINCIPLES.numeral}
          </div>
          <div className="smallcaps text-bone/60">{PRINCIPLES.label}</div>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6 space-y-5">
          <h2
            className="font-display text-display text-bone leading-[1.05] max-w-2xl"
            style={{ fontVariationSettings: "'opsz' 96, 'wght' 400" }}
          >
            <SplitReveal as="span" splitBy="word" stagger={0.05}>
              {PRINCIPLES.heading}
            </SplitReveal>
          </h2>
          <p className="text-bone/70 text-base md:text-lg italic font-light max-w-lg">
            {PRINCIPLES.sub}
          </p>
        </div>
      </div>

      {/* Asymmetric grid — each principle drifts to its own column block. */}
      <ol className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-x-6 gap-y-16 md:gap-y-24 border-t border-bone/15 pt-16 md:pt-20">
        {PRINCIPLES.items.map((item, i) => {
          const layout = PRINCIPLE_LAYOUTS[i] ?? { col: '', span: 'md:col-span-6' };
          return (
            <li
              key={item.title}
              className={`col-span-12 ${layout.col} ${layout.span} space-y-4`}
            >
              <div className="flex items-baseline gap-4">
                <span className="numeral text-2xl md:text-3xl text-amber/85 leading-none tabular">
                  {item.n}
                </span>
                <h3
                  className="font-display text-[clamp(1.35rem,2.4vw,1.85rem)] text-bone leading-tight"
                  style={{ fontVariationSettings: "'opsz' 60, 'wght' 400" }}
                >
                  {item.title}
                </h3>
              </div>
              <p className="text-bone/80 text-base md:text-lg leading-relaxed font-light pl-0 md:pl-10">
                <SplitReveal as="span" splitBy="word" stagger={0.008}>
                  {item.body}
                </SplitReveal>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
