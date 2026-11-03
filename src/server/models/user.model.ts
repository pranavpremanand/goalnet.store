import { Schema, model, models, type Model, type Types } from "mongoose";

export type UserRole = "customer" | "admin";

export interface UserAddressAttrs {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  pin: string;
  state: string;
  city: string;
  address: string;
  apartment: string;
}

export interface UserAttrs {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  googleSub?: string;
  role: UserRole;
  addresses: UserAddressAttrs[];
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<UserAddressAttrs>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    pin: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    apartment: { type: String, default: "", trim: true },
  },
  { _id: true },
);

const userSchema = new Schema<UserAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, select: false },
    googleSub: { type: String, unique: true, sparse: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [addressSchema], default: [] },
    favorites: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  },
  { timestamps: true },
);

// Hot reload keeps the old compiled model, so drop it when the schema has changed.
const cachedUserModel = models.User as Model<UserAttrs> | undefined;
const cachedPasswordHashRequired = cachedUserModel?.schema.path("passwordHash")?.options.required;
const cachedGoogleSubPath = cachedUserModel?.schema.path("googleSub");
const cachedFavoritesPath = cachedUserModel?.schema.path("favorites");
if (cachedUserModel && (cachedPasswordHashRequired || !cachedGoogleSubPath || !cachedFavoritesPath)) delete models.User;

export const UserModel = (models.User as Model<UserAttrs> | undefined) ?? model<UserAttrs>("User", userSchema);
