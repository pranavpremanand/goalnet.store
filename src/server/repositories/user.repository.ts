import { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
import { NotFoundError, UnauthorizedError } from "@/server/errors";
import { UserModel, type UserRole, type UserAddressAttrs } from "@/server/models/user.model";

export type UserAddressRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  pin: string;
  state: string;
  city: string;
  address: string;
  apartment: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isBlocked: boolean;
  hasPassword: boolean;
  isGoogleUser: boolean;
  addresses: UserAddressRecord[];
  favorites: string[];
  createdAt: string;
};

export type UserWithPassword = UserRecord & { passwordHash?: string };

type UserDoc = {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isBlocked?: boolean;
  passwordHash?: string;
  googleSub?: string;
  addresses?: Array<UserAddressAttrs & { _id?: { toString(): string } }>;
  favorites?: Array<Types.ObjectId | string>;
  createdAt?: Date;
};

function toRecord(doc: UserDoc): UserRecord {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    role: doc.role,
    isBlocked: Boolean(doc.isBlocked),
    hasPassword: Boolean(doc.passwordHash),
    isGoogleUser: Boolean(doc.googleSub),
    addresses: (doc.addresses ?? []).map((addr) => ({
      id: addr._id?.toString() ?? "",
      name: addr.name,
      email: addr.email,
      phone: addr.phone,
      pin: addr.pin,
      state: addr.state,
      city: addr.city,
      address: addr.address,
      apartment: addr.apartment ?? "",
    })),
    favorites: (doc.favorites ?? []).map((fav) => fav.toString()),
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function findUserByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ email }).select("+passwordHash").lean<UserDoc>();
  if (!doc) return null;
  return { ...toRecord(doc), passwordHash: doc.passwordHash };
}

export async function getUserWithPasswordById(id: string): Promise<UserWithPassword | null> {
  await connectToDatabase();
  const doc = await UserModel.findById(id).select("+passwordHash").lean<UserDoc>();
  if (!doc) return null;
  return { ...toRecord(doc), passwordHash: doc.passwordHash };
}

export async function userEmailExists(email: string) {
  await connectToDatabase();
  return (await UserModel.exists({ email })) !== null;
}

export async function isUserBlocked(id: string) {
  await connectToDatabase();
  return (await UserModel.exists({ _id: id, isBlocked: true })) !== null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findById(id).select("+passwordHash").lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function listUserFavoriteIds(id: string): Promise<string[]> {
  await connectToDatabase();
  const user = await UserModel.findOne({ _id: id, isBlocked: { $ne: true } })
    .select("favorites")
    .lean<{ favorites?: Array<Types.ObjectId | string> }>();
  if (!user) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return toFavoriteIds(user.favorites);
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ email }).select("+passwordHash").lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function findUserByGoogleSub(googleSub: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOne({ googleSub }).select("+passwordHash").lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isBlocked: boolean;
};

export async function listAdminUsers(input: { page: number; limit: number; q: string }) {
  await connectToDatabase();
  const query: { role: "customer"; $or?: Array<Record<string, RegExp>> } = { role: "customer" };
  if (input.q) {
    const escaped = input.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escaped, "i");
    query.$or = [{ name: pattern }, { email: pattern }];
  }
  const [docs, total] = await Promise.all([
    UserModel.find(query)
      .select("name email createdAt isBlocked")
      .sort({ createdAt: -1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean<Array<{ _id: Types.ObjectId; name: string; email: string; createdAt: Date; isBlocked?: boolean }>>(),
    UserModel.countDocuments(query),
  ]);
  return {
    users: docs.map((doc): AdminUserRecord => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      createdAt: doc.createdAt.toISOString(),
      isBlocked: Boolean(doc.isBlocked),
    })),
    total,
    page: input.page,
    pages: Math.ceil(total / input.limit),
  };
}

export async function setCustomerBlocked(id: string, isBlocked: boolean): Promise<AdminUserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOneAndUpdate(
    { _id: id, role: "customer" },
    { $set: { isBlocked } },
    { returnDocument: "after", runValidators: true },
  ).select("name email createdAt isBlocked").lean<{
    _id: Types.ObjectId;
    name: string;
    email: string;
    createdAt: Date;
    isBlocked?: boolean;
  }>();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
    isBlocked: Boolean(doc.isBlocked),
  };
}

