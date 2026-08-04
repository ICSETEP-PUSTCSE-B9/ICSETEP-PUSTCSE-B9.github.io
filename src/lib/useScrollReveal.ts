import { useEffect } from 'react';

/**
 * Observes section containers and cards as they enter the viewport.
 * Adds `is-visible` when scrolled into view with an enriched staggered scale & slide effect.
 * Ensures sections remain fully visible and never turn blank on page load or navigation.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '100px 0px 100px 0px',
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
        if (!el.style.transitionDelay) {
          const delay = (index % 3) * 60;
          el.style.transitionDelay = `${delay}ms`;
        }

        // Make elements already near/in viewport visible immediately on page load
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150 && rect.bottom > -150) {
          el.classList.add('is-visible');
        }

        observer.observe(el);
      });
    };

    observeElements();
    const t1 = setTimeout(observeElements, 100);
    const t2 = setTimeout(observeElements, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, []);
}
