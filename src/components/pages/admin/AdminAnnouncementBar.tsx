"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuMegaphone as Megaphone } from "react-icons/lu";
import { AnnouncementMarquee } from "@/components/common/AnnouncementMarquee";
import { LoadingSpinner } from "@/components/common/Loading";
import { adminInputClass } from "@/components/pages/admin/FormFields";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { AnnouncementBar } from "@/lib/types/announcement";
import type { AnnouncementBarInput } from "@/lib/validation/announcement";

export function AdminAnnouncementBar({ announcement }: { announcement: AnnouncementBar }) {
  const router = useRouter();
  const [text, setText] = useState(announcement.text);
  const [isActive, setIsActive] = useState(announcement.isActive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const input: AnnouncementBarInput = { text, isActive };
      await apiRequest<{ announcement: AnnouncementBar }>("/api/admin/announcement-bar", {
        method: "PUT",
        body: JSON.stringify(input),
      });
      setNotice("Announcement bar updated.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "The announcement could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Storefront</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Announcement bar</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Set the message that scrolls across the top of the storefront and account pages.
        </p>
      </header>

      <section className="mt-8 border border-line bg-paper p-5 sm:p-7">
        <label className="block text-sm font-semibold" htmlFor="announcement-text">Announcement text</label>
        <input
          className={adminInputClass}
          id="announcement-text"
          maxLength={180}
          onChange={(event) => setText(event.target.value)}
          placeholder="For the love of the game."
          value={text}
        />
        <p className="mt-1 text-xs text-muted">{text.length}/180 characters</p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
          <input
            checked={isActive}
            className="mt-1 accent-[#f2fa18]"
            onChange={(event) => setIsActive(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block font-semibold">Show announcement bar</span>
            <span className="mt-1 block text-xs text-muted">When disabled, the message is hidden from visitors.</span>
          </span>
        </label>

        <div className="mt-7">
          <p className="mb-2 text-xs font-bold uppercase text-muted">Live preview</p>
          <div className="announcement-marquee overflow-hidden bg-ink text-white">
            {isActive && text.trim() ? (
              <AnnouncementMarquee text={text} />
            ) : (
              <p className="py-2.5 text-center text-xs text-white/60">Announcement bar is hidden.</p>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">On the storefront, the message moves continuously from right to left.</p>
        </div>

        {error && <p className="mt-5 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        {notice && <p className="mt-5 border-l-4 border-green-700 bg-green-50 p-3 text-sm text-green-900" role="status">{notice}</p>}

        <button
          aria-busy={saving}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 bg-ink px-5 text-xs font-bold uppercase text-white hover:bg-brand hover:text-ink disabled:opacity-60"
          disabled={saving || !text.trim()}
          onClick={() => void save()}
          type="button"
        >
          {saving ? <LoadingSpinner label="Saving…" /> : <><Megaphone size={16} /> Save announcement</>}
        </button>
      </section>
    </div>
  );
}
