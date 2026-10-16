"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  defaultLandingContent,
  getLandingContent,
  type LandingContent,
} from "@/lib/landingContent";

export default function LandingEditorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);
  const [saved, setSaved] = useState(false);
  const [imageNote, setImageNote] = useState<{
    field: "heroImageUrl" | "aboutImageUrl";
    message: string;
  } | null>(null);

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
    window.setTimeout(() => {
      setContent(getLandingContent());
    }, 0);
  }, [loading, user, router]);

  function updateField(field: keyof LandingContent, value: string) {
    setContent((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("madeye-landing-content", JSON.stringify(content));
    setSaved(true);
  }

  function resetContent() {
    setContent(defaultLandingContent);
    localStorage.removeItem("madeye-landing-content");
    setImageNote(null);
    setSaved(true);
  }

  async function onImageSelected(
    field: "heroImageUrl" | "aboutImageUrl",
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressImage(file);
      const expectedRatio = field === "heroImageUrl" ? 1 : 1.5;
      const imageRatio = image.width / image.height;
      if (Math.abs(imageRatio - expectedRatio) > 0.15) {
        setImageNote({
          field,
          message: field === "heroImageUrl"
            ? "Hero images work best as a square (1200 x 1200 px). This image will still fit safely."
            : "About images work best in a 3:2 landscape ratio (1200 x 800 px). This image will still fit safely.",
        });
      } else {
        setImageNote(null);
      }
      updateField(field, image.dataUrl);
    } catch {
      setSaved(false);
      setImageNote({
        field,
        message: "Could not read that image. Please choose a PNG, JPG, or WebP file.",
      });
    }
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center text-olive-muted">
          Loading editor…
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-16">
        <Link href="/admin" className="text-sm text-terracotta hover:underline">
          Back to admin profile
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.24em] text-terracotta">
          Site editor
        </p>
        <h1 className="mt-2 font-display text-4xl text-olive">Edit landing page</h1>
        <p className="mt-3 text-olive-muted">
          Update the copy and images shown on each section of the home page.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-8">
          <EditorSection title="Hero section">
            <EditorField label="Eyebrow" maxLength={40} value={content.heroEyebrow} onChange={(value) => updateField("heroEyebrow", value)} />
            <EditorField label="Title" maxLength={80} value={content.heroTitle} onChange={(value) => updateField("heroTitle", value)} />
            <EditorField label="Description" maxLength={240} value={content.heroCopy} multiline onChange={(value) => updateField("heroCopy", value)} />
            <EditorImageField
              label="Hero image"
              hint="Recommended: 1200 x 1200 px, square. Maximum processed size: 1600 px on the long edge."
              value={content.heroImageUrl}
              onUrlChange={(value) => updateField("heroImageUrl", value)}
              onFileChange={(event) => onImageSelected("heroImageUrl", event)}
            />
            {imageNote?.field === "heroImageUrl" ? <p className="text-sm text-terracotta">{imageNote.message}</p> : null}
          </EditorSection>

          <EditorSection title="Products section">
            <EditorField label="Eyebrow" maxLength={40} value={content.productsEyebrow} onChange={(value) => updateField("productsEyebrow", value)} />
            <EditorField label="Title" maxLength={80} value={content.productsTitle} onChange={(value) => updateField("productsTitle", value)} />
            <EditorField label="Description" maxLength={240} value={content.productsCopy} multiline onChange={(value) => updateField("productsCopy", value)} />
          </EditorSection>

          <EditorSection title="Collections section">
            <EditorField label="Title" maxLength={80} value={content.collectionsTitle} onChange={(value) => updateField("collectionsTitle", value)} />
            <EditorField label="Description" maxLength={240} value={content.collectionsCopy} multiline onChange={(value) => updateField("collectionsCopy", value)} />
          </EditorSection>

          <EditorSection title="About section">
            <EditorField label="Eyebrow" maxLength={40} value={content.aboutEyebrow} onChange={(value) => updateField("aboutEyebrow", value)} />
            <EditorField label="Title" maxLength={80} value={content.aboutTitle} onChange={(value) => updateField("aboutTitle", value)} />
            <EditorField label="Description" maxLength={400} value={content.aboutCopy} multiline onChange={(value) => updateField("aboutCopy", value)} />
            <EditorImageField
              label="About image"
              hint="Recommended: 1200 x 800 px, 3:2 landscape. Maximum processed size: 1600 px on the long edge."
              value={content.aboutImageUrl}
              onUrlChange={(value) => updateField("aboutImageUrl", value)}
              onFileChange={(event) => onImageSelected("aboutImageUrl", event)}
            />
            {imageNote?.field === "aboutImageUrl" ? <p className="text-sm text-terracotta">{imageNote.message}</p> : null}
          </EditorSection>

          <EditorSection title="Support section">
            <EditorField label="Eyebrow" maxLength={40} value={content.supportEyebrow} onChange={(value) => updateField("supportEyebrow", value)} />
            <EditorField label="Title" maxLength={80} value={content.supportTitle} onChange={(value) => updateField("supportTitle", value)} />
          </EditorSection>

          <EditorSection title="Footer section">
            <EditorField label="Business name" maxLength={50} value={content.footerTitle} onChange={(value) => updateField("footerTitle", value)} />
            <EditorField label="Description" maxLength={160} value={content.footerCopy} multiline onChange={(value) => updateField("footerCopy", value)} />
            <EditorField label="Instagram handle" maxLength={40} value={content.instagramHandle} onChange={(value) => updateField("instagramHandle", value)} />
            <EditorField label="Facebook handle or page ID" maxLength={80} value={content.facebookHandle} onChange={(value) => updateField("facebookHandle", value)} />
            <EditorField label="Company email" maxLength={160} value={content.companyEmail} onChange={(value) => updateField("companyEmail", value)} />
            <p className="text-xs text-olive-muted">Footer navigation and links stay fixed so the footer structure does not change.</p>
          </EditorSection>

          <Link
            href="/admin/catalog"
            className="flex items-center justify-between gap-6 rounded-3xl bg-terracotta p-8 text-ivory transition hover:bg-terracotta-dark"
          >
            <span>
              <span className="block text-4xl" aria-hidden="true">▦</span>
              <span className="mt-3 block font-display text-2xl">Products catalog</span>
              <span className="mt-2 block text-sm text-ivory/80">Manage images, prices, discounts, and all products.</span>
            </span>
            <span className="text-3xl" aria-hidden="true">→</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="rounded-full bg-terracotta px-6 py-2.5 text-sm text-ivory hover:bg-terracotta-dark">
              Save landing page
            </button>
            <button type="button" onClick={resetContent} className="rounded-full border border-olive/20 px-5 py-2.5 text-sm text-olive">
              Reset to defaults
            </button>
            {saved ? <p className="text-sm text-sage-deep">Landing page saved.</p> : null}
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}

