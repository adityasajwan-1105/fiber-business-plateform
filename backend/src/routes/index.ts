import { Router } from "express";
import authRoutes from "./auth.js";
import imageRoutes from "./images.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Madeye Enterprises API is running" });
});

router.use("/auth", authRoutes);
router.use("/images", imageRoutes);

export default router;
