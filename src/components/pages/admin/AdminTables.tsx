"use client";

import { useState } from "react";
import { LuSearch as Search, LuShieldAlert as ShieldAlert, LuUsers as Users } from "react-icons/lu";

const initialUsers = [
  { name: "Aarav Mehta", email: "aarav@example.com", created: "18 Oct 2026", blocked: false },
  { name: "Mira Shah", email: "mira@example.com", created: "12 Oct 2026", blocked: false },
  { name: "Kabir Rao", email: "kabir@example.com", created: "08 Oct 2026", blocked: true },
  { name: "Anaya Patel", email: "anaya@example.com", created: "02 Oct 2026", blocked: false },
  { name: "Vihaan Desai", email: "vihaan@example.com", created: "26 Sep 2026", blocked: false },
];

export function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const matches = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()));
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">People</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Registered users</h1></div><span className="inline-flex items-center gap-2 bg-canvas px-3 py-2 text-xs font-semibold"><Users size={15} /> {users.length} accounts</span></div><label className="mt-6 flex max-w-sm items-center gap-2 border-b border-line py-2"><Search className="text-muted" size={16} /><input aria-label="Search users" className="min-w-0 flex-1 text-sm outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" value={search} /></label><div className="mt-5 overflow-x-auto border border-line"><table className="w-full min-w-[690px] text-left text-sm"><thead className="bg-canvas text-[10px] font-bold uppercase text-muted"><tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{matches.map((user, index) => <tr className="border-t border-line" key={user.email}><td className="px-4 py-4 text-muted">{String(index + 1).padStart(2, "0")}</td><td className="px-4 py-4 font-semibold">{user.name}</td><td className="px-4 py-4">{user.email}</td><td className="px-4 py-4 text-muted">{user.created}</td><td className="px-4 py-4"><button className={`px-3 py-2 text-[10px] font-bold uppercase ${user.blocked ? "bg-[#16812c] text-white" : "bg-[#830000] text-white"}`} onClick={() => setConfirmIndex(users.indexOf(user))} type="button">{user.blocked ? "Unblock" : "Block"}</button></td></tr>)}</tbody></table></div>{confirmIndex !== null && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><section aria-modal="true" className="w-full max-w-sm bg-paper p-6" role="dialog"><span className="grid size-10 place-items-center bg-canvas"><ShieldAlert size={19} /></span><h2 className="mt-4 font-display text-2xl font-semibold">{users[confirmIndex].blocked ? "Unblock this user?" : "Block this user?"}</h2><p className="mt-2 text-sm text-muted">This change only affects the local preview.</p><div className="mt-5 flex gap-3"><button className="bg-ink px-4 py-3 text-xs font-bold uppercase text-white" onClick={() => { setUsers((current) => current.map((user, index) => index === confirmIndex ? { ...user, blocked: !user.blocked } : user)); setConfirmIndex(null); }} type="button">Confirm</button><button className="border border-line px-4 py-3 text-xs font-bold uppercase" onClick={() => setConfirmIndex(null)} type="button">Cancel</button></div></section></div>}</div>;
}
