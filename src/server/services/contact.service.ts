import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";
import type { ContactSubmissionInput } from "@/lib/validation/contact";
import { getResendConfig } from "@/server/config/env";
import * as contactRepository from "@/server/repositories/contact-submission.repository";

const RECIPIENT = "contactgoalnet@gmail.com";
const BRAND_LIME = "#f2fa18";
const BRAND_DARK = "#171717";

export async function submitContactMessage(input: ContactSubmissionInput) {
  const submission = await contactRepository.createContactSubmission(input);
  let emailDelivered = false;
  try {
    await sendContactNotification(submission);
    emailDelivered = true;
  } catch (error) {
    console.error("Contact message email delivery failed", error);
  }
  await contactRepository.setContactEmailStatus(submission.id, emailDelivered ? "sent" : "failed");
  return { emailDelivered };
}

export function listContactMessages(cursor?: string) {
  return contactRepository.listContactSubmissions(cursor);
}

async function sendContactNotification(submission: Awaited<ReturnType<typeof contactRepository.createContactSubmission>>) {
  const config = getResendConfig();
  if (!config) throw new Error("RESEND_API_KEY is not configured.");

  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: RECIPIENT,
    replyTo: submission.email,
    subject: "New GoalNet contact form submission",
    html: buildContactEmail(submission),
    text: [
      "New message from the GoalNet contact form",
      "",
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || "Not provided"}`,
      "",
      "Message:",
      submission.message,
    ].join("\n"),
    attachments: [{
      filename: "goalnet-logo-white.png",
      content: await readFile(join(process.cwd(), "public", "logo-white.png")),
      contentType: "image/png",
      contentId: "goalnet-logo",
    }],
  }, { idempotencyKey: `goalnet-contact-${submission.id}` });
  if (error) throw new Error(error.message);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function buildContactEmail(submission: Awaited<ReturnType<typeof contactRepository.createContactSubmission>>) {
  const submittedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(submission.createdAt));
  const message = escapeHtml(submission.message).replace(/\r?\n/g, "<br>");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background:#f4f4f1;font-family:Arial,Helvetica,sans-serif;color:${BRAND_DARK};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e8e8e8;">
      <tr><td style="padding:24px 28px;background:${BRAND_DARK};">
        <img src="cid:goalnet-logo" alt="GoalNet" width="150" style="display:block;max-width:150px;height:auto;">
      </td></tr>
      <tr><td style="padding:28px;">
        <span style="display:inline-block;padding:7px 10px;background:${BRAND_LIME};color:${BRAND_DARK};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Contact form</span>
        <h1 style="margin:16px 0 8px;font-size:26px;line-height:1.2;">A new message for GoalNet</h1>
        <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">Submitted ${escapeHtml(submittedAt)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e8e8;color:#666;width:100px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e8e8e8;font-weight:bold;">${escapeHtml(submission.name)}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e8e8;color:#666;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8e8e8;"><a href="mailto:${escapeHtml(submission.email)}" style="color:${BRAND_DARK};">${escapeHtml(submission.email)}</a></td></tr>
          <tr><td style="padding:10px 0;color:#666;">Phone</td><td style="padding:10px 0;">${submission.phone ? `<a href="tel:${escapeHtml(submission.phone)}" style="color:${BRAND_DARK};">${escapeHtml(submission.phone)}</a>` : "Not provided"}</td></tr>
        </table>
        <h2 style="margin:26px 0 10px;font-size:17px;">Message</h2>
        <div style="padding:18px;background:#f7f7f7;border-left:4px solid ${BRAND_LIME};font-size:14px;line-height:1.7;overflow-wrap:anywhere;">${message}</div>
        <p style="margin:24px 0 0;font-size:13px;color:#666;">Reply directly to this email to respond to ${escapeHtml(submission.name)}.</p>
      </td></tr>
      <tr><td style="padding:16px 28px;background:#f4f4f1;color:#777;font-size:12px;">GoalNet · Football is never just a game</td></tr>
    </table>
  </body>
</html>`;
}
