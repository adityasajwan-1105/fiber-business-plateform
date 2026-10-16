import type { Product } from "@/data/products";

function ProductArt({ product }: { product: Product }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="h-52 w-full rounded-2xl object-cover"
      />
    );
  }

  const common = "h-52 w-full";

  switch (product.shape) {
    case "vase":
      return (
        <div className={`${common} flex items-end justify-center`}>
          <div
            className="h-24 w-10 rounded-t-full rounded-b-md shadow-inner"
            style={{ background: product.accent }}
          />
        </div>
      );
    case "hanging":
      return (
        <div className={`${common} flex flex-col items-center justify-center`}>
          <div className="h-6 w-px bg-olive/40" />
          <div
            className="h-16 w-16 rounded-full"
            style={{ background: product.accent }}
          />
        </div>
      );
    case "lantern":
      return (
        <div className={`${common} flex items-center justify-center`}>
          <div
            className="h-20 w-14 rounded-t-md rounded-b-lg border-4 border-gold/50"
            style={{ background: product.accent }}
          />
        </div>
      );
    case "basket":
      return (
        <div className={`${common} flex items-end justify-center`}>
          <div
            className="h-16 w-24 rounded-b-2xl rounded-t-sm"
            style={{
              background: `repeating-linear-gradient(90deg, ${product.accent}, ${product.accent} 6px, #efe6d8 6px, #efe6d8 10px)`,
            }}
          />
        </div>
      );
    case "art":
      return (
        <div className={`${common} flex items-center justify-center`}>
          <div
            className="h-20 w-24 rounded-sm ring-4 ring-ivory shadow"
            style={{ background: product.accent }}
          />
        </div>
      );
    default:
      return (
        <div className={`${common} flex items-end justify-center`}>
          <div
            className="h-20 w-20 rounded-t-lg rounded-b-[40%]"
            style={{ background: product.accent }}
          />
        </div>
      );
  }
}

export function ProductShowcase({ products, content }: { products: Product[]; content: { productsEyebrow: string; productsTitle: string; productsCopy: string } }) {
  if (products.length === 0) return null;

  return (
    <section id="shop" className="border-y border-sand bg-cream-dark/60 py-16">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-xs uppercase tracking-[0.28em] text-terracotta">
          {content.productsEyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl text-olive md:text-4xl">
          {content.productsTitle}
        </h2>
        <p className="mt-3 max-w-xl text-olive-muted">
          {content.productsCopy}
        </p>
      </div>

      <div className="mt-10 overflow-x-auto">
        <div className="flex w-max gap-5 px-5">
          {products.map((product, index) => (
            <article
              key={`${product.id}-${index}`}
              className="w-72 shrink-0 rounded-3xl bg-ivory p-5 shadow-sm ring-1 ring-sand"
            >
              <div className="rounded-2xl bg-cream">
                <ProductArt product={product} />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-olive-muted">
                {product.category}
              </p>
              <h3 className="font-display text-lg text-olive">{product.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-terracotta">
                  ₹{product.actualPrice.toLocaleString("en-IN")}
                </p>
                {product.markedPrice > product.actualPrice ? (
                  <p className="text-xs text-olive-muted line-through">
                    ₹{product.markedPrice.toLocaleString("en-IN")}
                  </p>
                ) : null}
              </div>
              {product.markedPrice > product.actualPrice ? (
                <p className="mt-1 text-xs text-sage-deep">
                  {Math.round(((product.markedPrice - product.actualPrice) / product.markedPrice) * 100)}% off
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
