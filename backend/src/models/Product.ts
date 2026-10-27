import mongoose, { Schema, type Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
  markedPrice: number;
  actualPrice: number;
  image: string;
  accent: string;
  shape: "pot" | "vase" | "hanging" | "lantern" | "basket" | "art";
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    markedPrice: { type: Number, required: true, min: 0 },
    actualPrice: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    accent: { type: String, default: "#c45c3e" },
    shape: {
      type: String,
      enum: ["pot", "vase", "hanging", "lantern", "basket", "art"],
      default: "pot",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
