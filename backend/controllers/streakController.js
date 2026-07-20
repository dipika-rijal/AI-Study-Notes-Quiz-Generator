const QuizAttempt = require("../models/QuizAttempt");
const { calculateStreak } = require("../utils/streakUtils");

// NOTE: once auth middleware + userId scoping is added, filter this query
// by req.user.uid. For now it reads all completed attempts.
async function getStreak(req, res, next) {
  try {
    const attempts = await QuizAttempt.find({ status: "completed" })
      .select("createdAt")
      .lean();

    const dates = attempts.map((a) => a.createdAt);
    const { current, longest } = calculateStreak(dates);

    const today = new Date();
    const todayStr = today.toDateString();
    const doneToday = dates.some((d) => new Date(d).toDateString() === todayStr);

    res.status(200).json({
      success: true,
      currentStreak: current,
      longestStreak: longest,
      doneToday,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStreak };
