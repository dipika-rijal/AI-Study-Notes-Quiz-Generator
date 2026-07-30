const UserStreak = require("../models/UserStreak");

async function getStreak(req, res, next) {
  try {
    const userId = req.user.uid;
    let streakDoc = await UserStreak.findOne({ userId });

    const now = new Date();
    // Normalize today to start of day for easy comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!streakDoc) {
      streakDoc = new UserStreak({
        userId,
        currentStreak: 1,
        lastActiveDate: today
      });
      await streakDoc.save();
    } else {
      const lastActive = streakDoc.lastActiveDate;
      if (lastActive) {
        const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
        const diffTime = today.getTime() - lastActiveDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streakDoc.currentStreak += 1;
          streakDoc.lastActiveDate = today;
          await streakDoc.save();
        } else if (diffDays >= 2) {
          streakDoc.currentStreak = 1;
          streakDoc.lastActiveDate = today;
          await streakDoc.save();
        } else if (diffDays === 0) {
          // same day, no change
        }
      } else {
        streakDoc.currentStreak = 1;
        streakDoc.lastActiveDate = today;
        await streakDoc.save();
      }
    }

    res.status(200).json({
      success: true,
      currentStreak: streakDoc.currentStreak || 0,
      longestStreak: streakDoc.currentStreak || 0,
      doneToday: true,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStreak };
