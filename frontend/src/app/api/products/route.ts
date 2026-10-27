import { NextRequest, NextResponse } from "next/server";
import { connectDb, seedProducts } from "@/lib/server/db";
import { Product } from "@/lib/server/models";
import { requireAdmin } from "@/lib/server/auth";
import { persistImageValue, publicApiBase } from "@/lib/server/persist";

export async function GET() {
  try {
    await connectDb();
    let products = await Product.find().sort({ createdAt: -1 });
    if (products.length === 0) {
      await seedProducts();
      products = await Product.find().sort({ createdAt: -1 });
    }
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { name, category, markedPrice, actualPrice, image, accent, shape } = await req.json();
    if (!name?.trim() || !category?.trim() || !image?.trim()) {
      return NextResponse.json(
        { error: "Product name, category, and image are required." },
        { status: 400 }
      );
    }

    const numMarked = Number(markedPrice);
    const numActual = Number(actualPrice);
    if (isNaN(numMarked) || isNaN(numActual) || numMarked <= 0 || numActual <= 0) {
      return NextResponse.json({ error: "Valid prices are required." }, { status: 400 });
    }
    if (numActual > numMarked) {
      return NextResponse.json(
        { error: "Actual price cannot exceed marked price." },
        { status: 400 }
      );
    }

    const validShapes = ["pot", "vase", "hanging", "lantern", "basket", "art"];
    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      markedPrice: numMarked,
      actualPrice: numActual,
      image: await persistImageValue(image.trim(), publicApiBase(req)),
      accent: accent || "#c45c3e",
      shape: validShapes.includes(shape) ? shape : "pot",
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
