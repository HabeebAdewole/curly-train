'use client';

import { useEffect, useRef } from 'react';

export function MotionVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => {
      section.classList.toggle('is-visible', entry.isIntersecting);
      if (entry.isIntersecting && !reducedMotion.matches) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="motion-stage" ref={sectionRef}>
      <video ref={videoRef} muted loop playsInline preload="metadata" poster="/media/bmw-m3-poster.jpg" aria-hidden="true">
        <source src="/media/bmw-m3-film.mp4" type="video/mp4" />
      </video>
      <div className="motion-shade" />
      <div className="motion-copy">
        <h2>Feel the<br />difference.</h2>
        <p>The drive should be part of the reason you go.</p>
      </div>
    </div>
  );
}
