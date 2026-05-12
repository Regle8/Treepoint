'use client';

import { useState } from 'react';
import { FAQ } from '@/lib/copy';
import SplitReveal from '@/components/ui/SplitReveal';
import Disclosure from '@/components/ui/Disclosure';

/**
 * Questions accordion. Same Disclosure primitive as Services — only one
 * answer open at a time, smooth height transition, prefers-reduced-motion
 * fallback handled by Disclosure itself.
 */
export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="section-content relative min-h-[140vh] flex flex-col justify-start p-8 md:p-14 py-24 md:py-32"
      aria-label={FAQ.label}
    >
      {/* FAQ header flips the rhythm again — heading on the left,
          numeral and label tucked into the right margin. */}
      <div className="grid grid-cols-12 gap-x-6 mb-16 md:mb-20 max-w-6xl mx-auto w-full">
        <div className="col-span-12 md:col-span-7 md:col-start-1 space-y-5 md:order-1 order-2">
          <h2
            className="font-display text-display text-bone leading-[1.05] max-w-2xl"
            style={{ fontVariationSettings: "'opsz' 96, 'wght' 400" }}
          >
            <SplitReveal as="span" splitBy="word" stagger={0.05}>
              {FAQ.heading}
            </SplitReveal>
          </h2>
          <p className="text-bone/70 text-base md:text-lg italic font-light max-w-lg">
            {FAQ.sub}
          </p>
        </div>
        <div className="col-span-12 md:col-span-3 md:col-start-10 md:order-2 order-1 md:text-right mb-6 md:mb-0">
          <div className="numeral text-7xl md:text-8xl text-amber/85 leading-none mb-2">
            {FAQ.numeral}
          </div>
          <div className="smallcaps text-bone/60">{FAQ.label}</div>
        </div>
      </div>

      <ul className="max-w-5xl mx-auto w-full border-t border-bone/15">
        {FAQ.items.map((item, i) => (
          <li key={item.q}>
            <Disclosure
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              summary={item.q}
            >
              <p className="text-bone/85 text-base md:text-lg leading-relaxed font-light max-w-3xl">
                {item.a}
              </p>
            </Disclosure>
          </li>
        ))}
      </ul>
    </section>
  );
}
