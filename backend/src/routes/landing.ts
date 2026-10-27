import { Router, type Response } from "express";
import { LandingContent } from "../models/LandingContent.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { persistLandingMedia, publicApiBase } from "../utils/persistMedia.js";

const router = Router();

const defaultAboutCollage = [
  { id: "slot-1", imageUrl: "", tone: "bg-sage", alt: "Atelier handcrafted pieces" },
  { id: "slot-2", imageUrl: "", tone: "bg-terracotta/80", alt: "Warm terracotta planter" },
  { id: "slot-3", imageUrl: "", tone: "bg-gold/80", alt: "Decorative tabletop accent" },
  { id: "slot-4", imageUrl: "", tone: "bg-sage-deep", alt: "Living greenery and botanical details" },
];

const defaultCollectionCategories = [
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

// Public: GET landing page content
router.get("/", async (_req, res: Response) => {
  try {
    let content = await LandingContent.findOne({ key: "default" });
    if (!content) {
      content = await LandingContent.create({
        key: "default",
        collectionCategories: defaultCollectionCategories,
        aboutCollage: defaultAboutCollage,
      });
    }
    res.set("Cache-Control", "no-store, max-age=0");
    res.json({ content });
  } catch (error) {
    console.error("Failed to fetch landing content:", error);
    res.status(500).json({ error: "Failed to fetch landing content" });
  }
});

// Admin only: PUT update landing page content
router.put(
  "/",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const updateData = { ...(req.body as Record<string, unknown>) };
      delete updateData._id;
      delete updateData.key;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const persisted = await persistLandingMedia(
        updateData,
        publicApiBase(req)
      );

      const content = await LandingContent.findOneAndUpdate(
        { key: "default" },
        { $set: persisted },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      res.json({ content, message: "Landing content saved successfully" });
    } catch (error) {
      console.error("Failed to update landing content:", error);
      res.status(500).json({ error: "Failed to update landing content" });
    }
  }
);

export default router;
