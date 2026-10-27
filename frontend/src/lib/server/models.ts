import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    markedPrice: { type: Number, required: true, min: 0 },
    actualPrice: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    accent: { type: String, default: "#c45c3e" },
    shape: {
      type: String,
      enum: ["pot", "vase", "hanging", "lantern", "basket", "art"],
      default: "pot",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id ? String(ret._id) : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const landingSchema = new Schema(
  {
    key: { type: String, default: "default", unique: true },
    heroEyebrow: String,
    heroTitle: String,
    heroCopy: String,
    heroImageUrl: String,
    heroImages: [String],
    heroRotationInterval: Number,
    productsEyebrow: String,
    productsTitle: String,
    productsCopy: String,
    collectionsTitle: String,
    collectionsCopy: String,
    showCollectionsSection: Boolean,
    collectionCategories: [
      { id: String, title: String, copy: String, tone: String, link: String },
    ],
    aboutEyebrow: String,
    aboutTitle: String,
    aboutCopy: String,
    aboutImageUrl: String,
    showAboutSection: Boolean,
    aboutLayout: { type: String, enum: ["collage", "single"], default: "collage" },
    aboutCollage: [{ id: String, imageUrl: String, tone: String, alt: String }],
    supportEyebrow: String,
    supportTitle: String,
    footerTitle: String,
    footerCopy: String,
    instagramHandle: String,
    facebookHandle: String,
    companyEmail: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const storedImageSchema = new Schema(
  {
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export const LandingContent =
  mongoose.models.LandingContent || mongoose.model("LandingContent", landingSchema);
export const StoredImage =
  mongoose.models.StoredImage || mongoose.model("StoredImage", storedImageSchema);
export const ContactMessage =
  mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
