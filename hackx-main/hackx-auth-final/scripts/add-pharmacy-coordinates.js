// Script to add GPS coordinates to existing pharmacies
// Run: node scripts/add-pharmacy-coordinates.js

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Sample pharmacy coordinates around Nabha, Punjab (replace with real coordinates)
const pharmacyCoordinates = [
  // Nabha area
  { storeName: "Nabha Medical Store", lat: 30.3782, lng: 76.3641 },
  { storeName: "Punjab Pharmacy", lat: 30.3810, lng: 76.3680 },
  { storeName: "Sharma Medical", lat: 30.3750, lng: 76.3590 },
  
  // Kesri area
  { storeName: "Kesri Medical Hall", lat: 30.3900, lng: 76.3800 },
  
  // Barnala Road
  { storeName: "Barnala Road Pharmacy", lat: 30.3700, lng: 76.3500 },
];

async function updatePharmacyCoordinates() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Pharmacist = mongoose.models.Pharmacist || require("../models/index").Pharmacist;

    const totalPharmacies = await Pharmacist.countDocuments();
    console.log(`📊 Found ${totalPharmacies} pharmacies in database`);

    let updated = 0;
    let notFound = 0;

    for (const pharma of pharmacyCoordinates) {
      const result = await Pharmacist.updateOne(
        { storeName: pharma.storeName },
        { 
          $set: { 
            lat: pharma.lat, 
            lng: pharma.lng 
          } 
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${pharma.storeName} (${pharma.lat}, ${pharma.lng})`);
        updated++;
      } else {
        console.log(`⚠️  Not found: ${pharma.storeName}`);
        notFound++;
      }
    }

    console.log(`\n📋 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    console.log(`   📊 Total attempted: ${pharmacyCoordinates.length}`);

    // Show all pharmacies with coordinates
    const allPharmacies = await Pharmacist.find({}).select("storeName village lat lng");
    console.log("\n🗺️  Current pharmacy coordinates:");
    allPharmacies.forEach(p => {
      if (p.lat && p.lng) {
        console.log(`   📍 ${p.storeName} (${p.village}): ${p.lat}, ${p.lng}`);
      } else {
        console.log(`   ❌ ${p.storeName} (${p.village}): No coordinates`);
      }
    });

    await mongoose.disconnect();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updatePharmacyCoordinates();
