'use client';

import { useState } from 'react';
import { CONTACT } from '@/lib/copy';
import SplitReveal from '@/components/ui/SplitReveal';

/**
 * Contact = form only. No email or phone listed anywhere on the page —
 * every enquiry passes through this form so it can be triaged uniformly.
 */
export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section
      id="contact"
      className="section-content relative flex flex-col justify-start p-8 md:p-14 pt-24 md:pt-32 pb-16 md:pb-20"
      aria-label={CONTACT.label}
    >
      <div className="grid grid-cols-12 mb-12 md:mb-16 max-w-6xl mx-auto w-full">
        <div className="col-span-12 md:col-span-4">
          <div className="numeral text-7xl md:text-8xl text-amber/85 leading-none mb-2">
            {CONTACT.numeral}
          </div>
          <div className="smallcaps text-bone/60">{CONTACT.label}</div>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6 space-y-5">
          <h2
            className="font-display text-display text-bone leading-[1.05]"
            style={{ fontVariationSettings: "'opsz' 96, 'wght' 400" }}
          >
            <SplitReveal as="span" splitBy="word" stagger={0.05}>
              {CONTACT.heading}
            </SplitReveal>
          </h2>
          <p className="text-bone/75 text-lg md:text-xl font-light leading-relaxed max-w-xl">
            {CONTACT.intro}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-y-12 md:gap-x-14 max-w-6xl mx-auto w-full">
        <form
          className="col-span-12 md:col-span-7 space-y-7"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
            <label className="block">
              <span className="smallcaps text-bone/55 mb-2 block">
                {CONTACT.fields.name}
              </span>
              <input
                type="text"
                required
                className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light"
              />
            </label>
            <label className="block">
              <span className="smallcaps text-bone/55 mb-2 block">
                {CONTACT.fields.organisation}
              </span>
              <input
                type="text"
                className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light"
              />
            </label>
            <label className="block">
              <span className="smallcaps text-bone/55 mb-2 block">
                {CONTACT.fields.email}
              </span>
              <input
                type="email"
                required
                className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light"
              />
            </label>
            <label className="block">
              <span className="smallcaps text-bone/55 mb-2 block">
                {CONTACT.fields.phone}
              </span>
              <input
                type="tel"
                className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light"
              />
            </label>
            <label className="block">
              <span className="smallcaps text-bone/55 mb-2 block">
                {CONTACT.fields.postcode}
              </span>
              <input
                type="text"
                className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light uppercase tracking-wider"
              />
            </label>
            <label className="block">
              <span className="smallcaps text-bone/55 mb-2 block">
                {CONTACT.fields.service}
              </span>
              <select
                className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light appearance-none cursor-pointer"
                defaultValue=""
                required
              >
                <option value="" disabled className="bg-forest-deep">
                  Select a service
                </option>
                {CONTACT.serviceOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-forest-deep">
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="smallcaps text-bone/55 mb-2 block">
              {CONTACT.fields.message}
            </span>
            <textarea
              rows={5}
              required
              className="w-full bg-transparent border-b border-bone/30 focus:border-amber outline-none py-2 text-bone font-light resize-none"
            />
          </label>

          <button
            type="submit"
            className="group flex items-center gap-3 smallcaps text-bone hover:text-amber transition pt-4"
          >
            <span>{sent ? CONTACT.formSent : CONTACT.formCta}</span>
            <span className="block w-8 h-px bg-current transition-all group-hover:w-14" />
          </button>
        </form>

        <aside className="col-span-12 md:col-span-4 md:col-start-9 space-y-4 text-bone/65 text-sm md:text-base font-light leading-relaxed md:pl-6 md:border-l md:border-bone/15">
          {CONTACT.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </aside>
      </div>
    </section>
  );
}
