import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";
import type { OrderDto } from "@/lib/types/orders";
import { getResendConfig } from "@/server/config/env";
import type { OrderNotificationEvent } from "@/server/models/order.model";
import * as orderNotificationRepository from "@/server/repositories/order-notification.repository";

const RECIPIENT = "contactgoalnet@gmail.com";
const BRAND_LIME = "#f2fa18";
const BRAND_DARK = "#171717";

export async function sendOrderNotification(order: OrderDto, event: OrderNotificationEvent) {
  let claim: "claimed" | "sent" | "busy";
  try {
    claim = await orderNotificationRepository.claimOrderNotification(order.id, event);
  } catch (error) {
    console.error(`Could not claim Resend order ${event} notification`, { orderRef: order.ref, error });
    return false;
  }
  if (claim === "sent") return true;
  if (claim === "busy") return false;

  try {
    const config = getResendConfig();
    if (!config) throw new Error("RESEND_API_KEY is not configured.");

    const resend = new Resend(config.apiKey);
    const { error } = await resend.emails.send({
      from: config.from,
      to: RECIPIENT,
      subject: `${event === "created" ? "New order" : "Order cancelled"}: ${order.ref}`,
      html: buildOrderEmail(order, event),
      attachments: [{
        filename: "goalnet-logo-white.png",
        content: await readFile(join(process.cwd(), "public", "logo-white.png")),
        contentType: "image/png",
        contentId: "goalnet-logo",
      }],
    }, { idempotencyKey: `goalnet-order-${order.id}-${event}` });
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error(`Resend order ${event} notification failed`, { orderRef: order.ref, error });
    try {
      await orderNotificationRepository.setOrderNotificationStatus(order.id, event, "failed");
    } catch (statusError) {
      console.error(`Could not record failed Resend order ${event} notification`, { orderRef: order.ref, error: statusError });
    }
    return false;
  }

  try {
    await orderNotificationRepository.setOrderNotificationStatus(order.id, event, "sent");
  } catch (error) {
    console.error(`Could not record sent Resend order ${event} notification`, { orderRef: order.ref, error });
    return false;
  }
  return true;
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

function getImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? escapeHtml(url.toString()) : "";
  } catch {
    return "";
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function buildOrderEmail(order: OrderDto, event: OrderNotificationEvent) {
  const isCancellation = event === "cancelled";
  const title = isCancellation ? "Order cancelled" : "New order received";
  const description = isCancellation
    ? "A customer cancelled their order."
    : "A customer completed payment for a new order.";
  const lineRows = order.lines.map((line) => {
    const imageUrl = getImageUrl(line.image);
    const image = imageUrl
      ? `<img src="${imageUrl}" alt="${escapeHtml(line.imageAlt || line.name)}" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:4px;">`
      : `<div style="width:72px;height:72px;background:#eeeeee;border-radius:4px;"></div>`;
    const linePrice = line.discountAmount
      ? `<div style="color:#666;text-decoration:line-through;font-size:12px;">${formatPrice((line.originalPrice ?? line.price + line.discountAmount) * line.quantity)}</div><strong>${formatPrice(line.price * line.quantity)}</strong><div style="color:#26723a;font-size:12px;">Saved ${formatPrice(line.discountAmount * line.quantity)}</div>`
      : formatPrice(line.price * line.quantity);
    return `<tr>
      <td style="padding:14px 0;border-bottom:1px solid #e8e8e8;">${image}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #e8e8e8;vertical-align:middle;">
        <strong style="color:${BRAND_DARK};">${escapeHtml(line.name)}</strong>
        <div style="margin-top:5px;color:#666;font-size:13px;">Size ${escapeHtml(line.size)} · Qty ${line.quantity}</div>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #e8e8e8;text-align:right;white-space:nowrap;vertical-align:middle;">${linePrice}</td>
    </tr>`;
  }).join("");
  const address = [
    order.shipping.address,
    order.shipping.apartment,
    `${order.shipping.city}, ${order.shipping.state} ${order.shipping.pin}`,
  ].filter(Boolean).map(escapeHtml).join("<br>");
  const placedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(order.placedAt));

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background:#f4f4f1;font-family:Arial,Helvetica,sans-serif;color:${BRAND_DARK};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e8e8e8;">
      <tr><td style="padding:24px 28px;background:${BRAND_DARK};">
        <img src="cid:goalnet-logo" alt="GoalNet" width="150" style="display:block;max-width:150px;height:auto;">
      </td></tr>
      <tr><td style="padding:28px;">
        <span style="display:inline-block;padding:7px 10px;background:${isCancellation ? "#ffe8e5" : BRAND_LIME};color:${BRAND_DARK};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">${isCancellation ? "Cancelled" : "Paid order"}</span>
        <h1 style="margin:16px 0 8px;font-size:26px;line-height:1.2;">${title}</h1>
        <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">${description}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;">Order</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${escapeHtml(order.ref)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Date</td><td style="padding:8px 0;text-align:right;">${escapeHtml(placedAt)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Payment</td><td style="padding:8px 0;text-align:right;">${escapeHtml(order.paymentStatus)}</td></tr>
        </table>
        <h2 style="margin:28px 0 8px;font-size:17px;">Items</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${lineRows}</table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px;">
          <tr><td style="padding:6px 0;color:#666;">Subtotal</td><td style="padding:6px 0;text-align:right;">${formatPrice(order.subtotal)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Delivery</td><td style="padding:6px 0;text-align:right;">${formatPrice(order.shippingFee)}</td></tr>
          <tr><td style="padding:12px 0;border-top:1px solid #ddd;font-weight:bold;">Total</td><td style="padding:12px 0;border-top:1px solid #ddd;text-align:right;font-size:18px;font-weight:bold;">${formatPrice(order.total)}</td></tr>
        </table>
        <h2 style="margin:26px 0 8px;font-size:17px;">Customer & delivery</h2>
        <p style="margin:0;font-size:14px;line-height:1.7;">
          <strong>${escapeHtml(order.shipping.name)}</strong><br>
          <a href="mailto:${escapeHtml(order.shipping.email)}" style="color:${BRAND_DARK};">${escapeHtml(order.shipping.email)}</a><br>
          <a href="tel:${escapeHtml(order.shipping.phone)}" style="color:${BRAND_DARK};">${escapeHtml(order.shipping.phone)}</a><br>
          ${address}
        </p>
      </td></tr>
      <tr><td style="padding:16px 28px;background:#f4f4f1;color:#777;font-size:12px;">GoalNet · Football is never just a game</td></tr>
    </table>
  </body>
</html>`;
}
