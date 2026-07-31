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

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    res.json({ success: true, uid: decoded.uid });
  } catch (err) {
    console.error("session-login error:", err.message);
    sendError(res, "Failed to create session", 401);
  }
});

router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("session", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ success: true });
});

module.exports = router;