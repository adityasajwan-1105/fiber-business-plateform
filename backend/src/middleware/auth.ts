import type { NextFunction, Response } from "express";
import { User } from "../models/User.js";
import type { AuthRequest } from "../types/auth.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: "Sign in required" });
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);

    if (!user) {
      res.status(401).json({ error: "Account not found" });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin access only" });
    return;
  }
  next();
}
