export type LandingContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  heroImageUrl: string;
  productsEyebrow: string;
  productsTitle: string;
  productsCopy: string;
  collectionsTitle: string;
  collectionsCopy: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutCopy: string;
  aboutImageUrl: string;
  supportEyebrow: string;
  supportTitle: string;
  footerTitle: string;
  footerCopy: string;
  instagramHandle: string;
  facebookHandle: string;
  companyEmail: string;
};

export const defaultLandingContent: LandingContent = {
  heroEyebrow: "Home decor atelier",
  heroTitle: "Pieces that help a room bloom.",
  heroCopy:
    "Flower pots, decorative objects, and quiet details made to bring warmth into everyday spaces.",
  heroImageUrl: "/hero.png",
  productsEyebrow: "The collection",
  productsTitle: "Objects with a little soul",
  productsCopy:
    "Explore handcrafted accents, planters, and vessels designed to live beautifully with you.",
  collectionsTitle: "Find your corner",
  collectionsCopy:
    "Build a home that feels collected, personal, and ready for the next season of life.",
  aboutEyebrow: "Our story",
  aboutTitle: "Made for rooms that want to bloom.",
  aboutCopy:
    "Madeye Enterprises is a home decor atelier for pieces that make daily rituals feel more considered.\n\nWe bring together earthy materials, expressive forms, and useful beauty for homes with a point of view.",
  aboutImageUrl: "",
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

    return {
      ...defaultLandingContent,
      ...JSON.parse(saved),
    };
  } catch {
    return defaultLandingContent;
  }
}
