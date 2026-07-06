const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    explanation: {
      type: String,
      required: true,
      default: "This is the correct answer.",
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: function (options) {
          return Array.isArray(options) && options.length === 4;
        },
        message: "Each question must have exactly 4 options.",
      },
    },
  },
  { timestamps: false }
);

const quizSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    sourceType: {
      type: String,
      enum: ["manual", "note", "pasted-content", "ai-generated"],
      default: "manual",
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
  },
  { timestamps: true }
);

quizSchema.pre("validate", function () {
  for (const question of this.questions) {
    const correctCount = question.options.filter(function (option) {
      return option.isCorrect;
    }).length;

    if (correctCount !== 1) {
      throw new Error("Each question must have exactly one correct option.");
    }
  }
});

module.exports = mongoose.model("Quiz", quizSchema);
