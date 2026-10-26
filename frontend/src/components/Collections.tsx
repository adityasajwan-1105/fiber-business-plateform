import Link from "next/link";
import { type LandingContent } from "@/lib/landingContent";

export function Collections({ content }: { content: LandingContent }) {
  if (content.showCollectionsSection === false) {
    return null;
  }

  const categories = content.collectionCategories ?? [];

  if (categories.length === 0 && !content.collectionsTitle) {
    return null;
  }

  return (
    <section id="collections" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-3xl text-olive md:text-4xl">{content.collectionsTitle}</h2>
      {content.collectionsCopy ? (
        <p className="mt-3 max-w-lg text-olive-muted">
          {content.collectionsCopy}
        </p>
      ) : null}

      {categories.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item, index) => {
            const toneClass = item.tone || "bg-terracotta/90 text-ivory";
            const cardInner = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  {item.link ? (
                    <span
                      className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-relaxed opacity-90">{item.copy}</p>
              </>
            );

            if (item.link) {
              return (
                <Link
                  key={item.id || `${item.title}-${index}`}
                  href={item.link}
                  className={`group flex min-h-52 flex-col justify-between rounded-3xl p-8 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${toneClass}`}
                >
                  {cardInner}
                </Link>
              );
            }

            return (
              <article
                key={item.id || `${item.title}-${index}`}
                className={`flex min-h-52 flex-col justify-between rounded-3xl p-8 transition duration-200 hover:-translate-y-1 hover:shadow-md ${toneClass}`}
              >
                {cardInner}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

