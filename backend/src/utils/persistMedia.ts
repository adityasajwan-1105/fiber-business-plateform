import type { Request } from "express";
import { StoredImage } from "../models/StoredImage.js";

export function publicApiBase(req: Request): string {
  const configured = process.env.PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const host = req.get("host");
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${host}`;
}

export async function persistImageValue(
  value: string | undefined,
  apiBase: string
): Promise<string> {
  if (!value) return "";
  if (!value.startsWith("data:")) return value;

  const match = value.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return "";

  const image = await StoredImage.create({
    contentType: match[1],
    data: Buffer.from(match[2], "base64"),
  });

  return `${apiBase}/api/images/${image._id.toString()}`;
}

export async function persistLandingMedia(
  content: Record<string, unknown>,
  apiBase: string
): Promise<Record<string, unknown>> {
  const next: Record<string, unknown> = { ...content };

  if (typeof next.heroImageUrl === "string") {
    next.heroImageUrl = await persistImageValue(next.heroImageUrl, apiBase);
  }
  if (typeof next.aboutImageUrl === "string") {
    next.aboutImageUrl = await persistImageValue(next.aboutImageUrl, apiBase);
  }
  if (Array.isArray(next.heroImages)) {
    next.heroImages = await Promise.all(
      next.heroImages.map((url) =>
        typeof url === "string" ? persistImageValue(url, apiBase) : url
      )
    );
  }
  if (Array.isArray(next.aboutCollage)) {
    next.aboutCollage = await Promise.all(
      next.aboutCollage.map(async (item) => {
        if (!item || typeof item !== "object") return item;
        const slot = item as { imageUrl?: string };
        return {
          ...slot,
          imageUrl: await persistImageValue(slot.imageUrl, apiBase),
        };
      })
    );
  }

  return next;
}
