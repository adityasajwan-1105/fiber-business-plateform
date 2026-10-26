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
  type CollectionCategory,
  defaultCollectionCategories,
  type AboutCollageItem,
  defaultAboutCollage,
} from "@/lib/landingContent";

export default function LandingEditorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);
  const [saved, setSaved] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);
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

  function updateHeroImages(newImages: string[]) {
    setContent((current) => ({
      ...current,
      heroImages: newImages,
      heroImageUrl: newImages[0] || "",
    }));
    setSaved(false);
  }

  function updateHeroRotationInterval(interval: number) {
    setContent((current) => ({
      ...current,
      heroRotationInterval: interval,
    }));
    setSaved(false);
  }

  function updateCollectionsCategories(categories: CollectionCategory[]) {
    setContent((current) => ({
      ...current,
      collectionCategories: categories,
    }));
    setSaved(false);
  }

  function toggleCollectionsSection(show: boolean) {
    setContent((current) => ({
      ...current,
      showCollectionsSection: show,
    }));
    setSaved(false);
  }

  function updateAboutCollage(collage: AboutCollageItem[]) {
    setContent((current) => ({
      ...current,
      aboutCollage: collage,
    }));
    setSaved(false);
  }

  function toggleAboutSection(show: boolean) {
    setContent((current) => ({
      ...current,
      showAboutSection: show,
    }));
    setSaved(false);
  }

  function setAboutLayout(layout: "collage" | "single") {
    setContent((current) => ({
      ...current,
      aboutLayout: layout,
    }));
    setSaved(false);
  }

  async function onAddHeroLocalImage(file: File) {
    try {
      const image = await compressImage(file);
      const expectedRatio = 1;
      const imageRatio = image.width / image.height;
      if (Math.abs(imageRatio - expectedRatio) > 0.15) {
        setImageNote({
          field: "heroImageUrl",
          message: "Hero images look best as a square (1:1 ratio). This image will fit with auto-crop.",
        });
      } else {
        setImageNote(null);
      }
      const existing = (content.heroImages && content.heroImages.length > 0)
        ? content.heroImages
        : [content.heroImageUrl || "/hero.png"];
      updateHeroImages([...existing, image.dataUrl]);
    } catch {
      setSaved(false);
      setImageNote({
        field: "heroImageUrl",
        message: "Could not read that image. Please choose a PNG, JPG, or WebP file.",
      });
    }
  }

  function saveCurrentContent(sectionIdentifier?: string) {
    localStorage.setItem("madeye-landing-content", JSON.stringify(content));
    window.dispatchEvent(new Event("storage"));
    setSaved(true);
    if (sectionIdentifier) {
      setSavedSection(sectionIdentifier);
      setTimeout(() => {
        setSavedSection((curr) => (curr === sectionIdentifier ? null : curr));
      }, 4000);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCurrentContent("all");
  }

  function resetContent() {
    setContent(defaultLandingContent);
    localStorage.removeItem("madeye-landing-content");
    window.dispatchEvent(new Event("storage"));
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
            <HeroImagesManager
              images={content.heroImages && content.heroImages.length > 0 ? content.heroImages : [content.heroImageUrl || "/hero.png"]}
              interval={content.heroRotationInterval || 4}
              onImagesChange={updateHeroImages}
              onIntervalChange={updateHeroRotationInterval}
              onAddLocalImage={onAddHeroLocalImage}
            />
            {imageNote?.field === "heroImageUrl" ? <p className="text-sm text-terracotta">{imageNote.message}</p> : null}
          </EditorSection>

          <EditorSection title="Products section">
            <EditorField label="Eyebrow" maxLength={40} value={content.productsEyebrow} onChange={(value) => updateField("productsEyebrow", value)} />
            <EditorField label="Title" maxLength={80} value={content.productsTitle} onChange={(value) => updateField("productsTitle", value)} />
            <EditorField label="Description" maxLength={240} value={content.productsCopy} multiline onChange={(value) => updateField("productsCopy", value)} />
          </EditorSection>

          <CollectionsSectionManager
            showSection={content.showCollectionsSection !== false}
            onToggleSection={toggleCollectionsSection}
            title={content.collectionsTitle}
            onTitleChange={(value) => updateField("collectionsTitle", value)}
            copy={content.collectionsCopy}
            onCopyChange={(value) => updateField("collectionsCopy", value)}
            categories={content.collectionCategories ?? defaultCollectionCategories}
            onCategoriesChange={updateCollectionsCategories}
            onSaveSection={() => saveCurrentContent("collections")}
            isSaved={savedSection === "collections"}
          />

          <AboutSectionManager
            showSection={content.showAboutSection !== false}
            onToggleSection={toggleAboutSection}
            eyebrow={content.aboutEyebrow}
            onEyebrowChange={(val) => updateField("aboutEyebrow", val)}
            title={content.aboutTitle}
            onTitleChange={(val) => updateField("aboutTitle", val)}
            copy={content.aboutCopy}
            onCopyChange={(val) => updateField("aboutCopy", val)}
            layout={content.aboutLayout || "collage"}
            onLayoutChange={setAboutLayout}
            collage={content.aboutCollage ?? defaultAboutCollage}
            onCollageChange={updateAboutCollage}
            singleImageUrl={content.aboutImageUrl}
            onSingleImageUrlChange={(val) => updateField("aboutImageUrl", val)}
            onSingleImageFileChange={(event) => onImageSelected("aboutImageUrl", event)}
            imageNote={imageNote?.field === "aboutImageUrl" ? imageNote.message : null}
            onSaveSection={() => saveCurrentContent("about")}
            isSaved={savedSection === "about"}
          />

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
            <button type="submit" className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-ivory hover:bg-terracotta-dark shadow-sm">
              Save landing page
            </button>
            <button type="button" onClick={resetContent} className="rounded-full border border-olive/20 px-5 py-2.5 text-sm text-olive">
              Reset to defaults
            </button>
            {saved ? <p className="text-sm font-medium text-sage-deep">Landing page saved. Changes are live!</p> : null}
          </div>
        </form>

        {/* Floating sticky quick-save action bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 rounded-full bg-olive/95 px-6 py-2.5 text-ivory shadow-2xl backdrop-blur-md ring-1 ring-sand/30">
          <span className="text-xs text-ivory/80 hidden sm:inline">
            Site Editor
          </span>
          <button
            type="button"
            onClick={() => saveCurrentContent("floating")}
            className={`rounded-full px-5 py-2 text-xs font-semibold text-ivory transition shadow-sm ${
              savedSection === "floating"
                ? "bg-sage-deep hover:bg-sage"
                : "bg-terracotta hover:bg-terracotta-dark"
            }`}
          >
            {savedSection === "floating" ? "✓ Saved live!" : "💾 Save all changes"}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sand hover:text-ivory hover:underline inline-flex items-center gap-1"
          >
            View live site ↗
          </a>
        </div>
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

function HeroImagesManager({
  images,
  interval,
  onImagesChange,
  onIntervalChange,
  onAddLocalImage,
}: {
  images: string[];
  interval: number;
  onImagesChange: (images: string[]) => void;
  onIntervalChange: (interval: number) => void;
  onAddLocalImage: (file: File) => Promise<void>;
}) {
  const [urlInput, setUrlInput] = useState("");
  const [previewIdx, setPreviewIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setPreviewIdx((prev) => (prev + 1) % images.length);
    }, (interval || 4) * 1000);
    return () => clearInterval(t);
  }, [images.length, interval]);

  useEffect(() => {
    if (previewIdx >= images.length) {
      setPreviewIdx(0);
    }
  }, [images.length, previewIdx]);

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onImagesChange([...images, trimmed]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    if (images.length <= 1) {
      alert("At least one image is required for the hero section.");
      return;
    }
    const next = images.filter((_, i) => i !== index);
    onImagesChange(next);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, item);
    onImagesChange(copy);
  };

  return (
    <div className="space-y-6 rounded-2xl bg-cream/70 p-5 ring-1 ring-sand/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-olive">
            Rotating Hero Images ({images.length})
          </h3>
          <p className="text-xs text-olive-muted">
            These images rotate in the hero section animation at a fixed interval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-olive">Rotation Speed:</label>
          <select
            value={interval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="rounded-xl border border-sand bg-ivory px-3 py-1.5 text-xs text-olive outline-none focus:border-sage"
          >
            <option value={3}>3 seconds (Fast)</option>
            <option value={4}>4 seconds (Recommended)</option>
            <option value={5}>5 seconds (Relaxed)</option>
            <option value={6}>6 seconds (Slow)</option>
            <option value={8}>8 seconds (Gentle)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Live Animation Mini-Preview */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-sand bg-ivory p-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-terracotta">
            Live Preview
          </p>
          <div className="relative aspect-square w-full max-w-[190px] overflow-hidden rounded-2xl bg-cream shadow-md">
            {images.map((src, idx) => (
              <img
                key={`${src}-${idx}`}
                src={src}
                alt={`Preview ${idx + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  idx === previewIdx ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}
            <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === previewIdx ? "w-4 bg-terracotta" : "w-1.5 bg-ivory/80"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-olive-muted">
            Slide {previewIdx + 1} of {images.length} • changes every {interval}s
          </p>
        </div>

        {/* Image list & actions */}
        <div className="space-y-3 md:col-span-2">
          {images.map((imgUrl, idx) => (
            <div
              key={`${imgUrl}-${idx}`}
              className="flex items-center gap-3 rounded-xl border border-sand/70 bg-ivory p-2.5 transition hover:border-sage"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                <img
                  src={imgUrl}
                  alt={`Hero ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-0.5 left-0.5 rounded bg-olive/80 px-1 py-0.2 text-[9px] font-bold text-ivory">
                  #{idx + 1}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-olive">
                  {imgUrl.startsWith("data:") ? "Custom uploaded image (data URL)" : imgUrl}
                </p>
                <p className="text-[11px] text-olive-muted">
                  {idx === 0 ? "First slide (Hero cover)" : `Slide position #${idx + 1}`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, "up")}
                  className="rounded-lg border border-sand px-2.5 py-1 text-xs text-olive hover:bg-cream disabled:opacity-30"
                  title="Move earlier"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, "down")}
                  className="rounded-lg border border-sand px-2.5 py-1 text-xs text-olive hover:bg-cream disabled:opacity-30"
                  title="Move later"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="rounded-lg border border-terracotta/30 px-2.5 py-1 text-xs text-terracotta hover:bg-terracotta/10"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Add Image options */}
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-sand bg-ivory/60 p-4">
            <p className="text-xs font-medium text-olive">Add new image to animation:</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-full bg-olive px-4 py-2 text-xs font-medium text-ivory transition hover:bg-olive-muted">
                + Choose local file
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await onAddLocalImage(file);
                      e.target.value = "";
                    }
                  }}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-olive-muted">or</span>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL (e.g. /hero-2.jpg or https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  className="w-full rounded-xl border border-sand bg-cream px-3 py-1.5 text-xs text-olive outline-none focus:border-sage"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="shrink-0 rounded-full border border-olive/20 px-3 py-1.5 text-xs text-olive hover:bg-cream disabled:opacity-40"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TONE_PRESETS = [
  {
    name: "Terracotta",
    value: "bg-terracotta/90 text-ivory",
    bgClass: "bg-terracotta",
  },
  {
    name: "Forest Sage",
    value: "bg-sage-deep text-ivory",
    bgClass: "bg-sage-deep",
  },
  {
    name: "Warm Gold",
    value: "bg-gold text-olive",
    bgClass: "bg-gold",
  },
  {
    name: "Deep Olive",
    value: "bg-olive text-ivory",
    bgClass: "bg-olive",
  },
  {
    name: "Meadow Sage",
    value: "bg-sage text-ivory",
    bgClass: "bg-sage",
  },
  {
    name: "Dark Terracotta",
    value: "bg-terracotta-dark text-ivory",
    bgClass: "bg-terracotta-dark",
  },
  {
    name: "Sandstone",
    value: "bg-sand text-olive",
    bgClass: "bg-sand",
  },
  {
    name: "Warm Earth",
    value: "bg-cream-dark text-olive",
    bgClass: "bg-cream-dark",
  },
];

