'use client';

import { useEffect } from 'react';

export function ResultsMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const root = document.documentElement;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    const observe = () => document.querySelectorAll('.results-section, .result-car, .site-footer').forEach((element) => {
      if (!element.classList.contains('is-in-view')) observer.observe(element);
    });
    const mutation = new MutationObserver(observe);
    const section = document.querySelector('.results-section');
    if (section) mutation.observe(section, { childList: true, subtree: true });
    observe();
    root.classList.add('rinjo-motion-ready');
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, window.scrollY / Math.max(1, root.scrollHeight - window.innerHeight));
      root.style.setProperty('--route-progress', `${progress * 100}%`);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      root.style.removeProperty('--route-progress');
      root.classList.remove('rinjo-motion-ready');
    };
  }, []);
  return null;
}
