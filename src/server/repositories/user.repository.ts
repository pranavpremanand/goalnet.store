import { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
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

export async function findUserById(id: string): Promise<UserRecord | null> {
  await connectToDatabase();
  const doc = await UserModel.findById(id).select("+passwordHash").lean<UserDoc>();
  return doc ? toRecord(doc) : null;
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
  const doc = await UserModel.findByIdAndUpdate(
    id,
    { $set },
    { returnDocument: "after", runValidators: true },
  ).select("+passwordHash").lean<UserDoc>();
  return doc ? toRecord(doc) : null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
  await connectToDatabase();
  const result = await UserModel.updateOne({ _id: id }, { $set: { passwordHash } });
  return result.modifiedCount > 0;
}

export async function addUserAddress(id: string, address: Omit<UserAddressRecord, "id">): Promise<UserAddressRecord[] | null> {
  await connectToDatabase();
  const user = await UserModel.findById(id);
  if (!user) return null;
  user.addresses.push(address as any);
  await user.save();
  return user.addresses.map((addr) => ({
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

export async function removeUserAddress(id: string, addressId: string): Promise<UserAddressRecord[] | null> {
  await connectToDatabase();
  const user = await UserModel.findById(id);
  if (!user) return null;
  user.addresses = user.addresses.filter((addr) => addr._id?.toString() !== addressId) as any;
  await user.save();
  return user.addresses.map((addr) => ({
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

export async function toggleUserFavorite(id: string, productId: string): Promise<string[]> {
  await connectToDatabase();
  const user = await UserModel.findById(id);
  if (!user) return [];
  const prodObjId = new Types.ObjectId(productId);
  const exists = user.favorites.some((fav) => fav.toString() === productId);
  if (exists) {
    user.favorites = user.favorites.filter((fav) => fav.toString() !== productId) as any;
  } else {
    user.favorites.push(prodObjId as any);
  }
  await user.save();
  return user.favorites.map((fav) => fav.toString());
}
