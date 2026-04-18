import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  // Check if connection is alive before returning cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection was dropped, stale, or not ready - create fresh connection
  // Reset any existing promise to force a fresh connection
  cached.promise = null;

  // Retry up to 3 times
  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[dbConnect] Attempt ${attempt}/3...`);
      const conn = await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 3000,  // fail fast — DB save is non-critical
        socketTimeoutMS: 15000,
      });
      cached.conn = conn;
      console.log(`[dbConnect] Connected successfully on attempt ${attempt}`);
      return conn;
    } catch (err: any) {
      lastError = err;
      console.error(`[dbConnect] Attempt ${attempt} failed:`, err.message);
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // All retries failed
  console.error("[dbConnect] All connection attempts failed");
  throw lastError;
}

export default dbConnect;
