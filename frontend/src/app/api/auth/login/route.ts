import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/server/db";
import { User } from "@/lib/server/models";
import { publicUser, signToken } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { email, password } = (await req.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const payload = publicUser(user);
    const token = signToken(payload);
    return NextResponse.json({ token, user: payload });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Could not sign in" }, { status: 500 });
  }
}
