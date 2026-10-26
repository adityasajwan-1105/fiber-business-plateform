"use client";

import { useEffect, useState } from "react";

type HeroProps = {
  content: {
    heroEyebrow: string;
    heroTitle: string;
    heroCopy: string;
    heroImageUrl?: string;
    heroImages?: string[];
    heroRotationInterval?: number;
  };
};

export function Hero({ content }: HeroProps) {
  const images = (content.heroImages && content.heroImages.length > 0)
    ? content.heroImages.filter((img) => typeof img === "string" && img.trim().length > 0)
    : content.heroImageUrl
      ? [content.heroImageUrl]
      : ["/hero.png", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"];

  const activeImages = images.length > 0 ? images : ["/hero.png"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const rotationInterval = (content.heroRotationInterval || 4) * 1000;

  useEffect(() => {
    if (activeImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeImages.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [activeImages.length, rotationInterval, isPaused]);

  // If currentIndex goes out of bounds when images are removed
  useEffect(() => {
    if (currentIndex >= activeImages.length) {
      setCurrentIndex(0);
    }
  }, [activeImages.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeImages.length);
  };

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-12 md:pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute -left-8 top-16 h-40 w-40 rounded-full bg-sage/25 blur-2xl" />
        <div className="animate-float absolute right-4 top-8 h-52 w-52 rounded-full bg-terracotta/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="animate-fade-up">
          <p className="text-xs uppercase tracking-[0.28em] text-terracotta">
            {content.heroEyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-olive md:text-6xl">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-olive-muted">
            {content.heroCopy}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#shop"
              className="rounded-full bg-terracotta px-6 py-3 text-sm text-ivory transition hover:bg-terracotta-dark"
            >
              Explore the collection
            </a>
            <a
              href="/about"
              className="rounded-full border border-olive/20 px-6 py-3 text-sm text-olive hover:bg-ivory"
            >
              Our story
            </a>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="animate-hero-breathe group relative h-full w-full overflow-hidden rounded-[2rem] bg-cream shadow-xl"
          >
            {activeImages.map((src, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={`${src}-${index}`}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive
                      ? "opacity-100 scale-100 z-10"
                      : "opacity-0 scale-105 pointer-events-none z-0"
                  }`}
                >
                  <img
                    src={src}
                    alt={`Madeye Enterprises home decor ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}

            {/* Subtle aesthetic ambient gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-15 bg-gradient-to-t from-olive/45 via-olive/15 to-transparent" />

            {/* Rotating shine effect */}
            <div className="pointer-events-none absolute inset-0 z-20 animate-hero-shine bg-gradient-to-r from-transparent via-ivory/20 to-transparent" />

            {/* Counter badge */}
            {activeImages.length > 1 ? (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-ivory/85 px-3 py-1 text-xs font-medium text-olive shadow-sm backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
                <span>
                  {String(currentIndex + 1).padStart(2, "0")} / {String(activeImages.length).padStart(2, "0")}
                </span>
                {isPaused ? (
                  <span className="ml-1 text-[10px] text-olive-muted uppercase tracking-wider">Paused</span>
                ) : null}
              </div>
            ) : null}

            {/* Next / Previous arrows on hover */}
            {activeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/80 text-olive shadow-md backdrop-blur-md transition-all duration-200 hover:bg-ivory hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Previous image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/80 text-olive shadow-md backdrop-blur-md transition-all duration-200 hover:bg-ivory hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Next image"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            ) : null}

            {/* Dots / pill indicators */}
            {activeImages.length > 1 ? (
              <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center gap-2">
                {activeImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      idx === currentIndex
                        ? "w-7 bg-terracotta shadow-md"
                        : "w-2 bg-ivory/70 hover:bg-ivory"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
