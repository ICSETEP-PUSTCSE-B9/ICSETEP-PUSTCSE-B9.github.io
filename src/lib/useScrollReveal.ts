import { useEffect } from 'react';

/**
 * Observes section containers and cards as they enter and leave the viewport.
 * Adds `is-visible` when scrolled into view, and removes `is-visible` when scrolled out of view
 * with an enriched staggered scale & slide effect.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Remove class when out of view so animation re-triggers enriched on every scroll
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -25px 0px',
      }
    );

    const observeElements = () => {
      const targets = document.querySelectorAll<HTMLElement>(
        '.reveal, .reveal-scale, section article, section .rounded-2xl, section .rounded-xl, section .max-w-2xl, section .max-w-3xl'
      );

      targets.forEach((el, index) => {
        if (!el.classList.contains('reveal') && !el.classList.contains('reveal-scale')) {
          el.classList.add('reveal');
        }
        // Stagger transitions nicely across cards in grids
        if (!el.style.transitionDelay) {
          const delay = (index % 3) * 90;
          el.style.transitionDelay = `${delay}ms`;
        }
        observer.observe(el);
      });
    };

    observeElements();
    const timer = setTimeout(observeElements, 250);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}
