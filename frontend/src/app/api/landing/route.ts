import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { LandingContent } from "@/lib/server/models";
import { requireAdmin } from "@/lib/server/auth";
import { persistLandingMedia, publicApiBase } from "@/lib/server/persist";

export async function GET() {
  try {
    await connectDb();
    let content = await LandingContent.findOne({ key: "default" });
    if (!content) {
      content = await LandingContent.create({ key: "default" });
    }
    return NextResponse.json(
      { content },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch landing content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const body = (await req.json()) as Record<string, unknown>;
    delete body._id;
    delete body.key;
    delete body.createdAt;
    delete body.updatedAt;

    const persisted = await persistLandingMedia(body, publicApiBase(req));
    const content = await LandingContent.findOneAndUpdate(
      { key: "default" },
      { $set: persisted },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ content, message: "Landing content saved successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update landing content" }, { status: 500 });
  }
}
