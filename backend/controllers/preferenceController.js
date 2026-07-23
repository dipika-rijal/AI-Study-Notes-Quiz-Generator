const UserPreference = require("../models/UserPreference.js");
const { sendResponse, sendError } = require("../utils/apiResponse.js");

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    let prefs = await UserPreference.findOne({ userId });
    
    if (!prefs) {
      prefs = await UserPreference.create({ userId, theme: "dark", accent: "purple" });
    }
    
    return sendResponse(res, "Preferences retrieved", {
      theme: prefs.theme,
      accent: prefs.accent
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return sendError(res, "Failed to retrieve preferences", 500);
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { theme, accent } = req.body;
    
    const prefs = await UserPreference.findOneAndUpdate(
      { userId },
      { $set: { theme, accent } },
      { new: true, upsert: true }
    );
    
    return sendResponse(res, "Preferences updated", {
      theme: prefs.theme,
      accent: prefs.accent
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return sendError(res, "Failed to update preferences", 500);
  }
};
