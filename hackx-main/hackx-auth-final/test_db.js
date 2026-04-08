const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = await mongoose.connection.db.collection("pharmacists").find({ phone: "7900011247" }).toArray();
  console.log(JSON.stringify(data, null, 2));
  process.exit();
}
check();
