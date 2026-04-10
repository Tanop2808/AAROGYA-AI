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

  // ── Pharmacists (Mumbai) ──────────────────────────────────────────────
  await db.collection("pharmacists").deleteMany({});
  await db.collection("pharmacists").insertMany([
    {
      phone: "9876503001", name: "Rahul Mehta",
      password: await hash("pharma123"),
      storeName: "Apollo Pharmacy - Andheri West", village: "Andheri West",
      district: "Mumbai Suburban", address: "Near DN Nagar Metro, Andheri West, Mumbai - 400053",
      licenseNumber: "MH/MUM/2024/001", distanceKm: "1.2",
      type: "Private", isVerified: true,
      lat: 19.1366, lng: 72.8350,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 200, minRequired: 50, price: "₹2/tab", inStock: true },
        { medicineName: "ORS Sachet",        qty: 150, minRequired: 50, price: "₹5/sachet", inStock: true },
        { medicineName: "Amoxicillin 500mg", qty: 100, minRequired: 30, price: "₹10/tab", inStock: true },
        { medicineName: "Metformin 500mg",   qty: 120, minRequired: 30, price: "₹4/tab", inStock: true },
        { medicineName: "Cetirizine 10mg",   qty: 80,  minRequired: 20, price: "₹3/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
    {
      phone: "9876503002", name: "Priya Patil",
      password: await hash("pharma123"),
      storeName: "Wellness Forever - Bandra West", village: "Bandra West",
      district: "Mumbai", address: "Linking Road, Bandra West, Mumbai - 400050",
      licenseNumber: "MH/MUM/2024/002", distanceKm: "2.5",
      type: "Jan Aushadhi", isVerified: true,
      lat: 19.0596, lng: 72.8295,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 300, minRequired: 50, price: "₹1.5/tab", inStock: true },
        { medicineName: "Ibuprofen 400mg",   qty: 150, minRequired: 30, price: "₹3/tab", inStock: true },
        { medicineName: "Cetirizine 10mg",   qty: 100, minRequired: 30, price: "₹2/tab", inStock: true },
        { medicineName: "ORS Sachet",        qty: 200, minRequired: 50, price: "₹4/sachet", inStock: true },
        { medicineName: "Azithromycin 500mg", qty: 60, minRequired: 20, price: "₹12/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
    {
      phone: "9876503003", name: "Suresh Yadav",
      password: await hash("pharma123"),
      storeName: "MedPlus Pharmacy - Dadar", village: "Dadar East",
      district: "Mumbai", address: "Dadar TT Circle, Dadar East, Mumbai - 400014",
      licenseNumber: "MH/MUM/2024/003", distanceKm: "3.8",
      type: "Private", isVerified: true,
      lat: 19.0176, lng: 72.8464,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 250, minRequired: 50, price: "₹2.5/tab", inStock: true },
        { medicineName: "Azithromycin 500mg", qty: 80, minRequired: 20, price: "₹14/tab", inStock: true },
        { medicineName: "Metformin 500mg",   qty: 150, minRequired: 30, price: "₹4.5/tab", inStock: true },
        { medicineName: "Amoxicillin 500mg", qty: 90,  minRequired: 30, price: "₹11/tab", inStock: true },
        { medicineName: "Ibuprofen 400mg",   qty: 120, minRequired: 30, price: "₹3.5/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
    {
      phone: "9876503004", name: "Govt Medical Store",
      password: await hash("pharma123"),
      storeName: "KEM Hospital Free Pharmacy", village: "Parel",
      district: "Mumbai", address: "KEM Hospital Campus, Parel, Mumbai - 400012",
      licenseNumber: "MH/GOV/2024/001", distanceKm: "4.2",
      type: "Govt Free", isVerified: true,
      lat: 19.0008, lng: 72.8490,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 1000, minRequired: 200, price: "FREE", inStock: true },
        { medicineName: "ORS Sachet",        qty: 500,  minRequired: 100, price: "FREE", inStock: true },
        { medicineName: "Metformin 500mg",   qty: 400,  minRequired: 100, price: "FREE", inStock: true },
        { medicineName: "Amoxicillin 500mg", qty: 300,  minRequired: 100, price: "FREE", inStock: true },
        { medicineName: "Ibuprofen 400mg",   qty: 350,  minRequired: 100, price: "FREE", inStock: true },
        { medicineName: "Cetirizine 10mg",   qty: 200,  minRequired: 50,  price: "FREE", inStock: true },
      ],
      createdAt: new Date(),
    },
    {
      phone: "9876503005", name: "Anita Desai",
      password: await hash("pharma123"),
      storeName: "LifeCare Pharmacy - Powai", village: "Powai",
      district: "Mumbai Suburban", address: "Hiranandani Gardens, Powai, Mumbai - 400076",
      licenseNumber: "MH/MUM/2024/005", distanceKm: "5.5",
      type: "Private", isVerified: true,
      lat: 19.1197, lng: 72.9050,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 180, minRequired: 30, price: "₹2/tab", inStock: true },
        { medicineName: "Cetirizine 10mg",   qty: 100, minRequired: 20, price: "₹2.5/tab", inStock: true },
        { medicineName: "ORS Sachet",        qty: 60,  minRequired: 20, price: "₹6/sachet", inStock: false },
        { medicineName: "Amoxicillin 500mg", qty: 50,  minRequired: 20, price: "₹12/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
    {
      phone: "9876503006", name: "Mohammed Khan",
      password: await hash("pharma123"),
      storeName: "HealthPlus Medical - Colaba", village: "Colaba",
      district: "Mumbai", address: "Colaba Causeway, Mumbai - 400005",
      licenseNumber: "MH/MUM/2024/006", distanceKm: "6.8",
      type: "Private", isVerified: true,
      lat: 18.9067, lng: 72.8147,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 150, minRequired: 30, price: "₹2.5/tab", inStock: true },
        { medicineName: "Metformin 500mg",   qty: 100, minRequired: 30, price: "₹5/tab", inStock: true },
        { medicineName: "Ibuprofen 400mg",   qty: 80,  minRequired: 20, price: "₹4/tab", inStock: true },
        { medicineName: "Azithromycin 500mg", qty: 40, minRequired: 10, price: "₹15/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
    {
      phone: "9876503007", name: "Sanjay Joshi",
      password: await hash("pharma123"),
      storeName: "Jan Aushadhi Kendra - Goregaon", village: "Goregaon East",
      district: "Mumbai Suburban", address: "Near Film City Road, Goregaon East, Mumbai - 400063",
      licenseNumber: "MH/MUM/2024/007", distanceKm: "7.2",
      type: "Jan Aushadhi", isVerified: true,
      lat: 19.1625, lng: 72.8525,
      stock: [
        { medicineName: "Paracetamol 500mg", qty: 400, minRequired: 100, price: "₹1/tab", inStock: true },
        { medicineName: "Metformin 500mg",   qty: 300, minRequired: 50,  price: "₹2/tab", inStock: true },
        { medicineName: "Ibuprofen 400mg",   qty: 200, minRequired: 50,  price: "₹1.5/tab", inStock: true },
        { medicineName: "ORS Sachet",        qty: 250, minRequired: 50,  price: "₹3/sachet", inStock: true },
        { medicineName: "Cetirizine 10mg",   qty: 150, minRequired: 30, price: "₹1.5/tab", inStock: true },
        { medicineName: "Amoxicillin 500mg", qty: 100, minRequired: 30, price: "₹5/tab", inStock: true },
      ],
      createdAt: new Date(),
    },
  ]);
  console.log("✅ Pharmacists seeded with Mumbai GPS coordinates");

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
