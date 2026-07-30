const mongoose = require("mongoose");

const userStreakSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStreak", userStreakSchema);
