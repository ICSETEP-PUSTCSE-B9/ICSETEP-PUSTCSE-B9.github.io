import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { getAssetUrl } from '@/lib/utils';

interface ProjectSlide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

const defaultImages: ProjectSlide[] = [
  {
    id: 'inception-1',
    src: 'team/projectinception1.jpg',
    title: 'Project Inception Program',
    subtitle: 'Smart, Affordable, and Sustainable Agro-Tech Transformation Project under ICSETEP',
  },
  {
    id: 'inception-2',
    src: 'team/projectinception2.jpg',
    title: 'Project Inception Program',
    subtitle: 'Flagship Research Initiative (RDG B9) | Funded by ADB & Implemented by UGC Bangladesh',
  },
  {
    id: 'contract-egp',
    src: 'team/contractEgp.jpg',
    title: 'First eGP Contract signing Ceremony at ICSETEP project',
    subtitle: 'Dept. of Computer Science and Engineering, Pabna University of Science and Technology',
  },
];

interface ImageSliderProps {
  images?: ProjectSlide[];
}

export default function ImageSlider({ images = defaultImages }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = images.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay functionality every 4 seconds
  useEffect(() => {
    if (isPaused || lightboxOpen || total <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, lightboxOpen, nextSlide, total]);

  if (!images || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div className="mt-8 w-full">
      {/* Main Full-Width Featured Carousel Container */}
      <div
        className="group relative h-[360px] sm:h-[460px] lg:h-[520px] w-full overflow-hidden rounded-2xl bg-ink-950 shadow-xl transition-all border border-ink-200"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides Stack */}
        {images.map((img, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={img.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
            >
              <img
                src={getAssetUrl(img.src)}
                alt={img.title}
                className="h-full w-full object-cover object-center"
              />

              {/* Bottom Gradient Overlay for Typography (matching university banner design) */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 pb-12 pt-20 sm:px-10 sm:pb-14 text-white">
                <div className="max-w-3xl">
                  <span className="inline-block rounded-full bg-brand-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md mb-2">
                    Featured Events & Showcase
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-white drop-shadow-md sm:text-3xl lg:text-4xl">
                    {img.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-white/80 sm:text-base">
                    {img.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Fullscreen Expand Icon Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110"
          title="Expand View"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Bottom Centered Pagination Dots */}
        <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
          {images.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${isActive
                  ? 'w-8 bg-white shadow-lg'
                  : 'w-3 bg-white/50 hover:bg-white/80'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-ink-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white/80 transition-colors hover:bg-black hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={getAssetUrl(current.src)}
              alt={current.title}
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
            <div className="p-4 text-center">
              <h3 className="font-display text-xl font-bold text-white">
                {current.title}
              </h3>
              <p className="text-sm font-medium text-brand-300">{current.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
