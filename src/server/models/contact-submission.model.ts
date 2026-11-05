import { Schema, model, models, type Model, type Types } from "mongoose";

export type ContactEmailStatus = "pending" | "sent" | "failed";

export interface ContactSubmissionAttrs {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  message: string;
  emailStatus: ContactEmailStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<ContactSubmissionAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, default: "", maxlength: 30 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending", required: true },
  },
  { timestamps: true },
);

const cachedModel = models.ContactSubmission as Model<ContactSubmissionAttrs> | undefined;
export const ContactSubmissionModel =
  cachedModel ?? model<ContactSubmissionAttrs>("ContactSubmission", contactSubmissionSchema);
