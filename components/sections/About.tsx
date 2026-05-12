'use client';

import SplitReveal from '@/components/ui/SplitReveal';
import { ABOUT } from '@/lib/copy';

/**
 * About section — editorial layout. Paragraphs deliberately land in
 * different column ranges so the body reads as a flow down and across the
 * page, not a single stacked column.
 *
 * Grid plan (12-col, md+):
 *   numeral    — sticky in cols 1-3
 *   heading    — cols 4-12 (full headline)
 *   body[0]    — cols 4-9   (centre-left, wide)
 *   body[1]    — cols 7-12  (right, narrower)
 *   body[2]    — cols 4-9   (centre-left, narrower)
 *   body[3]    — cols 7-12  (right, narrower)
 *   credentials — cols 4-12 (full-width strip)
 */
export default function About() {
  return (
    <section
      id="about"
      className="section-content relative min-h-[130vh] flex items-start p-8 md:p-14 py-24 md:py-32"
      aria-label={ABOUT.label}
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-14 md:gap-y-16 w-full">
        {/* Sticky numeral on the left */}
        <div className="col-span-12 md:col-span-3">
          <div className="sticky top-32">
            <div className="numeral text-7xl md:text-8xl text-amber/85 leading-none mb-2">
              {ABOUT.numeral}
            </div>
            <div className="smallcaps text-bone/60">{ABOUT.label}</div>
          </div>
        </div>

        {/* Heading spans the right two-thirds */}
        <h2
          className="col-span-12 md:col-span-9 md:col-start-4 font-display text-display text-bone leading-[1.05]"
          style={{ fontVariationSettings: "'opsz' 96, 'wght' 400" }}
        >
          <SplitReveal as="span" splitBy="word" stagger={0.05}>
            {ABOUT.heading}
          </SplitReveal>
        </h2>

        {/* Paragraph 1 — wide, centre-left */}
        <p className="col-span-12 md:col-span-6 md:col-start-4 text-bone/85 text-lg md:text-xl leading-relaxed font-light">
          <SplitReveal as="span" splitBy="word" stagger={0.008}>
            {ABOUT.body[0]}
          </SplitReveal>
        </p>

        {/* Paragraph 2 — right-leaning, narrower */}
        <p className="col-span-12 md:col-span-5 md:col-start-8 text-bone/85 text-lg md:text-xl leading-relaxed font-light">
          <SplitReveal as="span" splitBy="word" stagger={0.008} delay={0.05}>
            {ABOUT.body[1]}
          </SplitReveal>
        </p>

        {/* Paragraph 3 — back to centre-left */}
        <p className="col-span-12 md:col-span-6 md:col-start-4 text-bone/85 text-lg md:text-xl leading-relaxed font-light">
          <SplitReveal as="span" splitBy="word" stagger={0.008} delay={0.1}>
            {ABOUT.body[2]}
          </SplitReveal>
        </p>

        {/* Paragraph 4 — right again */}
        <p className="col-span-12 md:col-span-5 md:col-start-8 text-bone/85 text-lg md:text-xl leading-relaxed font-light">
          <SplitReveal as="span" splitBy="word" stagger={0.008} delay={0.15}>
            {ABOUT.body[3]}
          </SplitReveal>
        </p>
      </div>
    </section>
  );
}
