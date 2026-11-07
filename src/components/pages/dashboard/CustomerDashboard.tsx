"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuArrowRight as ArrowRight,
  LuCalendarCheck as CalendarCheck,
  LuCheck as Check,
  LuChevronDown as ChevronDown,
  LuChevronUp as ChevronUp,
  LuCircleAlert as CircleAlert,
  LuCircleHelp as CircleHelp,
  LuCornerDownLeft as Send,
  LuCreditCard as CreditCard,
  LuHeart as Heart,
  LuKey as Key,
  LuLayoutDashboard as LayoutDashboard,
  LuLogOut as LogOut,
  LuMapPin as MapPin,
  LuPackage as Package,
  LuPencil as Pencil,
  LuPlus as Plus,
  LuRefreshCw as RefreshCw,
  LuSettings as Settings,
  LuTrash2 as Trash2,
  LuTruck as Truck,
  LuUserRound as UserRound,
  LuX as X,
} from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { LoadingSpinner } from "@/components/common/Loading";
import { useWishlist } from "@/components/common/WishlistProvider";
import { formatRupees } from "@/lib/format";
import type { StoreProduct } from "@/lib/types/storefront";
import { OrderDetails } from "@/components/pages/orders/OrderDetails";
import { ORDER_STATUS_LABELS, type OrderDto } from "@/lib/types/orders";
import { signOutUser } from "@/lib/auth-client";
import type {
  UserRecord,
  UserAddressRecord,
} from "@/server/repositories/user.repository";
import type { TicketDto } from "@/server/repositories/ticket.repository";

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "my-orders", label: "My orders", icon: CalendarCheck },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "edit-profile", label: "Edit profile", icon: UserRound },
  { id: "shipping", label: "Shipping", icon: Truck },
  // { id: "support-ticket", label: "Support", icon: CircleHelp },
];

