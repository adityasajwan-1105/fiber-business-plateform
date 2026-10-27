import { Router, type Response } from "express";
import { Product } from "../models/Product.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import type { AuthRequest } from "../types/auth.js";
import { persistImageValue, publicApiBase } from "../utils/persistMedia.js";

const router = Router();

// Public: GET all products
router.get("/", async (_req, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.set("Cache-Control", "no-store, max-age=0");
    res.json({ products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Admin only: POST add new product
router.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, category, markedPrice, actualPrice, image, accent, shape } =
        req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "Product name is required." });
        return;
      }
      if (!category || typeof category !== "string" || !category.trim()) {
        res.status(400).json({ error: "Category is required." });
        return;
      }
      if (!image || typeof image !== "string" || !image.trim()) {
        res.status(400).json({ error: "Product image is required." });
        return;
      }

      const numMarked = Number(markedPrice);
      const numActual = Number(actualPrice);

      if (isNaN(numMarked) || isNaN(numActual) || numMarked <= 0 || numActual <= 0) {
        res.status(400).json({ error: "Valid marked and actual prices are required." });
        return;
      }
      if (numActual > numMarked) {
        res.status(400).json({ error: "Actual price cannot exceed marked price." });
        return;
      }

      const validShapes = ["pot", "vase", "hanging", "lantern", "basket", "art"];
      const finalShape = validShapes.includes(shape) ? shape : "pot";

      const product = await Product.create({
        name: name.trim(),
        category: category.trim(),
        markedPrice: numMarked,
        actualPrice: numActual,
        image: await persistImageValue(image.trim(), publicApiBase(req)),
        accent: accent || "#c45c3e",
        shape: finalShape,
      });

      res.status(201).json({ product });
    } catch (error) {
      console.error("Failed to create product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

// Admin only: DELETE product by id
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await Product.findByIdAndDelete(id);

      if (!deleted) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({ message: "Product deleted successfully", id });
    } catch (error) {
      console.error("Failed to delete product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

export default router;
