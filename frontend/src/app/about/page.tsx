"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { fetchPublicLandingContent } from "@/lib/api";
import { defaultLandingContent, type LandingContent } from "@/lib/landingContent";

export default function AboutPage() {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);

  useEffect(() => {
    fetchPublicLandingContent().then(setContent).catch(() => setContent(defaultLandingContent));
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 pt-12">
          <Link href="/" className="text-sm text-terracotta hover:underline">Back to home</Link>
        </div>
        <About content={content} />
        <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">
          <a href={`https://instagram.com/${content.instagramHandle.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
            <p className="text-xs uppercase tracking-[0.18em] text-terracotta">Instagram</p>
            <p className="mt-2 font-display text-xl text-olive">{content.instagramHandle}</p>
          </a>
          <a href={`https://facebook.com/${content.facebookHandle}`} target="_blank" rel="noreferrer" className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
            <p className="text-xs uppercase tracking-[0.18em] text-terracotta">Facebook</p>
            <p className="mt-2 font-display text-xl text-olive">{content.facebookHandle}</p>
          </a>
          <a href={`mailto:${content.companyEmail}`} className="rounded-3xl bg-ivory p-6 ring-1 ring-sand">
            <p className="text-xs uppercase tracking-[0.18em] text-terracotta">Email</p>
            <p className="mt-2 break-words font-display text-xl text-olive">{content.companyEmail}</p>
          </a>
        </section>
      </main>
      <Footer content={content} />
    </>
  );
}
