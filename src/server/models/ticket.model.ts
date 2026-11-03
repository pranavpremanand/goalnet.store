import { Schema, model, models, type Model, type Types } from "mongoose";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";
export type MessageSenderRole = "customer" | "admin";

export interface TicketMessageAttrs {
  _id?: Types.ObjectId;
  sender: MessageSenderRole;
  senderId?: Types.ObjectId;
  senderName: string;
  message: string;
  createdAt: Date;
}

export interface TicketAttrs {
  ticketNumber: string;
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  orderRef?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessageAttrs[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<TicketMessageAttrs>(
  {
    sender: { type: String, enum: ["customer", "admin"], required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    senderName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const ticketSchema = new Schema<TicketAttrs>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    orderRef: { type: String, trim: true, default: "" },
    subject: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open", index: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
);

const cachedModel = models.Ticket as Model<TicketAttrs> | undefined;
export const TicketModel = cachedModel ?? model<TicketAttrs>("Ticket", ticketSchema);

