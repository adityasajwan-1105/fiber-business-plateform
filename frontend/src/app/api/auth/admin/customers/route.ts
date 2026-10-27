import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { User } from "@/lib/server/models";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const customers = await User.find({ role: "user" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Admin customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
