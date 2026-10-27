import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./config/seedAdmin.js";
import { seedProducts } from "./config/seedProducts.js";
import routes from "./routes/index.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fiber-business";

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  "http://localhost:3000",
  "http://localhost:3001",
];

async function startServer() {
  await connectDB(MONGODB_URI);
  await seedAdmin();
  await seedProducts();

  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app")
        ) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  app.get("/", (_req, res) => {
    res.json({ message: "API is running. Access endpoints via /api" });
  });

  app.use("/api", routes);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
