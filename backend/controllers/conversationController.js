const Conversation = require("../models/Conversation");

// Create or update a conversation
async function saveConversation(req, res, next) {
  try {
    const { id } = req.params;
    const { messages, title, topic, summary } = req.body;

    let conversation = await Conversation.findOne({ _id: id, userId: req.user.uid });

    if (conversation) {
      if (messages) conversation.messages = messages;
      if (title) conversation.title = title;
      if (topic) conversation.topic = topic;
      if (summary) conversation.summary = summary;
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        _id: id,
        messages: messages || [],
        title: title || "New Chat",
        topic: topic || "",
        summary: summary || "",
        userId: req.user.uid
      });
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
}

// Get a single conversation by ID
async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findOne({ _id: id, userId: req.user.uid }).lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
}

// Delete a conversation by ID
async function deleteConversation(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Conversation.findOneAndDelete({ _id: id, userId: req.user.uid });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    res.status(200).json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    next(error);
  }
}

// Get all conversations (optional, but handled in history controller mostly)
async function getConversations(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 50;
    const conversations = await Conversation.find({ userId: req.user.uid })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, items: conversations });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  saveConversation,
  getConversation,
  deleteConversation,
  getConversations
};
