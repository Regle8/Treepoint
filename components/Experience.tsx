'use client';

import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/lib/scroll';
import Hero from './sections/Hero';
import About from './sections/About';
import Principles from './sections/Principles';
import Services from './sections/Services';
import Approach from './sections/Approach';
import FAQ from './sections/FAQ';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import ProgressRing from './ui/ProgressRing';
import StickyNav from './ui/StickyNav';
import TreeRings from './TreeRings/TreeRings';

const Scene = dynamic(() => import('./scene/Scene'), { ssr: false, loading: () => null });

export default function Experience() {
  useScrollProgress();

  return (
    <>
      <Scene />
      <div className="scene-veil" aria-hidden />
      <TreeRings />
      <StickyNav />
      <main className="relative z-10">
        <Hero />
        <About />
        <Principles />
        <Services />
        <Approach />
        <FAQ />
        <Contact />
        <Footer />
      </main>
      <ProgressRing />
    </>
  );
}
