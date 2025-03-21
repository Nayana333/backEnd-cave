import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
_id: string;
  userName: string;
  email: string;
  password: string;
  isVerified:Boolean
}

const UserSchemas = new Schema<IUser>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Users = mongoose.model<IUser>("Users", UserSchemas);
