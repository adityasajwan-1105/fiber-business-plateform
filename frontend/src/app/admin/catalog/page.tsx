"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminProducts, type Product } from "@/data/products";

const emptyProduct = {
  name: "",
  category: "",
  markedPrice: "",
  actualPrice: "",
  image: "",
};

export default function CatalogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/profile");
      return;
    }
    window.setTimeout(() => setProducts(getAdminProducts()), 0);
  }, [loading, user, router]);

  function persistProducts(nextProducts: Product[]) {
    setProducts(nextProducts);
    localStorage.setItem("madeye-products", JSON.stringify(nextProducts));
    setSaved(true);
  }

  function addProduct() {
    const markedPrice = Number(newProduct.markedPrice);
    const actualPrice = Number(newProduct.actualPrice);
    if (!newProduct.name.trim() || !newProduct.category.trim() || !newProduct.image) {
      setError("Product name, category, and image are required.");
      return;
    }
    if (markedPrice <= 0 || actualPrice <= 0 || actualPrice > markedPrice) {
      setError("Enter valid prices. Actual price must not exceed marked price.");
      return;
    }

    persistProducts([
      ...products,
      {
        id: `${Date.now()}-${newProduct.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        markedPrice,
        actualPrice,
        image: newProduct.image,
        accent: "#c45c3e",
        shape: "pot",
      },
    ]);
    setNewProduct(emptyProduct);
    setError("");
  }

  function removeProduct(id: string) {
    persistProducts(products.filter((product) => product.id !== id));
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await compressImage(file);
      setNewProduct((current) => ({ ...current, image }));
      setError("");
    } catch {
      setError("Could not read that image. Please choose another file.");
    }
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center text-olive-muted">Loading catalog…</main>
      </>
    );
  }

  const markedPrice = Number(newProduct.markedPrice);
  const actualPrice = Number(newProduct.actualPrice);
  const discount = markedPrice > actualPrice && actualPrice > 0
    ? Math.round(((markedPrice - actualPrice) / markedPrice) * 100)
    : 0;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-16">
        <Link href="/admin/landing" className="text-sm text-terracotta hover:underline">Back to landing editor</Link>
        <p className="mt-8 text-xs uppercase tracking-[0.24em] text-terracotta">Store management</p>
        <h1 className="mt-2 font-display text-4xl text-olive">Products catalog</h1>
        <p className="mt-3 text-olive-muted">Every product saved here appears once in the customer collection.</p>

        <section className="mt-10 rounded-3xl bg-ivory p-8 ring-1 ring-sand">
          <h2 className="font-display text-2xl text-olive">Add another product</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Product name" value={newProduct.name} onChange={(value) => setNewProduct((current) => ({ ...current, name: value }))} />
            <Field label="Category" value={newProduct.category} onChange={(value) => setNewProduct((current) => ({ ...current, category: value }))} />
            <Field label="Marked price (₹)" type="number" value={newProduct.markedPrice} onChange={(value) => setNewProduct((current) => ({ ...current, markedPrice: value }))} />
            <Field label="Actual price (₹)" type="number" value={newProduct.actualPrice} onChange={(value) => setNewProduct((current) => ({ ...current, actualPrice: value }))} />
            <label className="block text-sm text-olive sm:col-span-2">
              Product image
              <input required type="file" accept="image/*" onChange={onImageSelected} className="mt-1 block w-full rounded-xl border border-sand bg-cream px-3 py-2" />
            </label>
            {discount > 0 ? <p className="text-sm text-sage-deep sm:col-span-2">Customer discount: {discount}% off</p> : null}
            <button type="button" onClick={addProduct} className="w-fit rounded-full bg-terracotta px-6 py-2.5 text-sm text-ivory hover:bg-terracotta-dark">Add product</button>
            {error ? <p className="text-sm text-terracotta sm:col-span-2">{error}</p> : null}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-ivory p-8 ring-1 ring-sand">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl text-olive">All products</h2>
            <span className="text-sm text-olive-muted">{products.length} product{products.length === 1 ? "" : "s"}</span>
          </div>
          {products.length === 0 ? <p className="mt-6 text-sm text-olive-muted">No products added yet.</p> : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const productDiscount = product.markedPrice > product.actualPrice
                  ? Math.round(((product.markedPrice - product.actualPrice) / product.markedPrice) * 100)
                  : 0;
                return (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-sand bg-cream">
                    <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-olive-muted">{product.category}</p>
                      <h3 className="mt-1 font-display text-xl text-olive">{product.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-terracotta">₹{product.actualPrice.toLocaleString("en-IN")}</span>
                        <span className="text-olive-muted line-through">₹{product.markedPrice.toLocaleString("en-IN")}</span>
                        {productDiscount > 0 ? <span className="text-sage-deep">{productDiscount}% off</span> : null}
                      </div>
                      <button type="button" onClick={() => removeProduct(product.id)} className="mt-4 w-full rounded-full border border-terracotta/40 px-4 py-2 text-sm text-terracotta hover:bg-terracotta hover:text-ivory">Remove product</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {saved ? <p className="mt-6 text-sm text-sage-deep">Catalog saved.</p> : null}
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-olive">
      {label}
      <input required type={type} min={type === "number" ? "0" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 outline-none focus:border-sage" />
    </label>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not load image"));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
