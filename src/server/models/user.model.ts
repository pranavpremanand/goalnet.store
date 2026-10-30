import { Schema, model, models, type Model } from "mongoose";

export type UserRole = "customer" | "admin";

export interface UserAttrs {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true },
);

export const UserModel = (models.User as Model<UserAttrs> | undefined) ?? model<UserAttrs>("User", userSchema);
