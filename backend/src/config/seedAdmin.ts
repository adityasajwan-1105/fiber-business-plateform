import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log("Admin account already exists in MongoDB (dashboard can change it)");
    return;
  }

  await User.create({
    name: "Madeye Admin",
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 12),
    role: "admin",
  });

  console.log(`First admin seeded: ${email}`);
}
