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

    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ success: true, uid: decoded.uid });
  } catch (err) {
    console.error("session-login error:", err.message); // temp: see the real reason in Render logs
    sendError(res, "Failed to create session", 401);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ success: true });
});

module.exports = router;