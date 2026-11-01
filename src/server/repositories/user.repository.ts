import { connectToDatabase } from "@/server/db/connect";
import { UserModel, type UserRole } from "@/server/models/user.model";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type UserWithPassword = UserRecord & { passwordHash: string };

type UserDoc = { _id: { toString(): string }; name: string; email: string; role: UserRole; passwordHash?: string; googleSub?: string };

function toRecord(doc: UserDoc): UserRecord {
  return { id: doc._id.toString(), name: doc.name, email: doc.email, role: doc.role };
}

export async function findUserByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ email }).select("+passwordHash").lean<UserDoc>();
  return doc?.passwordHash ? { ...toRecord(doc), passwordHash: doc.passwordHash } : null;
}

export async function userEmailExists(email: string) {
  await connectToDatabase();
  return (await UserModel.exists({ email })) !== null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findById(id).lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ email }).lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function findUserByGoogleSub(googleSub: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ googleSub }).lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function linkGoogleIdentity(userId: string, googleSub: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOneAndUpdate(
    { _id: userId, $or: [{ googleSub: { $exists: false } }, { googleSub: null }, { googleSub }] },
    { $set: { googleSub } },
    { returnDocument: "after", runValidators: true },
  ).lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function createGoogleUser(input: { name: string; email: string; googleSub: string }): Promise<UserRecord> {
  await connectToDatabase();
  const doc = await UserModel.create(input);
  return toRecord(doc);
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<UserRecord> {
  await connectToDatabase();
  const doc = await UserModel.create(input);
  return toRecord(doc);
}
