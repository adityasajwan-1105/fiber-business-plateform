import { Router } from "express";
import authRoutes from "./auth.js";
import imageRoutes from "./images.js";
import productRoutes from "./products.js";
import landingRoutes from "./landing.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Madeye Enterprises API is running" });
});

router.use("/auth", authRoutes);
router.use("/images", imageRoutes);
router.use("/products", productRoutes);
router.use("/landing", landingRoutes);

export default router;

