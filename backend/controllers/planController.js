const Plan = require("../models/Plan");
const UserPreference = require("../models/UserPreference");
const axios = require("axios");

/* ──────────────────────────────────────────────
   AI helper
────────────────────────────────────────────── */
function getGroqApiKey() {
  return process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
}

async function callGroqAI(messages) {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("Missing Groq API Key.");

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages,
      temperature: 0.35,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 60000
    }
  );

  return response.data.choices[0].message.content;
}

/* ──────────────────────────────────────────────
   generatePlan
   POST /api/plans/generate
────────────────────────────────────────────── */
exports.generatePlan = async (req, res, next) => {
  try {
    const {
      goal,
      subjects = [],
      examDate,
      availableHours = 2,
      currentLevel = "beginner",
      weakTopics = []
    } = req.body;

    if (!goal || !examDate) {
      return res
        .status(400)
        .json({ success: false, message: "goal and examDate are required." });
    }

    const userId = req.user.uid;

    // Calculate days until exam
    const now = new Date();
    const exam = new Date(examDate);
    const durationDays = Math.max(
      1,
      Math.ceil((exam - now) / (1000 * 60 * 60 * 24))
    );

    // Pull learning profile from preferences
    const prefs = await UserPreference.findOne({ userId });
    const profile = prefs?.learningProfile || {};
    const profileContext = [
      profile.weaknesses?.length
        ? `Known weaknesses: ${profile.weaknesses.join(", ")}.`
        : "",
      profile.strengths?.length
        ? `Known strengths: ${profile.strengths.join(", ")}.`
        : "",
      profile.preferredStyle
        ? `Preferred learning style: ${profile.preferredStyle}.`
        : ""
    ]
      .filter(Boolean)
      .join(" ");

    const subjectList = subjects.join(", ") || "General study";
    const weakList = weakTopics.join(", ") || "none specified";

    const systemPrompt = `You are an expert AI study planner trained in cognitive and learning science.
Create a personalized, realistic study plan using:
- Spaced repetition (review topics at increasing intervals)
- Active recall (self-testing and practice questions)
- Revision cycles (revisit weak areas every 2-3 days)
- Interleaving (mix subjects for better retention)
- Time-block scheduling (structured daily sessions with breaks)

Return STRICTLY valid JSON matching this exact schema:
{
  "title": "string",
  "summary": "string (2-3 sentences motivational overview)",
  "dailyTasks": [
    {
      "day": number,
      "label": "string (e.g. Day 1 – Monday)",
      "theme": "string (e.g. Foundation & Basics)",
      "timeBlocks": [
        {
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "tasks": [
            {
              "title": "string",
              "description": "string (detailed action)",
              "type": "study | revision | practice | recall | break",
              "duration": number_in_minutes,
              "subject": "string"
            }
          ]
        }
      ],
      "revision": ["string (spaced-rep topic to revisit)"],
      "totalMinutes": number
    }
  ],
  "weeklyTasks": [
    {
      "week": number,
      "milestone": "string",
      "goals": ["string"],
      "focusAreas": ["string"]
    }
  ]
}

Rules:
- Return exactly ${Math.min(durationDays, 14)} days in dailyTasks (max 14 for JSON size limits).
- Each day should have 2-4 time blocks fitting within ${availableHours} hours of available study time.
- Include at least one "recall" or "practice" task per day.
- Include revision of prior topics starting from Day 2.
- Weekly milestones should cover every 7 days (or partial week at end).
- All times must be realistic (e.g. 09:00–10:30).`;

    const userPrompt = `Goal: ${goal}
Subjects: ${subjectList}
Exam Date: ${examDate} (${durationDays} days away)
Daily Available Hours: ${availableHours}
Current Level: ${currentLevel}
Weak Topics: ${weakList}
${profileContext ? "Student Profile: " + profileContext : ""}

Please create a personalized study plan.`;

    const aiResponse = await callGroqAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    let parsed;
    try {
      let cleaned = aiResponse;
      const objectStart = cleaned.indexOf("{");
      const arrayStart = cleaned.indexOf("[");
      const starts = [objectStart, arrayStart].filter(index => index >= 0);
      const start = starts.length ? Math.min(...starts) : -1;
      const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
      if (start >= 0 && end > start) {
        cleaned = cleaned.slice(start, end + 1);
      }
      parsed = JSON.parse(cleaned);
    } catch {
      return res
        .status(500)
        .json({ success: false, message: "AI returned invalid JSON." });
    }

    const plan = await Plan.create({
      userId,
      goal,
      subjects,
      examDate: exam,
      availableHours,
      currentLevel,
      weakTopics,
      durationDays,
      title: parsed.title || `${goal} – Study Plan`,
      summary: parsed.summary || "",
      dailyTasks: parsed.dailyTasks || [],
      weeklyTasks: parsed.weeklyTasks || []
    });

    res.status(201).json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────
   getPlans
   GET /api/plans
────────────────────────────────────────────── */
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .select("-dailyTasks -weeklyTasks -schedule"); // lightweight list

    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────
   getPlanById
   GET /api/plans/:id
────────────────────────────────────────────── */
exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────
   updatePlanProgress
   PUT /api/plans/:id/progress
   Body: { dayIndex, blockIndex, taskIndex, completed }
────────────────────────────────────────────── */
exports.updatePlanProgress = async (req, res, next) => {
  try {
    const { dayIndex, blockIndex, taskIndex, completed } = req.body;

    const plan = await Plan.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    const day = plan.dailyTasks[dayIndex];
    if (!day)
      return res.status(400).json({ success: false, message: "Day not found" });

    const block = day.timeBlocks[blockIndex];
    if (!block)
      return res.status(400).json({ success: false, message: "Time block not found" });

    const task = block.tasks[taskIndex];
    if (!task)
      return res.status(400).json({ success: false, message: "Task not found" });

    task.completed = completed;
    task.completedAt = completed ? new Date() : undefined;

    // Mark the nested array as modified (Mongoose subdoc quirk)
    plan.markModified("dailyTasks");
    await plan.save(); // pre-save hook recalculates progress

    res.json({
      success: true,
      progress: plan.progress,
      completedTasks: plan.completedTasks,
      totalTasks: plan.totalTasks
    });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────
   deletePlan
   DELETE /api/plans/:id
────────────────────────────────────────────── */
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    res.json({ success: true, message: "Plan deleted." });
  } catch (error) {
    next(error);
  }
};

/* ──────────────────────────────────────────────
   Legacy: updateTaskStatus (backward compat)
   PUT /api/plans/task
────────────────────────────────────────────── */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { planId, dayIndex, taskIndex, completed } = req.body;

    const plan = await Plan.findOne({ _id: planId, userId: req.user.uid });
    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    if (plan.schedule && plan.schedule[dayIndex]?.tasks[taskIndex] != null) {
      plan.schedule[dayIndex].tasks[taskIndex].completed = completed;
      plan.markModified("schedule");
      await plan.save();
    }

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
};

