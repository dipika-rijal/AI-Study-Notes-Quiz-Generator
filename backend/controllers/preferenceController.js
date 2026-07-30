const UserPreference = require("../models/UserPreference.js");
const { sendSuccess, sendError } = require("../utils/apiResponse.js");

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    let prefs = await UserPreference.findOne({ userId });
    
    if (!prefs) {
      prefs = await UserPreference.create({ userId, theme: "light", accent: "purple" });
    } else if (!prefs.themeConfigured && prefs.theme !== "light") {
      // Migrate the former dark default without overriding a theme chosen in Settings.
      prefs.theme = "light";
      await prefs.save();
    }
    
    return sendSuccess(res, {
      message: "Preferences retrieved",
      theme: prefs.theme,
      accent: prefs.accent,
      learningProfile: prefs.learningProfile || { weaknesses: [], strengths: [], preferredStyle: "balanced" }
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return sendError(res, "Failed to retrieve preferences", 500);
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { theme, accent, learningProfile } = req.body;
    
    const updateData = {};
    if (theme) {
      updateData.theme = theme;
      updateData.themeConfigured = true;
    }
    if (accent) updateData.accent = accent;
    if (learningProfile) updateData.learningProfile = learningProfile;

    const prefs = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    return sendSuccess(res, {
      message: "Preferences updated",
      theme: prefs.theme,
      accent: prefs.accent,
      learningProfile: prefs.learningProfile
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return sendError(res, "Failed to update preferences", 500);
  }
};
