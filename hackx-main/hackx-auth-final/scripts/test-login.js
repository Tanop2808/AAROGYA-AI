/**
 * Test script to verify patient credentials in MongoDB
 * Run: node scripts/test-login.js
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

async function testLogin() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  const Patient = mongoose.models.Patient || require("../models/index").Patient;

  // Get all patients
  const patients = await Patient.find({}).select("+password");
  console.log(`\n📋 Found ${patients.length} patient(s):\n`);

  for (const p of patients) {
    console.log(`👤 Name: ${p.name}`);
    console.log(`   Phone: ${p.phone}`);
    console.log(`   Has Password Hash: ${!!p.password}`);
    console.log(`   Hash starts with: ${p.password ? p.password.substring(0, 20) : 'NONE'}...`);
    console.log("");
  }

  // Test a specific login
  const testPhone = "9876501001"; // Demo patient
  const testPassword = "patient123";

  console.log(`\n🧪 Testing login with phone: ${testPhone}`);
  const patient = await Patient.findOne({ phone: testPhone }).select("+password");
  
  if (!patient) {
    console.log("❌ Patient not found!");
  } else {
    console.log(`✅ Found patient: ${patient.name}`);
    
    const isValid = await bcrypt.compare(testPassword, patient.password);
    if (isValid) {
      console.log("✅ Password is CORRECT!");
    } else {
      console.log("❌ Password is WRONG!");
      
      // Try with different bcrypt rounds
      console.log("\n🔍 Trying to hash the password fresh...");
      const newHash = await bcrypt.hash(testPassword, 10);
      const verifyNew = await bcrypt.compare(testPassword, newHash);
      console.log(`Fresh hash verification: ${verifyNew ? '✅ Works' : '❌ Failed'}`);
    }
  }

  await mongoose.disconnect();
  console.log("\n✅ Done!");
}

testLogin().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
