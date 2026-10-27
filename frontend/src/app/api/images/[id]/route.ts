import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { StoredImage } from "@/lib/server/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;
    const image = await StoredImage.findById(id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const body = image.data as Buffer;
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": image.contentType || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
