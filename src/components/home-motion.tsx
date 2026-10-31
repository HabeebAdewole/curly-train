'use client';

import { useEffect } from 'react';

export function HomeMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const sections = document.querySelectorAll('.brands-section, .collection-section, .city-story, .process-section, .film-section, .closing-section, .site-footer');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    sections.forEach((section) => observer.observe(section));
    document.documentElement.classList.add('rinjo-motion-ready');
    let frame = 0;
    const update = () => {
      frame = 0;
      document.documentElement.style.setProperty('--hero-drift', `${Math.min(window.scrollY, window.innerHeight) * .12}px`);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty('--hero-drift');
      document.documentElement.classList.remove('rinjo-motion-ready');
    };
  }, []);
  return null;
}
