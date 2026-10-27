import mongoose, { Schema, type Document } from "mongoose";

export interface IStoredImage extends Document {
  contentType: string;
  data: Buffer;
  createdAt: Date;
}

const storedImageSchema = new Schema<IStoredImage>(
  {
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const StoredImage = mongoose.model<IStoredImage>(
  "StoredImage",
  storedImageSchema
);
