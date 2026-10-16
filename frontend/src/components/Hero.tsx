export function Hero({ content }: { content: { heroEyebrow: string; heroTitle: string; heroCopy: string; heroImageUrl: string } }) {
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
          {content.heroImageUrl ? (
            <div className="animate-hero-breathe relative h-full w-full overflow-hidden rounded-[2rem] bg-cream shadow-xl">
              <img
                src={content.heroImageUrl}
                alt="Madeye Enterprises home decor"
                className="h-full w-full object-contain"
              />
              <div className="pointer-events-none absolute inset-0 animate-hero-shine bg-gradient-to-r from-transparent via-ivory/20 to-transparent" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
