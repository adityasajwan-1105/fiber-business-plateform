import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { StoredImage } from "@/lib/server/models";
import { requireAdmin } from "@/lib/server/auth";
import { publicApiBase } from "@/lib/server/persist";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "An image file is required." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const contentType = file.type?.startsWith("image/") ? file.type : "image/webp";
    const image = await StoredImage.create({ contentType, data: bytes });

    return NextResponse.json(
      { url: `${publicApiBase(req)}/api/images/${image._id.toString()}` },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not store the uploaded image." }, { status: 500 });
  }
}
