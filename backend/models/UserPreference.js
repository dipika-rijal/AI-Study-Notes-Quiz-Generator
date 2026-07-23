const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    theme: { type: String, default: "dark" },
    accent: { type: String, default: "purple" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
