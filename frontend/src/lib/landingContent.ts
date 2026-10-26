export type CollectionCategory = {
  id: string;
  title: string;
  copy: string;
  tone: string;
  link?: string;
};

export type AboutCollageItem = {
  id: string;
  imageUrl: string;
  tone: string;
  alt?: string;
};

export type LandingContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  heroImageUrl: string;
  heroImages: string[];
  heroRotationInterval: number;
  productsEyebrow: string;
  productsTitle: string;
  productsCopy: string;
  collectionsTitle: string;
  collectionsCopy: string;
  showCollectionsSection: boolean;
  collectionCategories: CollectionCategory[];
  aboutEyebrow: string;
  aboutTitle: string;
  aboutCopy: string;
  aboutImageUrl: string;
  showAboutSection: boolean;
  aboutLayout: "collage" | "single";
  aboutCollage: AboutCollageItem[];
  supportEyebrow: string;
  supportTitle: string;
  footerTitle: string;
  footerCopy: string;
  instagramHandle: string;
  facebookHandle: string;
  companyEmail: string;
};

export const defaultAboutCollage: AboutCollageItem[] = [
  { id: "slot-1", imageUrl: "", tone: "bg-sage", alt: "Atelier handcrafted pieces" },
  { id: "slot-2", imageUrl: "", tone: "bg-terracotta/80", alt: "Warm terracotta planter" },
  { id: "slot-3", imageUrl: "", tone: "bg-gold/80", alt: "Decorative tabletop accent" },
  { id: "slot-4", imageUrl: "", tone: "bg-sage-deep", alt: "Living greenery and botanical details" },
];

export const defaultCollectionCategories: CollectionCategory[] = [
  {
    id: "flower-pots",
    title: "Flower Pots",
    copy: "Terracotta, sage glaze, and cascade planters for windowsills and courtyards.",
    tone: "bg-terracotta/90 text-ivory",
    link: "/catalog",
  },
  {
    id: "home-accents",
    title: "Home Accents",
    copy: "Lanterns, wall pieces, and objects that catch the evening light.",
    tone: "bg-sage-deep text-ivory",
    link: "/catalog",
  },
  {
    id: "living-greenery",
    title: "Living Greenery",
    copy: "Hanging planters and woven nests made for trailing leaves.",
    tone: "bg-gold text-olive",
    link: "/catalog",
  },
];

export const defaultLandingContent: LandingContent = {
  heroEyebrow: "Home decor atelier",
  heroTitle: "Pieces that help a room bloom.",
  heroCopy:
    "Flower pots, decorative objects, and quiet details made to bring warmth into everyday spaces.",
  heroImageUrl: "/hero.png",
  heroImages: ["/hero.png", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"],
  heroRotationInterval: 4,
  productsEyebrow: "The collection",
  productsTitle: "Objects with a little soul",
  productsCopy:
    "Explore handcrafted accents, planters, and vessels designed to live beautifully with you.",
  collectionsTitle: "Find your corner",
  collectionsCopy:
    "Build a home that feels collected, personal, and ready for the next season of life.",
  showCollectionsSection: true,
  collectionCategories: defaultCollectionCategories,
  aboutEyebrow: "Our story",
  aboutTitle: "Made for rooms that want to bloom.",
  aboutCopy:
    "Madeye Enterprises is a home decor atelier for pieces that make daily rituals feel more considered.\n\nWe bring together earthy materials, expressive forms, and useful beauty for homes with a point of view.",
  aboutImageUrl: "",
  showAboutSection: true,
  aboutLayout: "collage",
  aboutCollage: defaultAboutCollage,
  supportEyebrow: "Need a hand?",
  supportTitle: "We are here for the details.",
  footerTitle: "Madeye Enterprises",
  footerCopy: "Flower pots, decorative objects, and home décor for rooms that want to bloom.",
  instagramHandle: "@madeyeenterprises",
  facebookHandle: "Madeye Enterprises",
  companyEmail: "hello@madeyeenterprises.com",
};

export function getLandingContent(): LandingContent {
  if (typeof window === "undefined") return defaultLandingContent;

  try {
    const saved = window.localStorage.getItem("madeye-landing-content");
    if (!saved) return defaultLandingContent;

    const parsed = JSON.parse(saved);
    let heroImages = parsed.heroImages;
    if (!Array.isArray(heroImages) || heroImages.length === 0) {
      if (parsed.heroImageUrl) {
        heroImages = [parsed.heroImageUrl, "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"];
      } else {
        heroImages = defaultLandingContent.heroImages;
      }
    }

    const showCollectionsSection =
      parsed.showCollectionsSection !== undefined
        ? Boolean(parsed.showCollectionsSection)
        : true;

    const collectionCategories = Array.isArray(parsed.collectionCategories)
      ? parsed.collectionCategories
      : defaultCollectionCategories;

    const showAboutSection =
      parsed.showAboutSection !== undefined
        ? Boolean(parsed.showAboutSection)
        : true;

    const aboutLayout = parsed.aboutLayout === "single" ? "single" : "collage";

    const aboutCollage =
      Array.isArray(parsed.aboutCollage) && parsed.aboutCollage.length === 4
        ? parsed.aboutCollage
        : defaultAboutCollage;

    return {
      ...defaultLandingContent,
      ...parsed,
      showCollectionsSection,
      collectionCategories,
      showAboutSection,
      aboutLayout,
      aboutCollage,
      heroImages,
      heroImageUrl: parsed.heroImageUrl || heroImages[0] || defaultLandingContent.heroImageUrl,
      heroRotationInterval: parsed.heroRotationInterval || defaultLandingContent.heroRotationInterval,
    };
  } catch {
    return defaultLandingContent;
  }
}
