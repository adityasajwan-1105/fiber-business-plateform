import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
