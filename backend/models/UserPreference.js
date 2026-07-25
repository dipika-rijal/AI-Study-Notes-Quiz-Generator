const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    theme: { type: String, default: "dark" },
    accent: { type: String, default: "purple" },
    learningProfile: {
      weaknesses: { type: [String], default: [] },
      strengths: { type: [String], default: [] },
      preferredStyle: { type: String, default: "balanced" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
