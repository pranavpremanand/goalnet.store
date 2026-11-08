import { Schema, model, models, type Model } from "mongoose";

export interface AnnouncementBarAttrs {
  key: string;
  text: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementBarSchema = new Schema<AnnouncementBarAttrs>(
  {
    key: { type: String, required: true, unique: true, default: "site-announcement" },
    text: { type: String, required: true, trim: true, maxlength: 180 },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AnnouncementBarModel = (models.AnnouncementBar as Model<AnnouncementBarAttrs> | undefined)
  ?? model<AnnouncementBarAttrs>("AnnouncementBar", announcementBarSchema);
