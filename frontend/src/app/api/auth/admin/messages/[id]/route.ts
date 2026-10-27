import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { ContactMessage } from "@/lib/server/models";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { id } = await params;
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Message cleared" });
  } catch (error) {
    console.error("Admin clear message error:", error);
    return NextResponse.json({ error: "Could not clear message" }, { status: 400 });
  }
}