function CollectionsSectionManager({
  showSection,
  onToggleSection,
  title,
  onTitleChange,
  copy,
  onCopyChange,
  categories,
  onCategoriesChange,
  onSaveSection,
  isSaved,
}: {
  showSection: boolean;
  onToggleSection: (show: boolean) => void;
  title: string;
  onTitleChange: (val: string) => void;
  copy: string;
  onCopyChange: (val: string) => void;
  categories: CollectionCategory[];
  onCategoriesChange: (cats: CollectionCategory[]) => void;
  onSaveSection: () => void;
  isSaved: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddCategory = () => {
    const newId = `col-${Date.now()}`;
    const newCat: CollectionCategory = {
      id: newId,
      title: "New Category",
      copy: "Describe the pieces or style in this category.",
      tone: "bg-terracotta/90 text-ivory",
      link: "/catalog",
    };
    onCategoriesChange([...categories, newCat]);
    setExpandedId(newId);
  };

  const handleRemoveCategory = (index: number) => {
    const target = categories[index];
    if (confirm(`Are you sure you want to delete "${target?.title || "this category"}"?`)) {
      const next = categories.filter((_, i) => i !== index);
      onCategoriesChange(next);
      if (expandedId === target?.id) setExpandedId(null);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const copyList = [...categories];
    const [item] = copyList.splice(index, 1);
    copyList.splice(targetIndex, 0, item);
    onCategoriesChange(copyList);
  };

  const handleUpdateItem = (index: number, updates: Partial<CollectionCategory>) => {
    const copyList = [...categories];
    copyList[index] = { ...copyList[index], ...updates };
    onCategoriesChange(copyList);
  };

  const handleResetToDefault = () => {
    if (confirm("Reset categories to default (Flower Pots, Home Accents, Living Greenery)?")) {
      onCategoriesChange(defaultCollectionCategories);
    }
  };

  return (
    <section className="rounded-3xl bg-ivory p-8 ring-1 ring-sand">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl text-olive">
              Collections section ("Find your corner")
            </h2>
            {showSection ? (
              <span className="rounded-full bg-sage-deep/10 px-3 py-0.5 text-xs font-medium text-sage-deep">
                Visible on site
              </span>
            ) : (
              <span className="rounded-full bg-terracotta/10 px-3 py-0.5 text-xs font-medium text-terracotta">
                Deleted / Hidden from site
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-olive-muted">
            Manage the section title, description, and individual category cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveSection}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-ivory shadow-sm transition ${
              isSaved ? "bg-sage-deep hover:bg-sage" : "bg-terracotta hover:bg-terracotta-dark"
            }`}
          >
            <span>💾</span>
            <span>{isSaved ? "✓ Saved to landing page!" : "Save Section"}</span>
          </button>

          {showSection ? (
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to delete / hide this section from the home page? You can restore it anytime.")) {
                  onToggleSection(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-terracotta/40 px-4 py-2 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-ivory"
            >
              <span aria-hidden="true">🗑️</span> Delete / Hide section
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleSection(true)}
              className="inline-flex items-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-xs font-medium text-ivory transition hover:bg-olive"
            >
              <span aria-hidden="true">↺</span> Restore section on home page
            </button>
          )}
        </div>
      </div>

      {!showSection ? (
        <div className="mt-6 rounded-2xl border border-terracotta/20 bg-terracotta/5 p-5 text-sm text-terracotta">
          <p className="font-medium">This entire section is currently deleted / hidden.</p>
          <p className="mt-1 text-xs opacity-90">
            Visitors will not see "Find your corner" on the landing page. Click <strong>"Restore section on home page"</strong> above whenever you want it back.
          </p>
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {/* Section title & copy */}
        <div className="space-y-4">
          <EditorField
            label="Section Title"
            maxLength={80}
            value={title}
            onChange={onTitleChange}
          />
          <EditorField
            label="Section Description"
            maxLength={240}
            value={copy}
            multiline
            onChange={onCopyChange}
          />
        </div>

        {/* Categories Manager */}
        <div className="mt-8 space-y-4 rounded-2xl bg-cream/70 p-6 ring-1 ring-sand/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-olive">
                Category Cards ({categories.length})
              </h3>
              <p className="text-xs text-olive-muted">
                Add, edit, reorder, or delete category cards shown in the grid.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="rounded-full border border-olive/20 px-3.5 py-1.5 text-xs text-olive hover:bg-cream"
                title="Reset to 3 default categories"
              >
                Reset to defaults
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="rounded-full bg-olive px-4 py-1.5 text-xs font-medium text-ivory transition hover:bg-olive-muted"
              >
                + Add new category
              </button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sand bg-ivory p-8 text-center text-sm text-olive-muted">
              No categories yet. Click <strong>"+ Add new category"</strong> to create one!
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {categories.map((cat, idx) => {
                const isExpanded = expandedId === cat.id || (expandedId === null && idx === 0);
                return (
                  <div
                    key={cat.id || idx}
                    className="overflow-hidden rounded-2xl border border-sand/80 bg-ivory shadow-sm transition hover:border-sage/80"
                  >
                    {/* Item Header / Summary Bar */}
                    <div className="flex items-center justify-between gap-3 bg-cream/40 px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive text-[11px] font-bold text-ivory">
                          {idx + 1}
                        </span>
                        <div
                          className={`h-4 w-4 shrink-0 rounded-full ${cat.tone?.split(" ")[0] || "bg-terracotta"}`}
                          title="Color tone"
                        />
                        <span className="truncate font-display text-base text-olive">
                          {cat.title || "Untitled Category"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="rounded-lg border border-sand px-2.5 py-1 text-xs text-olive hover:bg-cream disabled:opacity-30"
                          title="Move card up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={idx === categories.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="rounded-lg border border-sand px-2.5 py-1 text-xs text-olive hover:bg-cream disabled:opacity-30"
                          title="Move card down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(idx)}
                          className="rounded-lg border border-terracotta/30 px-2.5 py-1 text-xs text-terracotta hover:bg-terracotta/10"
                          title="Delete this category"
                        >
                          ✕ Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? "" : cat.id)}
                          className="rounded-lg border border-olive/20 px-3 py-1 text-xs text-olive hover:bg-cream"
                        >
                          {isExpanded ? "Collapse" : "Edit"}
                        </button>
                      </div>
                    </div>

                    {/* Edit Form & Live Preview */}
                    {isExpanded ? (
                      <div className="grid gap-6 p-5 md:grid-cols-5">
                        <div className="space-y-4 md:col-span-3">
                          <label className="block text-xs font-medium text-olive">
                            Category Title
                            <input
                              type="text"
                              maxLength={50}
                              value={cat.title}
                              onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                              placeholder="e.g. Flower Pots"
                              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-olive outline-none focus:border-sage"
                            />
                          </label>

                          <label className="block text-xs font-medium text-olive">
                            Category Description
                            <textarea
                              rows={3}
                              maxLength={200}
                              value={cat.copy}
                              onChange={(e) => handleUpdateItem(idx, { copy: e.target.value })}
                              placeholder="e.g. Terracotta, sage glaze, and planters..."
                              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-olive outline-none focus:border-sage"
                            />
                            <span className="mt-0.5 block text-right text-[11px] text-olive-muted">
                              {cat.copy.length}/200
                            </span>
                          </label>

                          <label className="block text-xs font-medium text-olive">
                            Link URL (Optional)
                            <input
                              type="text"
                              value={cat.link || ""}
                              onChange={(e) => handleUpdateItem(idx, { link: e.target.value })}
                              placeholder="e.g. /catalog or /catalog?cat=pots"
                              className="mt-1 w-full rounded-xl border border-sand bg-cream px-3 py-2 text-sm text-olive outline-none focus:border-sage"
                            />
                            <span className="mt-0.5 block text-[11px] text-olive-muted">
                              Leave blank if this card should not be clickable.
                            </span>
                          </label>

                          {/* Color Tone Presets */}
                          <div>
                            <span className="block text-xs font-medium text-olive">
                              Color Theme / Tone
                            </span>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {TONE_PRESETS.map((preset) => {
                                const isSelected = cat.tone === preset.value;
                                return (
                                  <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => handleUpdateItem(idx, { tone: preset.value })}
                                    className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                                      isSelected
                                        ? "border-olive bg-cream ring-2 ring-olive/20 font-semibold text-olive"
                                        : "border-sand/70 bg-ivory text-olive-muted hover:border-sage"
                                    }`}
                                  >
                                    <span className={`h-4 w-4 shrink-0 rounded-full ${preset.bgClass}`} />
                                    <span className="truncate">{preset.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Live Mini Card Preview */}
                        <div className="flex flex-col justify-center md:col-span-2">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-olive-muted">
                            Live Card Preview
                          </p>
                          <div
                            className={`flex min-h-48 flex-col justify-between rounded-3xl p-6 shadow-sm ${
                              cat.tone || "bg-terracotta/90 text-ivory"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-display text-xl leading-snug">
                                {cat.title || "Category Title"}
                              </h4>
                              {cat.link ? <span className="text-base">→</span> : null}
                            </div>
                            <p className="mt-2 text-xs leading-relaxed opacity-90">
                              {cat.copy || "Category description will appear here on your landing page."}
                            </p>
                          </div>
                          <p className="mt-2 text-center text-[11px] text-olive-muted">
                            {cat.link ? `Links to: ${cat.link}` : "Non-clickable card"}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section-level Save & Live Link Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-sand/60 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSaveSection}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-ivory shadow-sm transition ${
                isSaved ? "bg-sage-deep hover:bg-sage" : "bg-terracotta hover:bg-terracotta-dark"
              }`}
            >
              <span>💾</span>
              <span>Save "Find your corner" section</span>
            </button>
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-sage-deep">
                <span>✓</span> Section saved! Live on landing page.
              </span>
            ) : null}
          </div>
          <a
            href="/#collections"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline"
          >
            View live section on landing page ↗
          </a>
        </div>
      </div>
    </section>
  );
}

