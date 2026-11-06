"use client";

import { useEffect, useState } from "react";
import {
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuSearch as Search,
  LuShieldAlert as ShieldAlert,
  LuUsers as Users,
} from "react-icons/lu";
import { LoadingSpinner } from "@/components/common/Loading";
import type { AdminUserRecord } from "@/server/repositories/user.repository";

type UserPage = { users: AdminUserRecord[]; total: number; page: number; pages: number };

export function AdminUsers({ initialData }: { initialData: UserPage }) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmUser, setConfirmUser] = useState<AdminUserRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (search.trim()) params.set("q", search.trim());
        const response = await fetch(`/api/admin/users?${params}`, { signal: controller.signal });
        const result = (await response.json()) as UserPage & { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not load users.");
        setData(result);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load users.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [page, search]);

  async function toggleBlocked() {
    if (!confirmUser || updatingId) return;
    const user = confirmUser;
    setUpdatingId(user.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !user.isBlocked }),
      });
      const result = (await response.json()) as { user?: AdminUserRecord; error?: string };
      if (!response.ok || !result.user) throw new Error(result.error ?? "Could not update this account.");
      setData((current) => ({
        ...current,
        users: current.users.map((currentUser) => currentUser.id === result.user?.id ? result.user : currentUser),
      }));
      setConfirmUser(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this account.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted">People</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Registered users</h1>
        </div>
        <span className="inline-flex items-center gap-2 bg-canvas px-3 py-2 text-xs font-semibold">
          <Users size={15} /> {data.total.toLocaleString("en-IN")} {search.trim() ? "matching accounts" : "accounts"}
        </span>
      </div>

      <label className="mt-6 flex max-w-sm items-center gap-2 border-b border-line py-2">
        <Search className="text-muted" size={16} />
        <input
          aria-label="Search users"
          className="min-w-0 flex-1 text-sm outline-none"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name or email"
          value={search}
        />
        {loading && <LoadingSpinner className="text-muted" label="Searching" />}
      </label>

      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}

      <div className="mt-5 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain border border-line">
        <table className="w-full min-w-[690px] text-left text-sm">
          <thead className="bg-canvas text-[10px] font-bold uppercase text-muted">
            <tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody aria-busy={loading}>
            {data.users.map((user, index) => (
              <tr className="border-t border-line" key={user.id}>
                <td className="px-4 py-4 text-muted">{String((page - 1) * 50 + index + 1).padStart(2, "0")}</td>
                <td className="px-4 py-4 font-semibold">{user.name}</td>
                <td className="px-4 py-4">{user.email}</td>
                <td className="px-4 py-4 text-muted">{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-4">
                  <button
                    className={`px-3 py-2 text-[10px] font-bold uppercase disabled:opacity-50 ${user.isBlocked ? "bg-[#16812c] text-white" : "bg-[#830000] text-white"}`}
                    disabled={updatingId !== null}
                    onClick={() => setConfirmUser(user)}
                    type="button"
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
            {!data.users.length && (
              <tr><td className="px-4 py-10 text-center text-sm text-muted" colSpan={5}>{loading ? "Loading accounts…" : "No customer accounts found."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Page {data.pages ? data.page : 0} of {data.pages}</p>
        <div className="flex gap-2">
          <button
            aria-label="Previous page"
            className="inline-flex min-h-10 items-center gap-1 border border-line px-3 text-xs font-bold uppercase disabled:opacity-40"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            type="button"
          ><ChevronLeft size={15} /> Previous</button>
          <button
            aria-label="Next page"
            className="inline-flex min-h-10 items-center gap-1 border border-line px-3 text-xs font-bold uppercase disabled:opacity-40"
            disabled={page >= data.pages || loading}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >Next <ChevronRight size={15} /></button>
        </div>
      </div>

      {confirmUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <section aria-modal="true" className="w-full max-w-sm bg-paper p-6" role="dialog">
            <span className="grid size-10 place-items-center bg-canvas"><ShieldAlert size={19} /></span>
            <h2 className="mt-4 font-display text-2xl font-semibold">{confirmUser.isBlocked ? "Unblock this user?" : "Block this user?"}</h2>
            <p className="mt-2 text-sm text-muted">
              {confirmUser.isBlocked
                ? `${confirmUser.name} will be able to sign in and use their account again.`
                : `${confirmUser.name} will be signed out and will not be able to sign in while blocked.`}
            </p>
            {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button
                className="inline-flex min-h-11 items-center justify-center bg-ink px-4 py-3 text-xs font-bold uppercase text-white disabled:opacity-50"
                disabled={updatingId !== null}
                onClick={() => void toggleBlocked()}
                type="button"
              >{updatingId === confirmUser.id ? <LoadingSpinner label="Updating…" /> : "Confirm"}</button>
              <button
                className="min-h-11 border border-line px-4 py-3 text-xs font-bold uppercase disabled:opacity-50"
                disabled={updatingId !== null}
                onClick={() => setConfirmUser(null)}
                type="button"
              >Cancel</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
