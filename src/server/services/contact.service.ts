import { createTransport } from "nodemailer";
import type { ContactSubmissionInput } from "@/lib/validation/contact";
import { getSmtpConfig } from "@/server/config/env";
import * as contactRepository from "@/server/repositories/contact-submission.repository";

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
  const config = getSmtpConfig();
  if (!config) {
    throw new Error("SMTP settings are not configured.");
  }

  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({
    from: config.from,
    to: "contactgoalnet@gmail.com",
    replyTo: { name: submission.name, address: submission.email },
    subject: "New GoalNet contact form submission",
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || "Not provided"}`,
      "",
      "Message:",
      submission.message,
    ].join("\n"),
  });
}
