import { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
import { TicketModel, type TicketStatus, type TicketPriority, type MessageSenderRole, type TicketMessageAttrs } from "@/server/models/ticket.model";

export type TicketMessageDto = {
  id: string;
  sender: MessageSenderRole;
  senderId?: string;
  senderName: string;
  message: string;
  createdAt: string;
};

export type TicketDto = {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderRef: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessageDto[];
  lastMessage?: TicketMessageDto;
  createdAt: string;
  updatedAt: string;
};

type TicketDoc = {
  _id: Types.ObjectId | { toString(): string };
  ticketNumber: string;
  userId: Types.ObjectId | { toString(): string };
  userName: string;
  userEmail: string;
  orderRef?: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: Array<TicketMessageAttrs & { _id?: Types.ObjectId | { toString(): string } }>;
  createdAt?: Date;
  updatedAt?: Date;
};

function toDto(doc: TicketDoc): TicketDto {
  const messages: TicketMessageDto[] = (doc.messages ?? []).map((m) => ({
    id: m._id?.toString() ?? "",
    sender: m.sender,
    senderId: m.senderId?.toString(),
    senderName: m.senderName,
    message: m.message,
    createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
  }));

  return {
    id: doc._id.toString(),
    ticketNumber: doc.ticketNumber,
    userId: doc.userId?.toString() ?? "",
    userName: doc.userName,
    userEmail: doc.userEmail,
    orderRef: doc.orderRef ?? "",
    subject: doc.subject,
    status: doc.status,
    priority: doc.priority,
    messages,
    lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function generateTicketNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TK-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function createTicket(input: {
  userId: string;
  userName: string;
  userEmail: string;
  orderRef?: string;
  subject: string;
  initialMessage: string;
}): Promise<TicketDto> {
  await connectToDatabase();
  const ticketNumber = generateTicketNumber();
  const doc = await TicketModel.create({
    ticketNumber,
    userId: new Types.ObjectId(input.userId),
    userName: input.userName,
    userEmail: input.userEmail,
    orderRef: input.orderRef?.trim() ?? "",
    subject: input.subject.trim(),
    status: "open",
    priority: "medium",
    messages: [
      {
        sender: "customer",
        senderId: new Types.ObjectId(input.userId),
        senderName: input.userName,
        message: input.initialMessage.trim(),
        createdAt: new Date(),
      },
    ],
  });
  return toDto(doc as unknown as TicketDoc);
}

export async function findTicketsByUserId(userId: string): Promise<TicketDto[]> {
  await connectToDatabase();
  const docs = await TicketModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ updatedAt: -1 })
    .lean<TicketDoc[]>();
  return docs.map(toDto);
}

export async function findTicketById(id: string): Promise<TicketDto | null> {
  await connectToDatabase();
  const query = Types.ObjectId.isValid(id) ? { _id: id } : { ticketNumber: id };
  const doc = await TicketModel.findOne(query).lean<TicketDoc>();
  return doc ? toDto(doc) : null;
}

export async function addTicketMessage(input: {
  ticketId: string;
  sender: MessageSenderRole;
  senderId?: string;
  senderName: string;
  message: string;
}): Promise<TicketDto | null> {
  await connectToDatabase();
  const query = Types.ObjectId.isValid(input.ticketId) ? { _id: input.ticketId } : { ticketNumber: input.ticketId };
  const ticket = await TicketModel.findOne(query);
  if (!ticket) return null;

  ticket.messages.push({
    sender: input.sender,
    senderId: input.senderId ? new Types.ObjectId(input.senderId) : undefined,
    senderName: input.senderName,
    message: input.message.trim(),
    createdAt: new Date(),
  });

  // If customer replied and ticket was resolved/closed, reopen it
  if (input.sender === "customer" && (ticket.status === "resolved" || ticket.status === "closed")) {
    ticket.status = "open";
  } else if (input.sender === "admin" && ticket.status === "open") {
    ticket.status = "in_progress";
  }

  ticket.updatedAt = new Date();
  await ticket.save();
  return toDto(ticket.toObject() as TicketDoc);
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<TicketDto | null> {
  await connectToDatabase();
  const query = Types.ObjectId.isValid(ticketId) ? { _id: ticketId } : { ticketNumber: ticketId };
  const doc = await TicketModel.findOneAndUpdate(
    query,
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  ).lean<TicketDoc>();
  return doc ? toDto(doc) : null;
}

export async function listAllTickets(options?: { status?: string; search?: string }): Promise<TicketDto[]> {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (options?.status && options.status !== "all") {
    filter.status = options.status;
  }
  if (options?.search) {
    const rx = new RegExp(options.search.trim(), "i");
    filter.$or = [{ ticketNumber: rx }, { userName: rx }, { userEmail: rx }, { subject: rx }, { orderRef: rx }];
  }
  const docs = await TicketModel.find(filter).sort({ updatedAt: -1 }).lean<TicketDoc[]>();
  return docs.map(toDto);
}
