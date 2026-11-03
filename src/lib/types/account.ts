import type { OrderAddress } from "@/lib/types/orders";

export type SavedAddress = OrderAddress & { id: string };

export type AccountProfile = {
  name: string;
  email: string;
  phone: string;
  addresses: SavedAddress[];
  favorites: string[];
  hasPassword: boolean;
  hasGoogle: boolean;
};

export const TICKET_STATUSES = ["open", "answered", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Waiting for support",
  answered: "Support replied",
  closed: "Closed",
};

export const TICKET_TOPICS = ["Order status", "Return or exchange", "Payment issue", "Product question", "Other"] as const;

export type TicketMessage = { id: string; sender: "customer" | "admin"; authorName: string; body: string; createdAt: string };

export type TicketSummary = {
  id: string;
  ref: string;
  topic: string;
  orderRef: string | null;
  status: TicketStatus;
  unread: boolean;
  lastMessageAt: string;
  preview: string;
  customer: { name: string; email: string } | null;
};

export type TicketDto = TicketSummary & { messages: TicketMessage[] };
