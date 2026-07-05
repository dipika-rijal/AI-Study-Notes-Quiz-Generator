const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use reliable DNS servers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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