function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-ivory p-8 ring-1 ring-sand">
      <h2 className="font-display text-2xl text-olive">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function EditorField({
  label,
  value,
  maxLength,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const className = "mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 text-olive outline-none focus:border-sage";
  return (
    <label className="block text-sm text-olive">
      {label}
      {multiline ? (
        <textarea maxLength={maxLength} rows={4} value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      ) : (
        <input maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
      <span className="mt-1 block text-right text-xs text-olive-muted">{value.length}/{maxLength}</span>
    </label>
  );
}

function EditorImageField({
  label,
  hint,
  value,
  onUrlChange,
  onFileChange,
}: {
  label: string;
  hint: string;
  value: string;
  onUrlChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="block text-sm text-olive">
      <label>
        {label} URL (optional)
        <input
          value={value.startsWith("data:") ? "Local image selected" : value}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://... or /image.jpg"
          className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 text-olive outline-none focus:border-sage"
        />
      </label>
      <p className="mt-1 text-xs text-olive-muted">{hint}</p>
      <label className="mt-3 inline-flex cursor-pointer rounded-full border border-olive/20 px-4 py-2 text-sm text-olive hover:bg-cream">
        Choose local image
        <input type="file" accept="image/*" onChange={onFileChange} className="sr-only" />
      </label>
      {value.startsWith("data:") ? (
        <span className="ml-3 text-xs text-sage-deep">Stored locally</span>
      ) : null}
    </div>
  );
}

function compressImage(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not load image"));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({
          dataUrl: canvas.toDataURL("image/webp", 0.8),
          width: canvas.width,
          height: canvas.height,
        });
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
