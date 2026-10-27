"use client";

import { useEffect, useState } from "react";
import { About } from "@/components/About";
import { Collections } from "@/components/Collections";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { Support } from "@/components/Support";
import { fetchPublicLandingContent, fetchPublicProducts } from "@/lib/api";
import { defaultLandingContent, type LandingContent } from "@/lib/landingContent";
import type { Product } from "@/data/products";

export default function Home() {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [fetchedContent, fetchedProducts] = await Promise.all([
          fetchPublicLandingContent(),
          fetchPublicProducts(),
        ]);
        if (isMounted) {
          setContent(fetchedContent);
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Could not load published content:", error);
      }
    }

    loadData();

    const refreshData = () => {
      loadData();
    };

    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    }, 30_000);

    window.addEventListener("madeye-content-updated", refreshData);
    window.addEventListener("focus", refreshData);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("madeye-content-updated", refreshData);
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  return (
    <>
      <Header transparent />
      <main className="flex-1">
        <Hero content={content} />
        <ProductShowcase products={products} content={content} />
        <Collections content={content} />
        <About content={content} />
        <Support content={content} />
      </main>
      <Footer content={content} />
    </>
  );
}
