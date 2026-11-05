"use client";

import { useState } from "react";
import { LuMail as Mail, LuRefreshCw as RefreshCw } from "react-icons/lu";
import type { ContactSubmissionPage } from "@/server/repositories/contact-submission.repository";

export function AdminContactMessages({ initialPage }: { initialPage: ContactSubmissionPage }) {
  const [submissions, setSubmissions] = useState(initialPage.submissions);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/contact-submissions?cursor=${encodeURIComponent(cursor)}`);
      const data = (await response.json()) as ContactSubmissionPage & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not load more messages.");
      setSubmissions((current) => [...current, ...data.submissions]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load more messages.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-xs font-bold uppercase text-muted">Customer Service</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Contact messages</h1>
          <p className="mt-2 text-sm text-muted">Messages submitted through the website contact form.</p>
        </div>
        <p className="text-sm font-semibold text-muted">{submissions.length}{hasMore ? "+" : ""} loaded</p>
      </div>

      {submissions.length === 0 ? (
        <div className="mt-6 border border-line bg-paper p-8 text-center">
          <Mail className="mx-auto text-muted" size={24} />
          <p className="mt-3 font-semibold">No contact messages yet</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {submissions.map((submission) => (
            <li className="border border-line bg-paper p-5 sm:p-6" key={submission.id}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div>
                  <h2 className="font-semibold">{submission.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <a className="underline hover:text-ink" href={`mailto:${submission.email}`}>{submission.email}</a>
                    {submission.phone && <a className="underline hover:text-ink" href={`tel:${submission.phone}`}>{submission.phone}</a>}
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  <time dateTime={submission.createdAt}>{new Date(submission.createdAt).toLocaleString()}</time>
                  <p className={submission.emailStatus === "sent" ? "mt-1 text-green-700" : "mt-1 text-amber-700"}>
                    Notification {submission.emailStatus}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-wrap pt-4 text-sm leading-6">{submission.message}</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
      {hasMore && (
        <button
          className="mt-6 inline-flex min-h-11 items-center gap-2 border border-line bg-paper px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-50"
          disabled={loading}
          onClick={() => void loadMore()}
          type="button"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={15} />
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}
