const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["study", "revision", "practice", "recall", "break"],
      default: "study"
    },
    duration: { type: Number, default: 30 }, // minutes
    subject: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { _id: true }
);

const timeBlockSchema = new mongoose.Schema(
  {
    startTime: { type: String, default: "09:00" }, // e.g. "09:00"
    endTime: { type: String, default: "10:00" },
    tasks: [taskSchema]
  },
  { _id: false }
);

const dailyPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },          // 1-indexed
    date: { type: String, default: "" },            // ISO date string
    label: { type: String, default: "" },           // e.g. "Monday, Day 1"
    theme: { type: String, default: "" },           // e.g. "Foundation"
    timeBlocks: [timeBlockSchema],
    revision: { type: [String], default: [] },      // spaced-rep topics
    totalMinutes: { type: Number, default: 0 }
  },
  { _id: false }
);

const weeklyPlanSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    milestone: { type: String, default: "" },
    goals: { type: [String], default: [] },
    focusAreas: { type: [String], default: [] },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },

    // Student inputs
    goal: { type: String, required: true },
    subjects: { type: [String], default: [] },
    examDate: { type: Date, required: true },
    availableHours: { type: Number, default: 2 },     // hours/day
    currentLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    weakTopics: { type: [String], default: [] },

    // AI-generated schedule
    title: { type: String, default: "" },
    summary: { type: String, default: "" },
    durationDays: { type: Number, default: 7 },
    dailyTasks: [dailyPlanSchema],
    weeklyTasks: [weeklyPlanSchema],

    // Progress
    progress: { type: Number, default: 0, min: 0, max: 100 }, // percent
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },

    // Legacy compat
    schedule: { type: mongoose.Schema.Types.Mixed, default: [] }
  },
  { timestamps: true }
);

// Auto-compute progress before save
planSchema.pre("save", function (next) {
  let total = 0;
  let done = 0;
  (this.dailyTasks || []).forEach((day) => {
    (day.timeBlocks || []).forEach((block) => {
      (block.tasks || []).forEach((task) => {
        total++;
        if (task.completed) done++;
      });
    });
  });
  this.totalTasks = total;
  this.completedTasks = done;
  this.progress = total > 0 ? Math.round((done / total) * 100) : 0;
  next();
});

module.exports = mongoose.model("Plan", planSchema);
