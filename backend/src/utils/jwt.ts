import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";
import type { AuthUser } from "../types/auth.js";

function getSecret() {
  return process.env.JWT_SECRET || "dev-secret";
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    getSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, getSecret()) as {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}
