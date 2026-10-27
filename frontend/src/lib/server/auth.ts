import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { User } from "./models";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

function secret() {
  return process.env.JWT_SECRET || "dev-secret";
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret(), { expiresIn: "7d" });
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, secret()) as AuthUser;
    const user = await User.findById(payload.id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return { error: "Sign in required", status: 401 } as const;
  if (user.role !== "admin") return { error: "Admin access only", status: 403 } as const;
  return { user };
}

export function publicUser(user: { id: string; name: string; email: string; role: string }): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "user",
  };
}
