import bcrypt from "bcryptjs";
import { Router } from "express";
import { User, type IUser } from "../models/User.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import type { AuthRequest, AuthUser } from "../types/auth.js";
import { signToken } from "../utils/jwt.js";
import { isStrongPassword } from "../utils/password.js";

const router = Router();

function publicUser(user: IUser): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, inviteCode } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: "user" | "admin";
      inviteCode?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    if (role === "admin") {
      if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
        res.status(403).json({ error: "Invalid admin invite code" });
        return;
      }
      if (!isStrongPassword(password)) {
        res.status(400).json({
          error:
            "Admin password must be 10+ characters with upper, lower, number, and symbol",
        });
        return;
      }
    } else if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    let accountRole: "user" | "admin" = "user";
    if (role === "admin") {
      accountRole = "admin";
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: accountRole,
    });

    const payload = publicUser(user);
    const token = signToken(payload);
    res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const payload = publicUser(user);
    const token = signToken(payload);
    res.json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not sign in" });
  }
});

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.post("/messages", async (req, res) => {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Name, email, and message are required" });
    return;
  }

  if (name.trim().length > 80 || email.trim().length > 160 || message.trim().length > 2000) {
    res.status(400).json({ error: "Message details exceed the allowed length" });
    return;
  }

  try {
    await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    res.status(201).json({ message: "Message sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not send message" });
  }
});

router.get("/admin/overview", requireAuth, requireAdmin, async (_req, res) => {
  const customers = await User.countDocuments({ role: "user" });
  const admins = await User.countDocuments({ role: "admin" });
  const messages = await ContactMessage.countDocuments();
  const customerDetails = await User.find({ role: "user" })
    .select("name email createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json({
    customers,
    admins,
    messages,
    customerDetails,
    studio: "Madeye Enterprises",
  });
});

router.get("/admin/customers", requireAuth, requireAdmin, async (_req, res) => {
  const customers = await User.find({ role: "user" })
    .select("name email createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ customers });
});

router.get("/admin/messages", requireAuth, requireAdmin, async (_req, res) => {
  const messages = await ContactMessage.find()
    .select("name email message createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ messages });
});

router.delete("/admin/messages/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json({ message: "Message cleared" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Could not clear message" });
  }
});

router.patch(
  "/admin/credentials",
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { currentPassword, name, email, newPassword } = req.body as {
        currentPassword?: string;
        name?: string;
        email?: string;
        newPassword?: string;
      };

      if (!currentPassword) {
        res.status(400).json({ error: "Current password is required" });
        return;
      }

      const user = await User.findById(req.user?.id);
      if (!user) {
        res.status(404).json({ error: "Admin account not found" });
        return;
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
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
          res.status(409).json({ error: "That email is already in use" });
          return;
        }
        user.email = nextEmail;
      }

      if (newPassword) {
        if (!isStrongPassword(newPassword)) {
          res.status(400).json({
            error:
              "New password must be 10+ characters with upper, lower, number, and symbol",
          });
          return;
        }
        user.password = await bcrypt.hash(newPassword, 12);
      }

      await user.save();
      const payload = publicUser(user);
      const token = signToken(payload);
      res.json({ token, user: payload });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Could not update credentials" });
    }
  }
);

export default router;
