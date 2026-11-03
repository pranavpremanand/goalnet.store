import { ForbiddenError, NotFoundError } from "@/server/errors";
import type { TicketStatus } from "@/server/models/ticket.model";
import * as ticketRepo from "@/server/repositories/ticket.repository";

export async function createCustomerTicket(input: {
  userId: string;
  userName: string;
  userEmail: string;
  orderRef?: string;
  subject: string;
  message: string;
}) {
  return ticketRepo.createTicket({
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    orderRef: input.orderRef,
    subject: input.subject,
    initialMessage: input.message,
  });
}

export async function listCustomerTickets(userId: string) {
  return ticketRepo.findTicketsByUserId(userId);
}

export async function getCustomerTicket(ticketId: string, userId: string) {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) throw new NotFoundError("Ticket not found.");
  if (ticket.userId !== userId) throw new ForbiddenError("You cannot view this ticket.");
  return ticket;
}

export async function customerReplyToTicket(ticketId: string, userId: string, userName: string, message: string) {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) throw new NotFoundError("Ticket not found.");
  if (ticket.userId !== userId) throw new ForbiddenError("You cannot reply to this ticket.");

  const updated = await ticketRepo.addTicketMessage({
    ticketId: ticket.id,
    sender: "customer",
    senderId: userId,
    senderName: userName,
    message,
  });
  if (!updated) throw new NotFoundError("Failed to update ticket.");
  return updated;
}

export async function adminListTickets(options?: { status?: string; search?: string }) {
  return ticketRepo.listAllTickets(options);
}

export async function adminGetTicket(ticketId: string) {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) throw new NotFoundError("Ticket not found.");
  return ticket;
}

export async function adminReplyToTicket(ticketId: string, adminId: string, adminName: string, message: string) {
  const ticket = await ticketRepo.findTicketById(ticketId);
  if (!ticket) throw new NotFoundError("Ticket not found.");

  const updated = await ticketRepo.addTicketMessage({
    ticketId: ticket.id,
    sender: "admin",
    senderId: adminId,
    senderName: adminName,
    message,
  });
  if (!updated) throw new NotFoundError("Failed to update ticket.");
  return updated;
}

export async function adminSetTicketStatus(ticketId: string, status: TicketStatus) {
  const updated = await ticketRepo.updateTicketStatus(ticketId, status);
  if (!updated) throw new NotFoundError("Ticket not found.");
  return updated;
}