export async function linkGoogleIdentity(userId: string, googleSub: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findOneAndUpdate(
    { _id: userId, $or: [{ googleSub: { $exists: false } }, { googleSub: null }, { googleSub }] },
    { $set: { googleSub } },
    { returnDocument: "after", runValidators: true },
  ).select("+passwordHash").lean<UserDoc>();
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

export async function updateUserProfile(id: string, updates: { name?: string; phone?: string }): Promise<UserRecord | null> {
  await connectToDatabase();
  const $set: Record<string, string> = {};
  if (typeof updates.name === "string") $set.name = updates.name.trim();
  if (typeof updates.phone === "string") $set.phone = updates.phone.trim();
  const doc = await UserModel.findOneAndUpdate(
    { _id: id, isBlocked: { $ne: true } },
    { $set },
    { returnDocument: "after", runValidators: true },
  ).select("+passwordHash").lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
  await connectToDatabase();
  const result = await UserModel.updateOne({ _id: id, isBlocked: { $ne: true } }, { $set: { passwordHash } });
  return result.modifiedCount > 0;
}

function toAddressRecords(addresses: Array<UserAddressAttrs & { _id?: { toString(): string } }>) {
  return addresses.map((addr) => ({
    id: addr._id?.toString() ?? "",
    name: addr.name,
    email: addr.email,
    phone: addr.phone,
    pin: addr.pin,
    state: addr.state,
    city: addr.city,
    address: addr.address,
    apartment: addr.apartment ?? "",
  }));
}

export async function addUserAddress(id: string, address: Omit<UserAddressRecord, "id">): Promise<UserAddressRecord[]> {
  await connectToDatabase();
  const user = await UserModel.findOneAndUpdate(
    { _id: id, isBlocked: { $ne: true } },
    { $push: { addresses: address } },
    { returnDocument: "after", runValidators: true },
  ).lean<UserDoc>();
  if (!user) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return toAddressRecords(user.addresses ?? []);
}

export async function removeUserAddress(id: string, addressId: string): Promise<UserAddressRecord[]> {
  if (!Types.ObjectId.isValid(addressId)) throw new NotFoundError("Address not found.");
  await connectToDatabase();
  const user = await UserModel.findOneAndUpdate(
    { _id: id, isBlocked: { $ne: true } },
    { $pull: { addresses: { _id: new Types.ObjectId(addressId) } } },
    { returnDocument: "after", runValidators: true },
  ).lean<UserDoc>();
  if (!user) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return toAddressRecords(user.addresses ?? []);
}

function toFavoriteIds(favorites: Array<Types.ObjectId | string> | undefined) {
  return (favorites ?? []).map((favorite) => favorite.toString());
}

export async function addUserFavorite(id: string, productId: string): Promise<string[]> {
  await connectToDatabase();
  const prodObjId = new Types.ObjectId(productId);
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: id, isBlocked: { $ne: true } },
    { $addToSet: { favorites: prodObjId } },
    { returnDocument: "after", runValidators: true },
  ).lean<UserDoc>();
  if (!updatedUser) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return toFavoriteIds(updatedUser.favorites);
}

export async function removeUserFavorite(id: string, productId: string): Promise<string[]> {
  await connectToDatabase();
  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: id, isBlocked: { $ne: true } },
    { $pull: { favorites: new Types.ObjectId(productId) } },
    { returnDocument: "after", runValidators: true },
  ).lean<UserDoc>();
  if (!updatedUser) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return toFavoriteIds(updatedUser.favorites);
}

export async function mergeUserFavorites(id: string, productIds: string[]): Promise<string[]> {
  await connectToDatabase();
  const objectIds = productIds.map((productId) => new Types.ObjectId(productId));
  const updatedUser = objectIds.length > 0
    ? await UserModel.findOneAndUpdate(
        { _id: id, isBlocked: { $ne: true } },
        { $addToSet: { favorites: { $each: objectIds } } },
        { returnDocument: "after", runValidators: true },
      ).lean<UserDoc>()
    : await UserModel.findOne({ _id: id, isBlocked: { $ne: true } }).lean<UserDoc>();
  if (!updatedUser) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return toFavoriteIds(updatedUser.favorites);
}
