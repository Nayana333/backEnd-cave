import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  completed: boolean;
  user: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const taskSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

export const Todo = mongoose.model<ITodo>("Task", taskSchema);
