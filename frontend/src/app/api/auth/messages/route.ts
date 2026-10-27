import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/server/db";
import { ContactMessage } from "@/lib/server/models";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, message } = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    if (name.trim().length > 80 || email.trim().length > 160 || message.trim().length > 2000) {
      return NextResponse.json({ error: "Message details exceed the allowed length" }, { status: 400 });
    }

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ message: "Message sent" }, { status: 201 });
  } catch (error) {
    console.error("Contact message error:", error);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}
