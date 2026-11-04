import { Schema, model, models, type Model, type Types } from "mongoose";
import { CART_TTL_MS } from "@/lib/cart-constants";

export type CartItemAttrs = {
  productId: Types.ObjectId;
  size: string;
  quantity: number;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  price: number;
};

export interface CartAttrs {
  userId?: Types.ObjectId;
  guestTokenHash?: string;
  items: CartItemAttrs[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<CartAttrs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    guestTokenHash: { type: String },
    items: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        size: { type: String, required: true, trim: true, maxlength: 20 },
        quantity: { type: Number, required: true, min: 1, max: 10 },
        slug: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        imageAlt: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + CART_TTL_MS),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

cartSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
cartSchema.index({ guestTokenHash: 1 }, { unique: true, partialFilterExpression: { guestTokenHash: { $exists: true } } });

export const CartModel = (models.Cart as Model<CartAttrs> | undefined) ?? model<CartAttrs>("Cart", cartSchema);
