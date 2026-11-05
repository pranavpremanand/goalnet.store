import { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
import { OrderModel, type OrderAttrs, type OrderNotificationEvent, type OrderNotificationStatus } from "@/server/models/order.model";

export async function claimOrderNotification(orderId: string, event: OrderNotificationEvent) {
  await connectToDatabase();
  const path = `emailNotifications.${event}`;
  const staleSendingTime = new Date(Date.now() - 10 * 60 * 1000);
  const claimed = await OrderModel.findOneAndUpdate(
    {
      _id: orderId,
      $or: [
        { [`${path}.status`]: { $in: ["failed"] } },
        { [`${path}.status`]: { $exists: false } },
        { [`${path}.status`]: "sending", [`${path}.updatedAt`]: { $lt: staleSendingTime } },
      ],
    },
    { $set: { [`${path}.status`]: "sending", [`${path}.updatedAt`]: new Date() } },
    { returnDocument: "after" },
  ).lean();

  if (claimed) return "claimed";

  const existing = await OrderModel.findById(orderId)
    .select(`emailNotifications.${event}.status`)
    .lean<OrderAttrs & { _id: Types.ObjectId }>();
  return existing?.emailNotifications?.[event]?.status === "sent" ? "sent" : "busy";
}

export async function setOrderNotificationStatus(
  orderId: string,
  event: OrderNotificationEvent,
  status: Extract<OrderNotificationStatus, "sent" | "failed">,
) {
  await connectToDatabase();
  await OrderModel.updateOne(
    { _id: orderId, [`emailNotifications.${event}.status`]: "sending" },
    { $set: { [`emailNotifications.${event}.status`]: status, [`emailNotifications.${event}.updatedAt`]: new Date() } },
  );
}