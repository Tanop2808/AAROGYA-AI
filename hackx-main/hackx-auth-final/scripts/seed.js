/**
 * Seed script — run with: npm run seed
 * Creates demo accounts for all four roles.
 *
 * Demo credentials (also in README):
 *   Patient    phone: 9876501001   password: patient123
 *   Doctor     email: doctor@sehat.com  password: doctor123
 *   ASHA       phone: 9876502001   password: asha123
 *   Pharmacist phone: 9876503001   password: pharma123
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("❌ MONGODB_URI not set in .env.local"); process.exit(1); }

async function hash(pw) { return bcrypt.hash(pw, 10); }

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;

  // ── Patients ──────────────────────────────────────────────────────────
  await db.collection("patients").deleteMany({});
  await db.collection("patients").insertMany([
    {
      phone: "9876501001", name: "Ramkali Devi",  age: 52, gender: "female",
      village: "Kesri",           conditions: ["diabetes", "hypertension"],
      bloodGroup: "B+", role: "patient",
      password: await hash("patient123"), createdAt: new Date(),
    },
    {
      phone: "9876501002", name: "Suresh Kumar",  age: 38, gender: "male",
      village: "Nabha Sector 4",  conditions: [],
      bloodGroup: "O+", role: "patient",
      password: await hash("patient123"), createdAt: new Date(),
    },
  ]);
  console.log("✅ Patients seeded");

  // ── Doctors ───────────────────────────────────────────────────────────
  await db.collection("doctors").deleteMany({});
  await db.collection("doctors").insertMany([
    {
      email: "doctor@sehat.com", name: "Dr. Ramesh Sharma",
      passwordHash: await hash("doctor123"),
      specialization: "General Physician", hospital: "Nabha Civil Hospital",
      role: "doctor", createdAt: new Date(),
    },
  ]);
  console.log("✅ Doctors seeded");

  // ── ASHA Workers ──────────────────────────────────────────────────────
  await db.collection("ashaworkers").deleteMany({});
  await db.collection("ashaworkers").insertMany([
    {
      phone: "9876502001", name: "Priya Sharma",
      password: await hash("asha123"),
      villages: ["Kesri", "Nabha Sector 4"], role: "ashaworker",
      createdAt: new Date(),
    },
  ]);
  console.log("✅ ASHA workers seeded");

  // ── Pharmacists ───────────────────────────────────────────────────────
  await db.collection("pharmacists").deleteMany({});
  await db.collection("pharmacists").insertMany([
    {
      phone: "9876503001", name: "Rajesh Kumar",
      password: await hash("pharma123"),
      storeName: "Rajesh Medical Store", village: "Kesri",
      district: "Nabha", address: "Main Market, Nabha",
      licenseNumber: "PH/2024/001", distanceKm: "1.2",
      type: "Private", isVerified: true,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 150, minRequired: 30, price: "₹2/tab", inStock: true },
        { medicineName: "ORS Sachet",        qty: 80,  minRequired: 20, price: "₹5/sachet", inStock: true },
        { medicineName: "Amoxicillin 500mg", qty: 60,  minRequired: 20, price: "₹8/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
  ]);
  console.log("✅ Pharmacists seeded");

  // ── Consultations (sample) ────────────────────────────────────────────
  await db.collection("consultations").deleteMany({});
  await db.collection("consultations").insertMany([
    {
      patientPhone: "9876501001", patientName: "Ramkali Devi",
      symptoms: ["Chest Pain", "Breathlessness"],
      urgency: "RED",
      triageResult: { urgency: "RED", conditionEn: "Possible Cardiac Emergency", emergency: true },
      status: "pending", createdAt: new Date(),
    },
    {
      patientPhone: "9876501002", patientName: "Suresh Kumar",
      symptoms: ["Fever", "Cough"],
      urgency: "YELLOW",
      triageResult: { urgency: "YELLOW", conditionEn: "Possible Flu / Viral Fever", emergency: false },
      status: "pending", createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  ]);
  console.log("✅ Consultations seeded");

  await mongoose.disconnect();
  console.log("\n🎉 Seed complete! Demo credentials:");
  console.log("   Patient    9876501001 / patient123");
  console.log("   Doctor     doctor@sehat.com / doctor123");
  console.log("   ASHA       9876502001 / asha123");
  console.log("   Pharmacist 9876503001 / pharma123");
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
