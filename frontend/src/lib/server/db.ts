import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Product } from "./models";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: CachedConnection;
};

const cache: CachedConnection = globalForMongoose.mongooseCache || {
  conn: null,
  promise: null,
};
globalForMongoose.mongooseCache = cache;

export const defaultSeedProducts = [
  {
    name: "Terra Planter",
    category: "Flower Pots",
    markedPrice: 1000,
    actualPrice: 890,
    image: "",
    accent: "#c45c3e",
    shape: "pot",
  },
  {
    name: "Sage Urn Vase",
    category: "Vases",
    markedPrice: 1400,
    actualPrice: 1240,
    image: "",
    accent: "#4f6b52",
    shape: "vase",
  },
  {
    name: "Macramé Drop",
    category: "Hanging Planters",
    markedPrice: 900,
    actualPrice: 760,
    image: "",
    accent: "#c4a574",
    shape: "hanging",
  },
  {
    name: "Lotus Lantern",
    category: "Home Accents",
    markedPrice: 1200,
    actualPrice: 1080,
    image: "",
    accent: "#d4a017",
    shape: "lantern",
  },
  {
    name: "Woven Nest",
    category: "Baskets",
    markedPrice: 800,
    actualPrice: 640,
    image: "",
    accent: "#c4a574",
    shape: "basket",
  },
  {
    name: "Olive Wall Art",
    category: "Wall Décor",
    markedPrice: 1800,
    actualPrice: 1560,
    image: "",
    accent: "#2c3a2d",
    shape: "art",
  },
  {
    name: "Clay Cascade Pot",
    category: "Flower Pots",
    markedPrice: 1100,
    actualPrice: 980,
    image: "",
    accent: "#a3482e",
    shape: "pot",
  },
  {
    name: "Ivory Flute Vase",
    category: "Vases",
    markedPrice: 1300,
    actualPrice: 1120,
    image: "",
    accent: "#efe6d8",
    shape: "vase",
  },
  {
    name: "Fern Hoop",
    category: "Hanging Planters",
    markedPrice: 850,
    actualPrice: 720,
    image: "",
    accent: "#8fa888",
    shape: "hanging",
  },
  {
    name: "Ember Glow Lamp",
    category: "Home Accents",
    markedPrice: 1500,
    actualPrice: 1340,
    image: "",
    accent: "#c45c3e",
    shape: "lantern",
  },
];

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await User.findOne({ role: "admin" });
  if (existing) return;
  await User.create({
    name: "Madeye Admin",
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 12),
    role: "admin",
  });
}

export async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(defaultSeedProducts);
  }
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri).then((m) => m);
  }
  cache.conn = await cache.promise;
  await seedAdmin();
  await seedProducts();
  return cache.conn;
}