const TICKET_STATUS_LABELS: Record<string, { label: string; class: string }> = {
  open: {
    label: "Open",
    class: "bg-amber-100 text-amber-900 border-amber-300",
  },
  in_progress: {
    label: "In Progress",
    class: "bg-blue-100 text-blue-900 border-blue-300",
  },
  resolved: {
    label: "Resolved",
    class: "bg-green-100 text-green-900 border-green-300",
  },
  closed: {
    label: "Closed",
    class: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export function CustomerDashboard({
  page,
  suggestedProducts,
  placedOrders,
  user,
  favoriteProducts,
  initialTickets,
}: {
  page: string;
  suggestedProducts: StoreProduct[];
  placedOrders: OrderDto[];
  user: UserRecord;
  favoriteProducts: StoreProduct[];
  initialTickets: TicketDto[];
}) {
  const router = useRouter();

  // User state
  const [currentUser, setCurrentUser] = useState<UserRecord>(user);
  const displayName = currentUser.name;
  const displayEmail = currentUser.email;
  const displayPhone = currentUser.phone || "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Orders
  const [myOrders, setMyOrders] = useState(placedOrders);
  const latest = myOrders[0];
  const progress = latest
    ? {
        "pending-payment": 0,
        confirmed: 25,
        packed: 50,
        shipped: 75,
        delivered: 100,
        cancelled: 0,
      }[latest.status]
    : 0;
  const [expandedPlaced, setExpandedPlaced] = useState("");

  const {
    products: savedProducts,
    isLoading: favoritesLoading,
    error: favoritesError,
  } = useWishlist();
  const favorites =
    favoritesLoading || (favoritesError && savedProducts.length === 0)
      ? favoriteProducts
      : savedProducts;

  // Addresses
  const [addresses, setAddresses] = useState<UserAddressRecord[]>(
    currentUser.addresses ?? [],
  );
  const [removingAddressId, setRemovingAddressId] = useState<string | null>(
    null,
  );
  const [dialog, setDialog] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // Edit profile
  const [editing, setEditing] = useState(false);
  const [profileName, setProfileName] = useState(displayName);
  const [profilePhone, setProfilePhone] = useState(displayPhone);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password / Settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Support / Tickets
  const [tickets, setTickets] = useState<TicketDto[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets[0]?.id ?? null,
  );
  const [showNewTicketForm, setShowNewTicketForm] = useState(
    initialTickets.length === 0,
  );
  const [ticketSubject, setTicketSubject] = useState("Order status");
  const [ticketOrderRef, setTicketOrderRef] = useState(latest?.ref ?? "");
  const [ticketMessage, setTicketMessage] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [chatReply, setChatReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [refreshingTickets, setRefreshingTickets] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [notice, setNotice] = useState("");

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

  // Scroll chat to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  // Fetch updated tickets
  async function refreshTicketsList() {
    setRefreshingTickets(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
        if (
          selectedTicketId &&
          !data.tickets.some((t: TicketDto) => t.id === selectedTicketId)
        ) {
          setSelectedTicketId(data.tickets[0]?.id ?? null);
          setChatReply("");
        }
      }
    } catch {
      // ignore
    } finally {
      setRefreshingTickets(false);
    }
  }

  // Handle Edit Profile Save
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setEditing(false);
        setNotice("Profile updated successfully.");
      } else {
        const err = await res.json().catch(() => ({}));
        setNotice(err.error || err.message || "Failed to update profile.");
      }
    } catch {
      setNotice("Failed to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Handle Add Address
  async function handleAddAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingAddress(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      pin: String(form.get("pin")),
      state: String(form.get("state")),
      city: String(form.get("city")),
      address: String(form.get("area")),
      apartment: "",
    };

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        setDialog("");
        setNotice("Address saved to your account.");
      } else {
        const err = await res.json().catch(() => ({}));
        setNotice(err.error || err.message || "Failed to save address.");
      }
    } catch {
      setNotice("Failed to save address. Please try again.");
    } finally {
      setSavingAddress(false);
    }
  }

  // Handle Remove Address
  async function handleRemoveAddress(id: string) {
    if (removingAddressId) return;
    setRemovingAddressId(id);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
        setNotice("Address removed.");
      } else {
        setNotice("Failed to remove address.");
      }
    } catch {
      setNotice("Failed to remove address.");
    } finally {
      setRemovingAddressId(null);
    }
  }

  // Handle Change Password / Set Password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotice(data.message || "Password saved successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentUser((prev) => ({ ...prev, hasPassword: true }));
      } else {
        const errorReason =
          data.error ||
          (data.fieldErrors
            ? (Object.values(data.fieldErrors) as string[][]).flat()[0]
            : null) ||
          data.message ||
          "Failed to update password.";
        setPasswordError(errorReason);
      }
    } catch {
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  // Handle Create Ticket
  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage.trim() || creatingTicket) return;

    setCreatingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject,
          orderRef: ticketOrderRef,
          message: ticketMessage.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((curr) => [data.ticket, ...curr]);
        setSelectedTicketId(data.ticket.id);
        setShowNewTicketForm(false);
        setTicketSubject("Order status");
        setTicketOrderRef(latest?.ref ?? "");
        setTicketMessage("");
        setNotice(
          "Ticket created! A support representative will respond shortly.",
        );
      } else {
        const err = await res.json().catch(() => ({}));
        setNotice(err.error || err.message || "Failed to create ticket.");
      }
    } catch {
      setNotice("Failed to create ticket.");
    } finally {
      setCreatingTicket(false);
    }
  }

  // Handle Chat Reply
  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !chatReply.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatReply.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((curr) =>
          curr.map((t) => (t.id === data.ticket.id ? data.ticket : t)),
        );
        setChatReply("");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || err.message || "Failed to send message.");
      }
    } catch {
      alert("Failed to send message.");
    } finally {
      setSendingReply(false);
    }
  }

  function resetTicketDraft() {
    setTicketSubject("Order status");
    setTicketOrderRef(latest?.ref ?? "");
    setTicketMessage("");
  }

  function toggleNewTicketForm() {
    resetTicketDraft();
    setShowNewTicketForm((previous) => !previous);
  }

  function selectTicket(ticketId: string) {
    if (ticketId !== selectedTicketId) setChatReply("");
    setSelectedTicketId(ticketId);
  }

  const pageTitle: Record<string, string> = {
    dashboard: `Welcome back, ${displayName.split(" ")[0]}`,
    "my-orders": "Your orders",
    favorites: "Your favorites",
    settings: "Settings",
    "edit-profile": "Profile details",
    shipping: "Saved addresses",
    "support-ticket": "Support desk",
  };

  return (
    <main className="mx-auto grid max-w-[1440px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[230px_1fr] lg:gap-10 lg:px-10 lg:py-10">
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <span className="grid size-12 place-items-center bg-brand text-lg font-bold">
            {initials}
          </span>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-xs text-muted truncate max-w-[160px]">
              {displayEmail}
            </p>
          </div>
        </div>
        <nav
          aria-label="Customer dashboard"
          className="mt-4 grid grid-cols-3 gap-1 sm:grid-cols-7 lg:grid-cols-1"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <Link
              aria-current={page === id ? "page" : undefined}
              className={`flex min-h-10 items-center gap-3 px-2 py-2 text-left text-[10px] transition sm:flex-col sm:justify-center sm:gap-1 sm:text-[10px] lg:flex-row lg:justify-start lg:px-3 lg:text-sm ${
                page === id
                  ? "bg-brand font-semibold text-ink"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
              href={`/dashboard/${id}`}
              key={id}
            >
              <Icon size={17} />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>
        <button
          className="mt-5 hidden items-center gap-3 px-3 py-2 text-sm text-muted hover:text-red-700 lg:flex"
          onClick={async () => {
            await signOutUser();
            router.push("/login");
          }}
          type="button"
        >
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-muted">My GoalNet</p>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
              {pageTitle[page] ?? pageTitle.dashboard}
            </h1>
          </div>
        </div>

        {notice && (
          <p
            aria-live="polite"
            className="mt-4 flex items-center gap-2 bg-canvas p-3 text-sm"
          >
            <Check size={16} />
            {notice}
            <button
              aria-label="Dismiss"
              className="ml-auto"
              onClick={() => setNotice("")}
              type="button"
            >
              <X size={15} />
            </button>
          </p>
        )}

        {/* Dashboard Overview */}
        {page === "dashboard" && (
          <div className="mt-6 space-y-7">
            <section className="relative overflow-hidden bg-ink p-6 text-white sm:p-9">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-brand [clip-path:polygon(0_0,100%_0,100%_60%,0_0)] sm:[clip-path:polygon(45%_0,100%_0,100%_100%,0_100%)]" />
              <div className="relative max-w-xl">
                <p className="text-xs font-bold uppercase text-brand">
                  The game keeps moving
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  {latest
                    ? `Your order is ${ORDER_STATUS_LABELS[latest.status].toLowerCase()}.`
                    : "Ready for your next match?"}
                </h2>
                <p className="mt-2 text-sm text-white/65">
                  {latest
                    ? `${latest.lines[0]?.name ?? "Your order"} · Order ${latest.ref}`
                    : "Explore the latest collection."}
                </p>
                {latest && (
                  <>
                    <div className="mt-6 h-1.5 bg-white/20">
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between gap-2 text-[10px] font-semibold uppercase text-white/60">
                      <span>Confirmed</span>
                      <span>Packed</span>
                      <span className="text-brand">On the way</span>
                      <span>Delivered</span>
                    </div>
                    <Link
                      className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase text-brand"
                      href="/dashboard/my-orders"
                    >
                      Track order <ArrowRight size={15} />
                    </Link>
                  </>
                )}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-line p-5">
                <Package size={19} />
                <p className="mt-4 text-xs uppercase text-muted">
                  Orders placed
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {String(myOrders.length).padStart(2, "0")}
                </p>
              </div>
              <div className="border border-line p-5">
                <Heart size={19} />
                <p className="mt-4 text-xs uppercase text-muted">
                  Saved favorites
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {String(favorites.length).padStart(2, "0")}
                </p>
              </div>
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">
                  {favorites.length > 0
                    ? "Your favorites"
                    : "Recommended for you"}
                </h2>
                <Link
                  className="text-xs font-bold uppercase underline"
                  href={favorites.length > 0 ? "/dashboard/favorites" : "/shop"}
                >
                  See all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {(favorites.length > 0 ? favorites : suggestedProducts)
                  .slice(0, 3)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </section>
          </div>
        )}

        {/* My Orders */}
        {page === "my-orders" && (
          <div className="mt-6 space-y-4">
            {myOrders.length === 0 && (
              <p className="border border-line p-6 text-sm text-muted">
                You haven’t placed any orders yet.{" "}
                <Link className="font-semibold text-ink underline" href="/shop">
                  Explore products
                </Link>
              </p>
            )}
            {myOrders.map((order) => (
              <article className="border border-line" key={order.ref}>
                <button
                  aria-expanded={expandedPlaced === order.ref}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left sm:p-5"
                  onClick={() =>
                    setExpandedPlaced(
                      expandedPlaced === order.ref ? "" : order.ref,
                    )
                  }
                  type="button"
                >
                  <span>
                    <span className="block text-xs text-muted">
                      Order {order.ref} · {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="mt-1 block font-semibold">
                      {order.lines.map((line) => line.name).join(", ")}
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-sm font-bold">
                      {formatRupees(order.total)}
                    </span>
                    {expandedPlaced === order.ref ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </span>
                </button>
                {expandedPlaced === order.ref && (
                  <div className="border-t border-line p-4 sm:p-5">
                    <OrderDetails
                      allowAccountCancellation
                      onOrderUpdated={(updatedOrder) => {
                        setMyOrders((orders) =>
                          orders.map((item) =>
                            item.id === updatedOrder.id ? updatedOrder : item,
                          ),
                        );
                      }}
                      order={order}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Favorites */}
        {page === "favorites" && (
          <div className="mt-6">
            {favorites.length === 0 ? (
              <div className="border border-line p-8 text-center text-muted">
                <Heart className="mx-auto mb-2 text-muted" size={32} />
                <p className="font-semibold">No favorites saved yet</p>
                <p className="mt-1 text-sm">
                  Products you save will appear here.
                </p>
                <Link
                  className="mt-4 inline-block bg-brand px-5 py-2.5 text-xs font-bold uppercase text-ink"
                  href="/shop"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings: Change Password only, with Google-user support */}
        {page === "settings" && (
          <div className="mt-6 max-w-xl">
            <div className="border border-line p-6 bg-paper">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <span className="grid size-10 place-items-center bg-canvas">
                  <Key size={18} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {currentUser.hasPassword
                      ? "Change Password"
                      : "Set Account Password"}
                  </h2>
                  <p className="text-xs text-muted">
                    Manage your GoalNet account credentials
                  </p>
                </div>
              </div>

              {currentUser.isGoogleUser && !currentUser.hasPassword ? (
                <div className="mt-4 rounded bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed">
                  <p className="font-semibold flex items-center gap-1.5">
                    <CircleAlert size={15} /> Signed in with Google
                  </p>
                  <p className="mt-1">
                    You signed in via Google ({displayEmail}). You do not
                    currently have a password set. You can create a password
                    below so you can sign in using either Google or your email
                    and password.
                  </p>
                </div>
              ) : currentUser.isGoogleUser && currentUser.hasPassword ? (
                <div className="mt-4 rounded bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                  <p>
                    Your account is linked to Google ({displayEmail}) and also
                    has a password set.
                  </p>
                </div>
              ) : null}

              {passwordError && (
                <p className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <CircleAlert size={16} />
                  {passwordError}
                </p>
              )}

              <form className="mt-5 space-y-4" onSubmit={handleChangePassword}>
                {currentUser.hasPassword && (
                  <label className="block text-xs font-semibold">
                    Current password
                    <input
                      className="mt-1.5 w-full border border-line p-3 text-sm outline-none focus:border-ink"
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      type="password"
                      value={currentPassword}
                    />
                  </label>
                )}

                <label className="block text-xs font-semibold">
                  New password
                  <input
                    className="mt-1.5 w-full border border-line p-3 text-sm outline-none focus:border-ink"
                    minLength={8}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    value={newPassword}
                  />
                </label>

                <label className="block text-xs font-semibold">
                  Confirm new password
                  <input
                    className="mt-1.5 w-full border border-line p-3 text-sm outline-none focus:border-ink"
                    minLength={8}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    type="password"
                    value={confirmPassword}
                  />
                </label>

                <button
                  className="bg-brand px-6 py-3 text-xs font-bold uppercase disabled:opacity-50 hover:bg-brand/90 transition"
                  disabled={savingPassword}
                  type="submit"
                >
                  {savingPassword ? (
                    <LoadingSpinner label="Updating…" />
                  ) : currentUser.hasPassword ? (
                    "Change password"
                  ) : (
                    "Set password"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Profile: No profile image uploader */}
        {page === "edit-profile" && (
          <form
            className="mt-6 max-w-2xl space-y-6"
            onSubmit={handleSaveProfile}
          >
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center bg-brand text-2xl font-bold">
                {initials}
              </span>
              <div>
                <p className="font-semibold text-base">{displayName}</p>
                <p className="text-xs text-muted">{displayEmail}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                Full name
                <input
                  className="mt-2 w-full border border-line p-3 text-sm outline-none disabled:bg-canvas"
                  disabled={!editing}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  value={profileName}
                />
              </label>

              <label className="text-xs font-semibold">
                Email address
                <input
                  className="mt-2 w-full border border-line p-3 text-sm outline-none bg-canvas text-muted cursor-not-allowed"
                  disabled
                  type="email"
                  value={displayEmail}
                />
                <span className="mt-1 block text-[10px] text-muted">
                  Email cannot be changed directly.
                </span>
              </label>

              <label className="text-xs font-semibold sm:col-span-2">
                Mobile number
                <input
                  className="mt-2 w-full border border-line p-3 text-sm outline-none disabled:bg-canvas"
                  disabled={!editing}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={profilePhone}
                />
              </label>
            </div>

            {editing ? (
              <div className="flex gap-3">
                <button
                  className="bg-brand px-5 py-3 text-xs font-bold uppercase disabled:opacity-50"
                  disabled={savingProfile}
                  type="submit"
                >
                  {savingProfile ? (
                    <LoadingSpinner label="Saving…" />
                  ) : (
                    "Save changes"
                  )}
                </button>
                <button
                  className="border border-line px-5 py-3 text-xs font-bold uppercase hover:bg-canvas"
                  onClick={() => {
                    setEditing(false);
                    setProfileName(displayName);
                    setProfilePhone(displayPhone);
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="inline-flex items-center gap-2 bg-brand px-5 py-3 text-xs font-bold uppercase hover:bg-brand/90 transition"
                onClick={() => setEditing(true)}
                type="button"
              >
                <Pencil size={14} /> Edit profile
              </button>
            )}
          </form>
        )}

        {/* Shipping: Connected to MongoDB user addresses */}
        {page === "shipping" && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {addresses.map((address, index) => (
              <article
                className="border border-line p-5 bg-paper flex flex-col justify-between"
                key={address.id || `${address.pin}-${index}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase">
                      <MapPin size={15} />{" "}
                      {index === 0 ? "Default address" : "Saved address"}
                    </span>
                    <button
                      aria-label={
                        removingAddressId === address.id
                          ? "Removing address"
                          : "Delete address"
                      }
                      className="p-1 text-muted hover:text-red-700 disabled:opacity-60"
                      disabled={removingAddressId !== null}
                      onClick={() => handleRemoveAddress(address.id)}
                      type="button"
                    >
                      {removingAddressId === address.id ? (
                        <LoadingSpinner />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                  <p className="mt-4 font-semibold text-base">{address.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {address.address}, {address.city}, {address.state}{" "}
                    {address.pin}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line text-xs text-muted space-y-0.5">
                  <p>Phone: {address.phone}</p>
                  <p>Email: {address.email}</p>
                </div>
              </article>
            ))}

            <button
              className="flex min-h-44 flex-col items-center justify-center gap-3 border border-dashed border-line text-xs font-bold uppercase hover:border-ink hover:bg-canvas/40 transition"
              onClick={() => setDialog("address")}
              type="button"
            >
              <span className="grid size-9 place-items-center bg-brand">
                <Plus size={18} />
              </span>
              Add address
            </button>
          </div>
        )}

        {/* Support Desk: Chat integration */}
        {page === "support-ticket" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Support Desk
                </h2>
                <p className="text-xs text-muted">
                  Submit an inquiry and chat directly with our support team
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 border border-line px-3 py-2 text-xs font-semibold uppercase hover:bg-canvas disabled:opacity-50"
                  disabled={refreshingTickets}
                  onClick={refreshTicketsList}
                  type="button"
                >
                  <RefreshCw
                    className={refreshingTickets ? "animate-spin" : ""}
                    size={14}
                  />{" "}
                  Refresh
                </button>
                <button
                  className="flex items-center gap-1.5 bg-brand px-4 py-2 text-xs font-bold uppercase text-ink hover:bg-brand/90 transition"
                  onClick={toggleNewTicketForm}
                  type="button"
                >
                  <Plus size={15} />{" "}
                  {showNewTicketForm ? "View conversations" : "Create ticket"}
                </button>
              </div>
            </div>

            {/* New Ticket Creation Form */}
            {showNewTicketForm && (
              <form
                className="border border-line bg-paper p-6 max-w-xl space-y-4"
                onSubmit={handleCreateTicket}
              >
                <div className="border-b border-line pb-3">
                  <h3 className="font-display text-lg font-semibold">
                    Open a new ticket
                  </h3>
                  <p className="text-xs text-muted">
                    Tell us about your issue to start the chat conversation.
                  </p>
                </div>

                <label className="block text-xs font-semibold">
                  What do you need help with?
                  <select
                    className="mt-1.5 w-full border border-line bg-white p-2.5 text-sm outline-none focus:border-ink"
                    onChange={(e) => setTicketSubject(e.target.value)}
                    value={ticketSubject}
                  >
                    <option value="Order status">
                      Order status & tracking
                    </option>
                    <option value="Return or exchange">
                      Return or exchange request
                    </option>
                    <option value="Payment issue">
                      Payment & invoice query
                    </option>
                    <option value="Product question">
                      Product or size question
                    </option>
                    <option value="Other">Other assistance</option>
                  </select>
                </label>

                <label className="block text-xs font-semibold">
                  Associated order number (optional)
                  <input
                    className="mt-1.5 w-full border border-line p-2.5 text-sm outline-none focus:border-ink font-mono"
                    onChange={(e) => setTicketOrderRef(e.target.value)}
                    placeholder="e.g. PO-20481"
                    value={ticketOrderRef}
                  />
                </label>

                <label className="block text-xs font-semibold">
                  Describe your request
                  <textarea
                    className="mt-1.5 min-h-28 w-full border border-line p-2.5 text-sm outline-none focus:border-ink"
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details about what you need help with..."
                    required
                    value={ticketMessage}
                  />
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    className="bg-brand px-6 py-3 text-xs font-bold uppercase hover:bg-brand/90 disabled:opacity-50 transition"
                    disabled={creatingTicket || !ticketMessage.trim()}
                    type="submit"
                  >
                    {creatingTicket ? (
                      <LoadingSpinner label="Starting chat…" />
                    ) : (
                      "Submit ticket & start chat"
                    )}
                  </button>
                  {tickets.length > 0 && (
                    <button
                      className="border border-line px-5 py-3 text-xs font-bold uppercase hover:bg-canvas"
                      onClick={() => {
                        resetTicketDraft();
                        setShowNewTicketForm(false);
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Chat & Ticket View */}
            {!showNewTicketForm && tickets.length === 0 ? (
              <div className="border border-line p-10 text-center text-muted bg-paper">
                <CircleHelp className="mx-auto mb-2 text-muted" size={36} />
                <p className="font-semibold text-base">No support tickets</p>
                <p className="mt-1 text-sm">
                  Need help with an order, delivery, or product? Open a ticket
                  to chat with support.
                </p>
                <button
                  className="mt-4 bg-brand px-5 py-2.5 text-xs font-bold uppercase text-ink hover:bg-brand/90 transition"
                  onClick={toggleNewTicketForm}
                  type="button"
                >
                  Create your first ticket
                </button>
              </div>
            ) : !showNewTicketForm ? (
              <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                {/* Tickets list */}
                <div className="border border-line bg-paper max-h-[580px] overflow-y-auto divide-y divide-line">
                  <div className="p-3 bg-canvas/40 border-b border-line text-xs font-bold uppercase text-muted">
                    Your tickets ({tickets.length})
                  </div>
                  {tickets.map((t) => {
                    const isSelected = t.id === selectedTicketId;
                    const st =
                      TICKET_STATUS_LABELS[t.status] ??
                      TICKET_STATUS_LABELS.open;
                    return (
                      <button
                        className={`block w-full p-4 text-left transition ${
                          isSelected
                            ? "bg-brand/10 border-l-4 border-l-ink"
                            : "hover:bg-canvas"
                        }`}
                        key={t.id}
                        onClick={() => selectTicket(t.id)}
                        type="button"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs font-bold text-muted">
                            {t.ticketNumber}
                          </span>
                          <span
                            className={`border px-1.5 py-0.5 text-[9px] font-bold uppercase ${st.class}`}
                          >
                            {st.label}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-sm line-clamp-1">
                          {t.subject}
                        </p>
                        {t.orderRef && (
                          <p className="text-[11px] font-mono text-muted">
                            Order: {t.orderRef}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted line-clamp-1">
                          {t.lastMessage ? t.lastMessage.message : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Chat window */}
                {selectedTicket ? (
                  <div className="flex flex-col border border-line bg-paper min-h-[540px]">
                    {/* Chat Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-muted">
                            {selectedTicket.ticketNumber}
                          </span>
                          {selectedTicket.orderRef && (
                            <span className="bg-canvas px-2 py-0.5 font-mono text-xs font-semibold">
                              Order: {selectedTicket.orderRef}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold mt-0.5">
                          {selectedTicket.subject}
                        </h3>
                      </div>
                      <span
                        className={`border px-2.5 py-1 text-[10px] font-bold uppercase ${
                          (
                            TICKET_STATUS_LABELS[selectedTicket.status] ??
                            TICKET_STATUS_LABELS.open
                          ).class
                        }`}
                      >
                        {
                          (
                            TICKET_STATUS_LABELS[selectedTicket.status] ??
                            TICKET_STATUS_LABELS.open
                          ).label
                        }
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div
                      className="flex-1 space-y-4 overflow-y-auto bg-canvas/30 p-4 sm:p-5"
                      ref={chatScrollRef}
                    >
                      {selectedTicket.messages.map((m, idx) => {
                        const isMe = m.sender === "customer";
                        return (
                          <div
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            key={m.id || idx}
                          >
                            <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted">
                              <span className="font-semibold text-ink">
                                {isMe ? "You" : "GoalNet Support"}
                              </span>
                              <span>·</span>
                              <span>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] p-3 text-sm leading-relaxed ${
                                isMe
                                  ? "bg-brand text-ink font-medium"
                                  : "bg-white text-ink border border-line"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{m.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Input */}
                    <form
                      className="border-t border-line p-3 sm:p-4 bg-paper"
                      onSubmit={handleSendReply}
                    >
                      <div className="flex gap-2">
                        <textarea
                          className="min-h-[46px] max-h-32 flex-1 resize-y border border-line p-2.5 text-sm outline-none focus:border-ink"
                          onChange={(e) => setChatReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void handleSendReply(e);
                            }
                          }}
                          placeholder="Type your message to support... (Enter to send)"
                          rows={1}
                          value={chatReply}
                        />
                        <button
                          className="flex items-center justify-center gap-1.5 bg-ink px-5 text-xs font-bold uppercase text-white hover:bg-ink/80 disabled:opacity-50 transition"
                          disabled={sendingReply || !chatReply.trim()}
                          type="submit"
                        >
                          <Send size={14} />
                          {sendingReply ? (
                            <LoadingSpinner label="Sending" />
                          ) : (
                            <span>Send</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="grid min-h-[400px] place-items-center border border-line bg-paper p-8 text-center text-muted">
                    <div>
                      <CircleHelp
                        className="mx-auto text-muted mb-2"
                        size={32}
                      />
                      <p className="font-semibold">Select a ticket</p>
                      <p className="mt-1 text-sm">
                        Choose a conversation from the left to view messages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Add Address Dialog */}
      {dialog === "address" && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setDialog("")}
        >
          <section
            aria-modal="true"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-paper p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close dialog"
              className="absolute right-4 top-4"
              onClick={() => setDialog("")}
              type="button"
            >
              <X size={19} />
            </button>
            <form className="space-y-3" onSubmit={handleAddAddress}>
              <h2 className="font-display text-2xl font-semibold">
                Add an address
              </h2>
              {[
                ["name", "Full name", "text", displayName],
                ["phone", "Phone", "tel", displayPhone],
                ["email", "Email", "email", displayEmail],
                ["area", "Street address", "text", ""],
                ["city", "City", "text", ""],
                ["state", "State", "text", ""],
                ["pin", "Pincode", "text", ""],
              ].map(([name, label, type, defVal]) => (
                <label className="block text-xs font-semibold" key={name}>
                  {label}
                  <input
                    className="mt-1 w-full border border-line p-2.5 text-sm outline-none focus:border-ink"
                    defaultValue={defVal}
                    name={name}
                    required
                    type={type}
                  />
                </label>
              ))}
              <button
                className="bg-brand px-5 py-3 text-xs font-bold uppercase disabled:opacity-50 hover:bg-brand/90 transition"
                disabled={savingAddress}
                type="submit"
              >
                {savingAddress ? (
                  <LoadingSpinner label="Saving…" />
                ) : (
                  "Save address"
                )}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
