import mongoose, { Schema, type Document } from "mongoose";

export interface ILandingContent extends Document {
  key: string;
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
  collectionCategories: {
    id: string;
    title: string;
    copy: string;
    tone: string;
    link?: string;
  }[];
  aboutEyebrow: string;
  aboutTitle: string;
  aboutCopy: string;
  aboutImageUrl: string;
  showAboutSection: boolean;
  aboutLayout: "collage" | "single";
  aboutCollage: {
    id: string;
    imageUrl: string;
    tone: string;
    alt?: string;
  }[];
  supportEyebrow: string;
  supportTitle: string;
  footerTitle: string;
  footerCopy: string;
  instagramHandle: string;
  facebookHandle: string;
  companyEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const landingContentSchema = new Schema<ILandingContent>(
  {
    key: { type: String, default: "default", unique: true },
    heroEyebrow: { type: String, default: "Home decor atelier" },
    heroTitle: { type: String, default: "Pieces that help a room bloom." },
    heroCopy: {
      type: String,
      default:
        "Flower pots, decorative objects, and quiet details made to bring warmth into everyday spaces.",
    },
    heroImageUrl: { type: String, default: "/hero.png" },
    heroImages: {
      type: [String],
      default: ["/hero.png", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"],
    },
    heroRotationInterval: { type: Number, default: 4 },
    productsEyebrow: { type: String, default: "The collection" },
    productsTitle: { type: String, default: "Objects with a little soul" },
    productsCopy: {
      type: String,
      default:
        "Explore handcrafted accents, planters, and vessels designed to live beautifully with you.",
    },
    collectionsTitle: { type: String, default: "Find your corner" },
    collectionsCopy: {
      type: String,
      default:
        "Build a home that feels collected, personal, and ready for the next season of life.",
    },
    showCollectionsSection: { type: Boolean, default: true },
    collectionCategories: [
      {
        id: String,
        title: String,
        copy: String,
        tone: String,
        link: String,
      },
    ],
    aboutEyebrow: { type: String, default: "Our story" },
    aboutTitle: { type: String, default: "Made for rooms that want to bloom." },
    aboutCopy: {
      type: String,
      default:
        "Madeye Enterprises is a home decor atelier for pieces that make daily rituals feel more considered.\n\nWe bring together earthy materials, expressive forms, and useful beauty for homes with a point of view.",
    },
    aboutImageUrl: { type: String, default: "" },
    showAboutSection: { type: Boolean, default: true },
    aboutLayout: { type: String, enum: ["collage", "single"], default: "collage" },
    aboutCollage: [
      {
        id: String,
        imageUrl: String,
        tone: String,
        alt: String,
      },
    ],
    supportEyebrow: { type: String, default: "Need a hand?" },
    supportTitle: { type: String, default: "We are here for the details." },
    footerTitle: { type: String, default: "Madeye Enterprises" },
    footerCopy: {
      type: String,
      default:
        "Flower pots, decorative objects, and home décor for rooms that want to bloom.",
    },
    instagramHandle: { type: String, default: "@madeyeenterprises" },
    facebookHandle: { type: String, default: "Madeye Enterprises" },
    companyEmail: { type: String, default: "hello@madeyeenterprises.com" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const LandingContent = mongoose.model<ILandingContent>(
  "LandingContent",
  landingContentSchema
);
