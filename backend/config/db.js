const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.includes("paste_your")) {
    throw new Error("Please add your real MongoDB connection string in .env");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000
  });

  console.log("MongoDB connected successfully");
}

module.exports = connectDB;
