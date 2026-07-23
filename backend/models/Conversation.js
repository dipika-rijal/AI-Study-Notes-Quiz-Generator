const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, default: "" },
    type: { type: String, default: "text" },
    title: { type: String, default: "" },
    category: { type: String, default: "" },
    options: { type: mongoose.Schema.Types.Mixed, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: String, default: "success" },
    saved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, trim: true, index: true },
    title: { type: String, default: "New Chat", trim: true },
    topic: { type: String, default: "" },
    summary: { type: String, default: "" },
    messages: [messageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
