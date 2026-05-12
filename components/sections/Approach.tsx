'use client';

import { APPROACH } from '@/lib/copy';
import SplitReveal from '@/components/ui/SplitReveal';

export default function Approach() {
  return (
    <section
      id="approach"
      className="section-content relative min-h-[160vh] flex flex-col justify-center p-8 md:p-14 py-24 md:py-32"
      aria-label={APPROACH.label}
    >
      <div className="grid grid-cols-12 mb-16 md:mb-20">
        <div className="col-span-12 md:col-span-4">
          <div className="numeral text-7xl md:text-8xl text-amber/85 leading-none mb-2">
            {APPROACH.numeral}
          </div>
          <div className="smallcaps text-bone/60">{APPROACH.label}</div>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6">
          <h2
            className="font-display text-display text-bone leading-[1.05] mb-6"
            style={{ fontVariationSettings: "'opsz' 96, 'wght' 400" }}
          >
            <SplitReveal as="span" splitBy="word" stagger={0.05}>
              {APPROACH.heading}
            </SplitReveal>
          </h2>
          <p className="text-bone/70 text-lg md:text-xl font-light max-w-lg">
            <SplitReveal as="span" splitBy="word" stagger={0.014}>
              {APPROACH.sub}
            </SplitReveal>
          </p>
        </div>
      </div>

      <ol className="space-y-20 md:space-y-28 max-w-6xl mx-auto w-full">
        {APPROACH.steps.map((s, i) => {
          const isLeft = i % 2 === 0;
          return (
            <li key={s.n} className="grid grid-cols-12 gap-6 md:gap-10 items-start">
              {isLeft ? (
                <>
                  <div className="col-span-12 md:col-span-5">
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="numeral text-5xl md:text-6xl text-amber/85 leading-none">
                        {s.n}
                      </span>
                      <h3
                        className="font-display text-3xl md:text-5xl text-bone leading-tight"
                        style={{ fontVariationSettings: "'opsz' 72, 'wght' 400" }}
                      >
                        {s.title}
                      </h3>
                    </div>
                  </div>
                  <p className="col-span-12 md:col-span-6 md:col-start-7 text-bone/85 text-base md:text-lg leading-relaxed font-light max-w-xl">
                    <SplitReveal as="span" splitBy="word" stagger={0.01}>
                      {s.body}
                    </SplitReveal>
                  </p>
                </>
              ) : (
                <>
                  <p className="col-span-12 md:col-span-6 text-bone/85 text-base md:text-lg leading-relaxed font-light max-w-xl md:order-1">
                    <SplitReveal as="span" splitBy="word" stagger={0.01}>
                      {s.body}
                    </SplitReveal>
                  </p>
                  <div className="col-span-12 md:col-span-5 md:col-start-8 md:order-2">
                    <div className="flex items-baseline gap-4 mb-4 md:justify-end">
                      <span className="numeral text-5xl md:text-6xl text-amber/85 leading-none">
                        {s.n}
                      </span>
                      <h3
                        className="font-display text-3xl md:text-5xl text-bone leading-tight"
                        style={{ fontVariationSettings: "'opsz' 72, 'wght' 400" }}
                      >
                        {s.title}
                      </h3>
                    </div>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
