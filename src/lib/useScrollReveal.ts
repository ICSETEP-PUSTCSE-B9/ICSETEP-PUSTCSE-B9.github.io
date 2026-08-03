import { useEffect } from 'react';

/**
 * Adds the `is-visible` class to every `.reveal` element when it enters
 * the viewport. Runs once on mount and observes newly rendered nodes.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}
