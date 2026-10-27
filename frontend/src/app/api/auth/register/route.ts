import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/server/db";
import { User } from "@/lib/server/models";
import { publicUser, signToken } from "@/lib/server/auth";
import { isStrongPassword } from "@/lib/server/password";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, password, role, inviteCode } = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: "user" | "admin";
      inviteCode?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (role === "admin") {
      const validCode = process.env.ADMIN_INVITE_CODE;
      if (!validCode || inviteCode !== validCode) {
        return NextResponse.json({ error: "Invalid admin invite code" }, { status: 403 });
      }
      if (!isStrongPassword(password)) {
        return NextResponse.json(
          { error: "Admin password must be 10+ characters with upper, lower, number, and symbol" },
          { status: 400 }
        );
      }
    } else if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: role === "admin" ? "admin" : "user",
    });

    const payload = publicUser(user);
    const token = signToken(payload);
    return NextResponse.json({ token, user: payload }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
