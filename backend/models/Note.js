const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    summary: {
      type: String,
      default: ""
    },
    sourceType: {
      type: String,
      enum: ["manual", "pasted-content", "video-link", "document"],
      default: "manual"
    },
    sourceText: {
      type: String,
      default: ""
    },
    tags: {
      type: [String],
      default: []
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);

