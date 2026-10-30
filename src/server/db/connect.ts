import mongoose from "mongoose";
import { getMongoUri } from "@/server/config/env";

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Cached on globalThis so dev hot reloads and serverless invocations reuse one connection.
const globalCache = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cache: MongooseCache = (globalCache.mongooseCache ??= { conn: null, promise: null });

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(getMongoUri(), { bufferCommands: false });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
