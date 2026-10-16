const collections = [
  {
    title: "Flower Pots",
    copy: "Terracotta, sage glaze, and cascade planters for windowsills and courtyards.",
    tone: "bg-terracotta/90 text-ivory",
  },
  {
    title: "Home Accents",
    copy: "Lanterns, wall pieces, and objects that catch the evening light.",
    tone: "bg-sage-deep text-ivory",
  },
  {
    title: "Living Greenery",
    copy: "Hanging planters and woven nests made for trailing leaves.",
    tone: "bg-gold text-olive",
  },
];

export function Collections({ content }: { content: { collectionsTitle: string; collectionsCopy: string } }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-3xl text-olive md:text-4xl">{content.collectionsTitle}</h2>
      <p className="mt-3 max-w-lg text-olive-muted">
        {content.collectionsCopy}
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {collections.map((item) => (
          <article
            key={item.title}
            className={`min-h-52 rounded-3xl p-8 transition hover:-translate-y-1 ${item.tone}`}
          >
            <h3 className="font-display text-2xl">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed opacity-90">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
