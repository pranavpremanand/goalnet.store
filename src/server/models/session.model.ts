import { Schema, model, models, type Model, type Types } from "mongoose";

export interface SessionAttrs {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
}

const sessionSchema = new Schema<SessionAttrs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    // MongoDB removes the document once expiresAt passes.
    expiresAt: { type: Date, required: true, expires: 0 },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const SessionModel = (models.Session as Model<SessionAttrs> | undefined) ?? model<SessionAttrs>("Session", sessionSchema);