const ABOUT_TONE_PRESETS = [
  { name: "Sage", value: "bg-sage", bgClass: "bg-sage" },
  { name: "Terracotta", value: "bg-terracotta/80", bgClass: "bg-terracotta" },
  { name: "Warm Gold", value: "bg-gold/80", bgClass: "bg-gold" },
  { name: "Deep Sage", value: "bg-sage-deep", bgClass: "bg-sage-deep" },
  { name: "Olive", value: "bg-olive", bgClass: "bg-olive" },
  { name: "Dark Terracotta", value: "bg-terracotta-dark", bgClass: "bg-terracotta-dark" },
  { name: "Sandstone", value: "bg-sand", bgClass: "bg-sand" },
  { name: "Warm Earth", value: "bg-cream-dark", bgClass: "bg-cream-dark" },
];

const SAMPLE_GALLERY_IMAGES = [
  { label: "Hero Atelier", url: "/hero.png" },
  { label: "Planters & Pots", url: "/hero-2.jpg" },
  { label: "Artisan Vessels", url: "/hero-3.jpg" },
  { label: "Botanical Detail", url: "/hero-4.jpg" },
];

const SLOT_META = [
  { title: "Slot 1 (Top-Left)", defaultTone: "bg-sage" },
  { title: "Slot 2 (Top-Right, offset down)", defaultTone: "bg-terracotta/80" },
  { title: "Slot 3 (Bottom-Left, offset up)", defaultTone: "bg-gold/80" },
  { title: "Slot 4 (Bottom-Right)", defaultTone: "bg-sage-deep" },
];

