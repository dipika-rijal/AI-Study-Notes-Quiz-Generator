const mongoose = require("mongoose");
require("dotenv").config();
const UserPreference = require("./models/UserPreference.js");

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  try {
    const userId = "test-user-id";
    let prefs = await UserPreference.findOne({ userId });
    console.log("Prefs:", prefs);
    if (!prefs) {
      prefs = await UserPreference.create({ userId, theme: "dark", accent: "purple" });
      console.log("Created:", prefs);
    }
  } catch (err) {
    console.error("ERROR:", err);
  }
  mongoose.disconnect();
}
test();
