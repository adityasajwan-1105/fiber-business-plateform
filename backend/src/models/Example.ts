import mongoose, { Schema, Document } from "mongoose";

export interface IExample extends Document {
  name: string;
  createdAt: Date;
}

const exampleSchema = new Schema<IExample>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Example = mongoose.model<IExample>("Example", exampleSchema);
