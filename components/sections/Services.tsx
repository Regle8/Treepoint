'use client';

import { useState } from 'react';
import { SERVICES, SERVICES_LABEL } from '@/lib/copy';
import SplitReveal from '@/components/ui/SplitReveal';
import Disclosure from '@/components/ui/Disclosure';

/**
 * Services as a vertical accordion. Each row shows numeral + title; clicking
 * reveals the editorial paragraph, the "Typically required when" list, the
 * "What you receive" list, and the typical turnaround. Only one open at a time.
 */
export default function Services() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="services"
      className="section-content relative min-h-[180vh] flex flex-col justify-start p-8 md:p-14 py-24 md:py-32"
      aria-label={SERVICES_LABEL.label}
    >
      {/* Numeral hangs on the right, the editorial line sits on the left —
          inverse of About/Principles to keep the eye moving. */}
      <div className="grid grid-cols-12 gap-x-6 mb-16 md:mb-24 max-w-6xl mx-auto w-full">
        <p className="col-span-12 md:col-span-6 md:col-start-1 text-bone/70 text-lg md:text-2xl italic font-light leading-relaxed max-w-xl md:order-1 order-2">
          <SplitReveal as="span" splitBy="word" stagger={0.02}>
            {SERVICES_LABEL.sub}
          </SplitReveal>
        </p>
        <div className="col-span-12 md:col-span-3 md:col-start-10 md:order-2 order-1 md:text-right mb-6 md:mb-0">
          <div className="numeral text-7xl md:text-8xl text-amber/85 leading-none mb-2">
            {SERVICES_LABEL.numeral}
          </div>
          <div className="smallcaps text-bone/60">{SERVICES_LABEL.label}</div>
        </div>
      </div>

      <ul className="max-w-6xl mx-auto w-full border-t border-bone/15">
        {SERVICES.map((s, i) => (
          <li key={s.title}>
            <Disclosure
              numeral={s.numeral}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              summary={s.title}
            >
              <div className="grid grid-cols-12 gap-x-6 gap-y-8 pt-1">
                <p className="col-span-12 md:col-span-8 text-bone/85 text-base md:text-lg leading-relaxed font-light max-w-2xl">
                  {s.body}
                </p>

                <div className="col-span-12 md:col-span-4 space-y-8">
                  <div>
                    <div className="smallcaps text-bone/55 mb-3">Typically required when</div>
                    <ul className="space-y-2 text-bone/85 text-sm md:text-base font-light leading-relaxed">
                      {s.triggers.map((trigger) => (
                        <li key={trigger} className="flex gap-3">
                          <span className="text-amber/80 mt-[0.5em] shrink-0">
                            <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden>
                              <circle cx="3" cy="3" r="2.5" fill="currentColor" />
                            </svg>
                          </span>
                          <span>{trigger}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="smallcaps text-bone/55 mb-3">What you receive</div>
                    <ul className="space-y-2 text-bone/85 text-sm md:text-base font-light leading-relaxed">
                      {s.deliverables.map((deliverable) => (
                        <li key={deliverable} className="flex gap-3">
                          <span className="text-bone/45 mt-[0.7em] shrink-0">
                            <svg width="10" height="1" viewBox="0 0 10 1" aria-hidden>
                              <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" />
                            </svg>
                          </span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-bone/15">
                    <div className="smallcaps text-bone/55 mb-1">Typical turnaround</div>
                    <div className="text-bone/85 font-light">{s.turnaround}</div>
                  </div>
                </div>
              </div>
            </Disclosure>
          </li>
        ))}
      </ul>
    </section>
  );
}
