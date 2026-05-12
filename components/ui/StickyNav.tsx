'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { SECTIONS } from '@/lib/season';
import { scrollToSection } from '@/lib/scroll';

/**
 * Top sticky navigation. Appears once the user scrolls past the hero, lets
 * them jump to any section. The current section is highlighted in amber
 * (driven by scroll progress + the section thresholds in SECTIONS).
 *
 * Hidden during the TreeRings loader and the hero itself; fades down into
 * view on subsequent scroll. Backdrop blur keeps it readable over any
 * section background.
 */
export default function StickyNav() {
  const progress = useStore((s) => s.scrollProgress);
  const siteLoaded = useStore((s) => s.siteLoaded);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!siteLoaded) {
      setVisible(false);
      return;
    }
    // Show once we're a little past the hero, hide if scrolled back to top.
    setVisible(progress > 0.04);
  }, [progress, siteLoaded]);

  // Drop hero from the nav — once you're scrolling, the hero is "home".
  const items = SECTIONS.filter((s) => s.id !== 'hero');

  // Active section by scroll position
  let activeId = items[0]?.id;
  for (let i = 0; i < items.length; i++) {
    if (progress >= items[i].seasonAt - 0.04) activeId = items[i].id;
  }

  return (
    <nav
      className={`sticky-nav ${visible ? 'visible' : ''}`}
      aria-label="Section navigation"
    >
      <div className="sticky-nav-inner">
        <ul className="sticky-nav-list">
          {items.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(s.id);
                }}
                className={`sticky-nav-link ${activeId === s.id ? 'active' : ''}`}
                aria-current={activeId === s.id ? 'page' : undefined}
              >
                <span className="sticky-nav-numeral" aria-hidden="true">{s.numeral}</span>
                <span className="sticky-nav-label">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
