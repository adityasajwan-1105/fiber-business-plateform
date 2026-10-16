"use client";

import { useEffect, useState } from "react";
import { About } from "@/components/About";
import { Collections } from "@/components/Collections";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductShowcase } from "@/components/ProductShowcase";
import { Support } from "@/components/Support";
import { getAdminProducts, type Product } from "@/data/products";
import { defaultLandingContent, getLandingContent, type LandingContent } from "@/lib/landingContent";

export default function Home() {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    window.setTimeout(() => {
      setContent(getLandingContent());
      setProducts(getAdminProducts());
    }, 0);
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
