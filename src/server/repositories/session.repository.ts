import { connectToDatabase } from "@/server/db/connect";
import { SessionModel } from "@/server/models/session.model";

export async function createSession(input: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string }) {
  await connectToDatabase();
  await SessionModel.create(input);
}

export async function findActiveSessionUserId(tokenHash: string): Promise<string | null> {
  await connectToDatabase();
  const doc = await SessionModel.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean<{ userId: { toString(): string } }>();
  return doc ? doc.userId.toString() : null;
}

export async function deleteSession(tokenHash: string) {
  await connectToDatabase();
  await SessionModel.deleteOne({ tokenHash });
}
