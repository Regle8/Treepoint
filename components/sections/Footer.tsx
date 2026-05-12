'use client';

import Image from 'next/image';
import { FOOTER } from '@/lib/copy';
import { withBasePath } from '@/lib/path';

/**
 * Footer — comprehensive site close. Multiple columns of practice detail
 * (where we work, what we offer, professional credentials, practice notes),
 * a quiet anchor-link column, a contact prompt, and small print. No phone
 * or email — every enquiry routes through the form above.
 *
 * Sits flush against the Contact section: no min-height padding, content
 * anchored to the top, modest bottom margin.
 */
export default function Footer() {
  return (
    <footer
      className="section-content relative p-8 md:p-14 pt-12 md:pt-16 pb-10 md:pb-12"
      aria-label="Footer"
    >
      <div className="border-t border-bone/15 max-w-7xl mx-auto pt-10 md:pt-14">
        {/* Top row: lockup + tagline + form CTA */}
        <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 pb-12 md:pb-14 border-b border-bone/10">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <Image
              src={withBasePath('/logo/treepoint-lockup-light.svg')}
              alt={FOOTER.practice}
              width={4096}
              height={1749}
              className="h-10 md:h-12 w-auto mb-5"
            />
            <p className="text-bone/70 font-light text-base md:text-lg leading-relaxed max-w-md">
              {FOOTER.tagline}
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8 md:text-right flex flex-col md:items-end gap-3">
            <p className="text-bone/65 text-sm md:text-base font-light max-w-sm md:ml-auto">
              {FOOTER.contactCta.line}
            </p>
            <a
              href={FOOTER.contactCta.href}
              className="group inline-flex items-center gap-3 smallcaps text-bone hover:text-amber transition"
            >
              <span>{FOOTER.contactCta.label}</span>
              <span className="block w-8 h-px bg-current transition-all group-hover:w-14" />
            </a>
          </div>
        </div>

        {/* Detail columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-x-10 py-12 md:py-14 border-b border-bone/10">
          {/* Where we work */}
          <div>
            <div className="smallcaps text-bone/55 mb-5">
              {FOOTER.serviceAreas.label}
            </div>
            <ul className="space-y-2 text-bone/85 text-sm font-light leading-relaxed">
              {FOOTER.serviceAreas.items.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <div className="smallcaps text-bone/55 mb-5">
              {FOOTER.servicesShort.label}
            </div>
            <ul className="space-y-2 text-bone/85 text-sm font-light leading-relaxed">
              {FOOTER.servicesShort.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Professional */}
          <div>
            <div className="smallcaps text-bone/55 mb-5">
              {FOOTER.professional.label}
            </div>
            <ul className="space-y-2 text-bone/85 text-sm font-light leading-relaxed">
              {FOOTER.professional.items.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Practice notes */}
          <div>
            <div className="smallcaps text-bone/55 mb-5">
              {FOOTER.practiceNotes.label}
            </div>
            <ul className="space-y-2 text-bone/85 text-sm font-light leading-relaxed">
              {FOOTER.practiceNotes.items.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Anchor links row */}
        <nav
          aria-label="Footer navigation"
          className="py-8 md:py-10 border-b border-bone/10 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          <span className="smallcaps text-bone/45">{FOOTER.links.label}</span>
          {FOOTER.links.items.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="smallcaps text-bone/65 hover:text-amber transition-colors duration-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Small print */}
        <div className="pt-8 md:pt-10 text-bone/50 text-xs font-light leading-relaxed">
          <p>{FOOTER.rights}</p>
        </div>
      </div>
    </footer>
  );
}
