export function About({ content }: { content: { aboutEyebrow: string; aboutTitle: string; aboutCopy: string; aboutImageUrl: string } }) {
  return (
    <section id="about" className="bg-ivory py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-terracotta">
            {content.aboutEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl text-olive md:text-4xl">
            {content.aboutTitle}
          </h2>
          <p className="mt-5 leading-relaxed text-olive-muted">
            {content.aboutCopy.split("\n\n").map((paragraph) => (
              <span key={paragraph} className="mb-4 block">{paragraph}</span>
            ))}
          </p>
        </div>
        {content.aboutImageUrl ? (
          <img
            src={content.aboutImageUrl}
            alt="Madeye Enterprises decor collection"
            className="h-80 w-full rounded-3xl object-cover shadow-sm"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 rounded-3xl bg-sage" />
            <div className="mt-8 h-40 rounded-3xl bg-terracotta/80" />
            <div className="-mt-8 h-40 rounded-3xl bg-gold/80" />
            <div className="h-40 rounded-3xl bg-sage-deep" />
          </div>
        )}
      </div>
    </section>
  );
}
