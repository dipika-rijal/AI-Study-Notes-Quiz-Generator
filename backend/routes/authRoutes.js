const express = require("express");
const { getAuth } = require("firebase-admin/auth");
const { sendError } = require("../utils/apiResponse.js");

const router = express.Router();

router.post("/session-login", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return sendError(res, "ID token required", 400);

    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    const decoded = await getAuth().verifyIdToken(idToken);

    // Optional: require recent login for sensitive session creation
    // if (Date.now() / 1000 - decoded.auth_time > 5 * 60) throw new Error("Recent sign-in required");

    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ success: true, uid: decoded.uid });
  } catch (err) {
    sendError(res, "Failed to create session", 401);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.json({ success: true });
});

module.exports = router;