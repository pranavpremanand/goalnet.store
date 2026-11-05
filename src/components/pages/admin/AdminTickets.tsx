"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { LuCheck as Check, LuCircleHelp as CircleHelp, LuCornerDownLeft as Send, LuRefreshCw as RefreshCw, LuSearch as Search, LuUser as User, LuX as X } from "react-icons/lu";
import type { TicketDto } from "@/server/repositories/ticket.repository";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  open: { label: "Open", class: "bg-amber-100 text-amber-900 border-amber-300" },
  in_progress: { label: "In Progress", class: "bg-blue-100 text-blue-900 border-blue-300" },
  resolved: { label: "Resolved", class: "bg-green-100 text-green-900 border-green-300" },
  closed: { label: "Closed", class: "bg-gray-100 text-gray-800 border-gray-300" },
};

export function AdminTickets({ initialTickets }: { initialTickets: TicketDto[] }) {
  const [tickets, setTickets] = useState<TicketDto[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTickets[0]?.id ?? null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

  const fetchTickets = useCallback(async (statusOverride?: string) => {
    setRefreshing(true);
    try {
      const activeStatus = statusOverride ?? filterStatus;
      const params = new URLSearchParams();
      if (activeStatus !== "all") params.set("status", activeStatus);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
        if (selectedTicketId && !data.tickets.some((t: TicketDto) => t.id === selectedTicketId)) {
          setSelectedTicketId(data.tickets[0]?.id ?? null);
          setReplyText("");
        }
      }
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [filterStatus, search, selectedTicketId]);

  function selectTicket(ticketId: string) {
    if (ticketId !== selectedTicketId) setReplyText("");
    setSelectedTicketId(ticketId);
  }

  function handleFilterClick(status: string) {
    setFilterStatus(status);
    void fetchTickets(status);
  }

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) {
        const { ticket: updated } = await res.json();
        setTickets((curr) => curr.map((t) => (t.id === updated.id ? updated : t)));
        setReplyText("");
        setNotice("Reply sent to customer.");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to send reply");
      }
    } catch {
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const { ticket: updated } = await res.json();
        setTickets((curr) => curr.map((t) => (t.id === updated.id ? updated : t)));
        setNotice(`Ticket status updated to ${status}.`);
      }
    } catch {
      alert("Failed to update status");
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchUser = t.userName.toLowerCase().includes(q) || t.userEmail.toLowerCase().includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchOrder = t.orderRef?.toLowerCase().includes(q);
      return matchNum || matchUser || matchSubject || matchOrder;
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-xs font-bold uppercase text-muted">Customer Service</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Support Desk & Chat</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 border border-line bg-paper px-3 py-2 text-xs font-semibold uppercase hover:bg-canvas disabled:opacity-50"
            disabled={refreshing}
            onClick={() => void fetchTickets()}
            type="button"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={14} /> Refresh
          </button>
        </div>
      </div>

      {notice && (
        <p className="mt-4 flex items-center gap-2 bg-canvas p-3 text-sm">
          <Check size={16} />
          {notice}
          <button aria-label="Dismiss" className="ml-auto" onClick={() => setNotice("")} type="button">
            <X size={15} />
          </button>
        </p>
      )}

      {/* Main Grid: Ticket list on left, Chat window on right */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Ticket List Panel */}
        <div className="flex flex-col border border-line bg-paper">
          <div className="border-b border-line p-3">
            <div className="flex items-center gap-2 border border-line bg-canvas/40 px-2.5 py-1.5 text-sm">
              <Search className="text-muted" size={16} />
              <input
                className="w-full bg-transparent outline-none"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket, customer, order..."
                value={search}
              />
            </div>
            <div className="mt-2 flex gap-1 overflow-x-auto text-xs">
              {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
                <button
                  className={`rounded-full px-2.5 py-1 font-semibold uppercase transition text-[10px] ${
                    filterStatus === st ? "bg-brand text-ink" : "bg-canvas text-muted hover:text-ink"
                  }`}
                  key={st}
                  onClick={() => handleFilterClick(st)}
                  type="button"
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[620px] min-h-[300px] divide-y divide-line overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">No tickets found.</div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                const statusInfo = STATUS_LABELS[t.status] ?? STATUS_LABELS.open;
                return (
                  <button
                    className={`block w-full p-4 text-left transition ${
                      isSelected ? "bg-brand/10 border-l-4 border-l-ink" : "hover:bg-canvas"
                    }`}
                    key={t.id}
                    onClick={() => selectTicket(t.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-muted">{t.ticketNumber}</span>
                      <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-sm line-clamp-1">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-muted flex items-center gap-1">
                      <User size={12} /> {t.userName} · {t.userEmail}
                    </p>
                    {t.orderRef && (
                      <p className="mt-1 text-[11px] font-mono font-medium text-ink">Order: {t.orderRef}</p>
                    )}
                    <p className="mt-2 text-xs text-muted line-clamp-2">
                      {t.lastMessage ? t.lastMessage.message : "No messages yet"}
                    </p>
                    <p className="mt-1 text-[10px] text-muted text-right">
                      {new Date(t.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat / Ticket Detail Panel */}
        {selectedTicket ? (
          <div className="flex flex-col border border-line bg-paper min-h-[620px]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted">{selectedTicket.ticketNumber}</span>
                  {selectedTicket.orderRef && (
                    <span className="bg-canvas px-2 py-0.5 font-mono text-xs font-semibold">
                      Order: {selectedTicket.orderRef}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-display text-xl font-bold">{selectedTicket.subject}</h2>
                <p className="text-xs text-muted">
                  Customer: <span className="font-semibold text-ink">{selectedTicket.userName}</span> (
                  {selectedTicket.userEmail})
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Status:</span>
                <select
                  className="border border-line bg-white p-1.5 text-xs font-semibold"
                  onChange={(e) => handleStatusChange(e.target.value)}
                  value={selectedTicket.status}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-canvas/40 p-4 sm:p-6" ref={chatScrollRef}>
              {selectedTicket.messages.map((m, idx) => {
                const isAdmin = m.sender === "admin";
                return (
                  <div
                    className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    key={m.id || idx}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted">
                      <span className="font-semibold text-ink">{isAdmin ? "Admin (Support)" : m.senderName}</span>
                      <span>·</span>
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-sm p-3.5 text-sm leading-relaxed ${
                        isAdmin
                          ? "bg-brand text-ink font-medium shadow-sm"
                          : "bg-white text-ink border border-line shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Bar */}
            <form className="border-t border-line p-3 sm:p-4 bg-paper" onSubmit={handleSendReply}>
              <div className="flex gap-2">
                <textarea
                  className="min-h-[50px] max-h-32 flex-1 resize-y border border-line p-2.5 text-sm outline-none focus:border-ink"
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendReply(e);
                    }
                  }}
                  placeholder="Type an official admin reply... (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  value={replyText}
                />
                <button
                  className="flex items-center justify-center gap-1 bg-ink px-5 text-xs font-bold uppercase text-white hover:bg-ink/80 disabled:opacity-50"
                  disabled={sending || !replyText.trim()}
                  type="submit"
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid min-h-[400px] place-items-center border border-line bg-paper p-8 text-center text-muted">
            <div>
              <CircleHelp className="mx-auto text-muted mb-2" size={32} />
              <p className="font-semibold">No ticket selected</p>
              <p className="mt-1 text-sm">Select a ticket from the list to view and reply to the customer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
