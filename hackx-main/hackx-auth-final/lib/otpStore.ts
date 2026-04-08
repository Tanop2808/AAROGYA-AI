/**
 * OTP store backed by MongoDB.
 *
 * Replaces the in-memory Map that was wiped on every cold start / serverless
 * invocation.  Each OTP is a small document that MongoDB TTL-indexes auto-
 * deletes after 5 minutes — no cron job needed.
 *
 * If you add Redis (Upstash) later, swap the implementation here and nothing
 * else in the codebase changes.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import dbConnect from "@/lib/mongodb";

interface IOTPRecord extends Document {
  phone:     string;
  otp:       string;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTPRecord>({
  phone:     { type: String, required: true, index: true },
  otp:       { type: String, required: true },
  // TTL index: MongoDB removes the document automatically after expiry
  expiresAt: { type: Date,   required: true, index: { expires: 0 } },
});

const OTPRecord: Model<IOTPRecord> =
  mongoose.models.OTPRecord ||
  mongoose.model<IOTPRecord>("OTPRecord", OTPSchema);

export async function storeOTP(phone: string, otp: string): Promise<void> {
  await dbConnect();
  await OTPRecord.findOneAndUpdate(
    { phone },
    { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    { upsert: true, new: true }
  );
}

export async function getOTP(
  phone: string
): Promise<{ otp: string; expiresAt: Date } | null> {
  await dbConnect();
  const record = await OTPRecord.findOne({ phone });
  if (!record) return null;
  return { otp: record.otp, expiresAt: record.expiresAt };
}

export async function deleteOTP(phone: string): Promise<void> {
  await dbConnect();
  await OTPRecord.deleteOne({ phone });
}
