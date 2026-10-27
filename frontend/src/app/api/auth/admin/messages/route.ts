import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { ContactMessage } from "@/lib/server/models";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const messages = await ContactMessage.find()
      .select("name email message createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Admin messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
