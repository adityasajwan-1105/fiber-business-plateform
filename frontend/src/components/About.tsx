import { type LandingContent, defaultAboutCollage } from "@/lib/landingContent";

export function About({ content }: { content: LandingContent }) {
  if (content.showAboutSection === false) {
    return null;
  }

  const collage =
    content.aboutCollage && content.aboutCollage.length === 4
      ? content.aboutCollage
      : defaultAboutCollage;

  return (
    <section id="about" className="bg-ivory py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2 md:items-center">
        <div>
          {content.aboutEyebrow ? (
            <p className="text-xs uppercase tracking-[0.28em] text-terracotta">
              {content.aboutEyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-3xl text-olive md:text-4xl">
            {content.aboutTitle}
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-olive-muted">
            {content.aboutCopy.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {content.aboutLayout === "single" && content.aboutImageUrl ? (
          <div className="overflow-hidden rounded-3xl shadow-sm">
            <img
              src={content.aboutImageUrl}
              alt={content.aboutTitle || "About Madeye Enterprises"}
              className="h-80 w-full rounded-3xl object-cover shadow-sm transition-transform duration-500 hover:scale-105"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {collage.map((item, index) => {
              const staggerClass =
                index === 1 ? "mt-8" : index === 2 ? "-mt-8" : "";
              const toneClass =
                item.tone ||
                (index === 0
                  ? "bg-sage"
                  : index === 1
                  ? "bg-terracotta/80"
                  : index === 2
                  ? "bg-gold/80"
                  : "bg-sage-deep");

              return (
                <div
                  key={item.id || index}
                  className={`group relative h-40 sm:h-44 overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${staggerClass} ${toneClass}`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.alt || `Our Story image ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