function AboutSectionManager({
  showSection,
  onToggleSection,
  eyebrow,
  onEyebrowChange,
  title,
  onTitleChange,
  copy,
  onCopyChange,
  layout,
  onLayoutChange,
  collage,
  onCollageChange,
  singleImageUrl,
  onSingleImageUrlChange,
  onSingleImageFileChange,
  imageNote,
  onSaveSection,
  isSaved,
}: {
  showSection: boolean;
  onToggleSection: (show: boolean) => void;
  eyebrow: string;
  onEyebrowChange: (val: string) => void;
  title: string;
  onTitleChange: (val: string) => void;
  copy: string;
  onCopyChange: (val: string) => void;
  layout: "collage" | "single";
  onLayoutChange: (layout: "collage" | "single") => void;
  collage: AboutCollageItem[];
  onCollageChange: (items: AboutCollageItem[]) => void;
  singleImageUrl: string;
  onSingleImageUrlChange: (val: string) => void;
  onSingleImageFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  imageNote: string | null;
  onSaveSection: () => void;
  isSaved: boolean;
}) {
  const [activeSlotIdx, setActiveSlotIdx] = useState(0);

  const handleUpdateSlot = (index: number, updates: Partial<AboutCollageItem>) => {
    const next = [...collage];
    next[index] = { ...next[index], ...updates };
    onCollageChange(next);
  };

  const handleUploadSlotImage = async (index: number, file: File) => {
    try {
      const compressed = await compressImage(file);
      handleUpdateSlot(index, { imageUrl: compressed.dataUrl });
    } catch {
      alert("Could not load image. Please select a PNG, JPG, or WebP file.");
    }
  };

  const handleLoadSampleImages = () => {
    const sampleUrls = ["/hero.png", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"];
    const next = collage.map((slot, i) => ({
      ...slot,
      imageUrl: sampleUrls[i] || "",
    }));
    onCollageChange(next);
  };

  const handleResetToColorBlocks = () => {
    const next = collage.map((slot) => ({
      ...slot,
      imageUrl: "",
    }));
    onCollageChange(next);
  };

  const activeSlot = collage[activeSlotIdx] || collage[0];

  return (
    <section className="rounded-3xl bg-ivory p-8 ring-1 ring-sand">
      {/* Header and Delete/Hide Section Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl text-olive">
              About section ("Our Story")
            </h2>
            {showSection ? (
              <span className="rounded-full bg-sage-deep/10 px-3 py-0.5 text-xs font-medium text-sage-deep">
                Visible on site
              </span>
            ) : (
              <span className="rounded-full bg-terracotta/10 px-3 py-0.5 text-xs font-medium text-terracotta">
                Deleted / Hidden from site
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-olive-muted">
            Customize story copy, layout, and photos or color tones in the signature 4-box collage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveSection}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-ivory shadow-sm transition ${
              isSaved ? "bg-sage-deep hover:bg-sage" : "bg-terracotta hover:bg-terracotta-dark"
            }`}
          >
            <span>💾</span>
            <span>{isSaved ? "✓ Saved to landing page!" : "Save Section"}</span>
          </button>

          {showSection ? (
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to delete / hide the About section from the home page?")) {
                  onToggleSection(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-terracotta/40 px-4 py-2 text-xs font-medium text-terracotta transition hover:bg-terracotta hover:text-ivory"
            >
              <span aria-hidden="true">🗑️</span> Delete / Hide section
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleSection(true)}
              className="inline-flex items-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-xs font-medium text-ivory transition hover:bg-olive"
            >
              <span aria-hidden="true">↺</span> Restore section on home page
            </button>
          )}
        </div>
      </div>

      {!showSection ? (
        <div className="mt-6 rounded-2xl border border-terracotta/20 bg-terracotta/5 p-5 text-sm text-terracotta">
          <p className="font-medium">This entire section is currently deleted / hidden.</p>
          <p className="mt-1 text-xs opacity-90">
            Visitors will not see "Our story" on the landing page. Click <strong>"Restore section on home page"</strong> above whenever you want it back.
          </p>
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {/* Story Copy fields */}
        <div className="space-y-4">
          <EditorField
            label="Eyebrow"
            maxLength={40}
            value={eyebrow}
            onChange={onEyebrowChange}
          />
          <EditorField
            label="Title"
            maxLength={80}
            value={title}
            onChange={onTitleChange}
          />
          <EditorField
            label="Story / Description"
            maxLength={500}
            value={copy}
            multiline
            onChange={onCopyChange}
          />
        </div>

        {/* Layout Style Choice */}
        <div className="rounded-2xl bg-cream/70 p-5 ring-1 ring-sand/80">
          <span className="block text-xs font-medium text-olive">Visual Layout Style</span>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onLayoutChange("collage")}
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-medium transition ${
                layout === "collage"
                  ? "border-olive bg-ivory shadow-sm ring-2 ring-olive/20 text-olive"
                  : "border-sand bg-cream/50 text-olive-muted hover:border-sage"
              }`}
            >
              <span>🪟</span>
              <span>4-Block Asymmetrical Collage (Recommended)</span>
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("single")}
              className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-xs font-medium transition ${
                layout === "single"
                  ? "border-olive bg-ivory shadow-sm ring-2 ring-olive/20 text-olive"
                  : "border-sand bg-cream/50 text-olive-muted hover:border-sage"
              }`}
            >
              <span>🖼️</span>
              <span>Single Hero Banner Image</span>
            </button>
          </div>
        </div>

        {/* Layout Content Editors */}
        {layout === "single" ? (
          <div className="space-y-4 rounded-2xl bg-cream/70 p-6 ring-1 ring-sand/80">
            <EditorImageField
              label="About banner image"
              hint="Recommended: 1200 x 800 px, landscape 3:2. Maximum processed size: 1600 px."
              value={singleImageUrl}
              onUrlChange={onSingleImageUrlChange}
              onFileChange={onSingleImageFileChange}
            />
            {imageNote ? <p className="text-sm text-terracotta">{imageNote}</p> : null}
          </div>
        ) : (
          <div className="space-y-6 rounded-2xl bg-cream/70 p-6 ring-1 ring-sand/80">
            {/* Collage Toolbar & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-olive">
                  4-Block Asymmetrical Collage
                </h3>
                <p className="text-xs text-olive-muted">
                  Click any slot below or in the live preview to customize images and color tones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleImages}
                  className="rounded-full bg-olive px-3.5 py-1.5 text-xs font-medium text-ivory transition hover:bg-olive-muted"
                  title="Fill all 4 slots with atelier photos"
                >
                  ⚡ Load 4 atelier photos
                </button>
                <button
                  type="button"
                  onClick={handleResetToColorBlocks}
                  className="rounded-full border border-olive/20 px-3.5 py-1.5 text-xs text-olive hover:bg-cream"
                  title="Clear all images and restore the colored blocks"
                >
                  🎨 Reset to 4 color blocks
                </button>
              </div>
            </div>

            {/* Collage Grid: Live Preview & Slot Editor */}
            <div className="grid gap-8 lg:grid-cols-5 items-start">
              {/* Interactive Live Mini Collage Preview */}
              <div className="lg:col-span-2 rounded-2xl border border-sand bg-ivory p-5 shadow-sm text-center">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-terracotta">
                  Live Collage Preview (Click to Edit)
                </p>
                <div className="grid grid-cols-2 gap-3.5 p-2 max-w-[260px] mx-auto">
                  {collage.map((item, idx) => {
                    const stagger = idx === 1 ? "mt-5" : idx === 2 ? "-mt-5" : "";
                    const isSelected = activeSlotIdx === idx;
                    const tone = item.tone || SLOT_META[idx]?.defaultTone || "bg-sage";

                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => setActiveSlotIdx(idx)}
                        className={`group relative h-28 w-full overflow-hidden rounded-2xl transition-all duration-200 text-left ${stagger} ${tone} ${
                          isSelected
                            ? "ring-4 ring-olive scale-[1.03] shadow-md z-10"
                            : "ring-1 ring-sand/80 hover:scale-[1.02]"
                        }`}
                        title={`Click to edit ${SLOT_META[idx]?.title}`}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={`Slot ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                        <div className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                          #{idx + 1}
                        </div>
                        {isSelected ? (
                          <div className="absolute bottom-1.5 right-1.5 rounded bg-olive px-1 py-0.5 text-[9px] font-semibold text-ivory shadow">
                            Active
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-6 text-[11px] text-olive-muted">
                  Editing: <strong>{SLOT_META[activeSlotIdx]?.title}</strong>
                </p>
              </div>

              {/* Active Slot Editor Details */}
              <div className="lg:col-span-3 space-y-5 rounded-2xl border border-sand/80 bg-ivory p-6 shadow-sm">
                {/* Slot Selector Tabs */}
                <div className="flex flex-wrap gap-1.5 border-b border-sand/60 pb-3">
                  {SLOT_META.map((meta, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlotIdx(idx)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        activeSlotIdx === idx
                          ? "bg-olive text-ivory"
                          : "border border-sand bg-cream/40 text-olive hover:bg-cream"
                      }`}
                    >
                      Slot #{idx + 1}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base text-olive">
                    {SLOT_META[activeSlotIdx]?.title}
                  </h4>
                  {activeSlot?.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateSlot(activeSlotIdx, { imageUrl: "" })}
                      className="rounded-lg border border-terracotta/30 px-2.5 py-1 text-xs text-terracotta hover:bg-terracotta/10"
                      title="Clear image and use color block"
                    >
                      ✕ Remove image
                    </button>
                  ) : null}
                </div>

                {/* Upload or URL input */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-full bg-olive px-4 py-2 text-xs font-medium text-ivory transition hover:bg-olive-muted">
                      + Choose local image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadSlotImage(activeSlotIdx, file);
                            e.target.value = "";
                          }
                        }}
                        className="sr-only"
                      />
                    </label>

                    <span className="text-xs text-olive-muted">or paste URL:</span>
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. /hero-2.jpg or https://images.unsplash.com/..."
                    value={activeSlot?.imageUrl || ""}
                    onChange={(e) => handleUpdateSlot(activeSlotIdx, { imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-sand bg-cream px-3 py-2 text-xs text-olive outline-none focus:border-sage"
                  />

                  {/* Sample Gallery Quick Pick Buttons */}
                  <div>
                    <span className="block text-[11px] font-medium text-olive-muted mb-1.5">
                      Quick pick from atelier photo gallery:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_GALLERY_IMAGES.map((sample) => (
                        <button
                          key={sample.url}
                          type="button"
                          onClick={() => handleUpdateSlot(activeSlotIdx, { imageUrl: sample.url })}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
                            activeSlot?.imageUrl === sample.url
                              ? "border-olive bg-cream font-semibold text-olive ring-1 ring-olive/20"
                              : "border-sand/70 bg-ivory text-olive hover:bg-cream"
                          }`}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Tone / Background Accent */}
                <div>
                  <span className="block text-xs font-medium text-olive mb-1.5">
                    Accent Color / Fallback Tone
                  </span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ABOUT_TONE_PRESETS.map((preset) => {
                      const isSelected = activeSlot?.tone === preset.value;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleUpdateSlot(activeSlotIdx, { tone: preset.value })}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                            isSelected
                              ? "border-olive bg-cream ring-2 ring-olive/20 font-semibold text-olive"
                              : "border-sand/70 bg-ivory text-olive-muted hover:border-sage"
                          }`}
                        >
                          <span className={`h-4 w-4 shrink-0 rounded-full ${preset.bgClass}`} />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section-level Save & Live Link Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-sand/60 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSaveSection}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-ivory shadow-sm transition ${
                isSaved ? "bg-sage-deep hover:bg-sage" : "bg-terracotta hover:bg-terracotta-dark"
              }`}
            >
              <span>💾</span>
              <span>Save "Our story" section</span>
            </button>
            {isSaved ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-sage-deep">
                <span>✓</span> Section saved! Live on landing page.
              </span>
            ) : null}
          </div>
          <a
            href="/#about"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline"
          >
            View live section on landing page ↗
          </a>
        </div>
      </div>
    </section>
  );
}
