import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/server/db";
import { requireAdmin, publicUser, signToken } from "@/lib/server/auth";
import { User } from "@/lib/server/models";
import { isStrongPassword } from "@/lib/server/password";

export async function PATCH(req: NextRequest) {
  try {
    await connectDb();
    const admin = await requireAdmin(req);
    if ("error" in admin) {
      return NextResponse.json({ error: admin.error }, { status: admin.status });
    }

    const { currentPassword, name, email, newPassword } = (await req.json()) as {
      currentPassword?: string;
      name?: string;
      email?: string;
      newPassword?: string;
    };

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    const user = await User.findById(admin.user.id);
    if (!user) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    if (name?.trim()) {
      user.name = name.trim();
    }

    if (email?.trim()) {
      const nextEmail = email.toLowerCase().trim();
      const taken = await User.findOne({
        email: nextEmail,
        _id: { $ne: user._id },
      });
      if (taken) {
        return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
      }
      user.email = nextEmail;
    }

    if (newPassword) {
      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          { error: "New password must be 10+ characters with upper, lower, number, and symbol" },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    const payload = publicUser(user);
    const token = signToken(payload);
    return NextResponse.json({ token, user: payload });
  } catch (error) {
    console.error("Update credentials error:", error);
    return NextResponse.json({ error: "Could not update credentials" }, { status: 500 });
  }
}
