const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { sendError } = require("../utils/apiResponse.js");

let firebaseReady = false;

function initFirebaseAdmin() {
  if (firebaseReady || getApps().length > 0) {
    firebaseReady = true;
    return;
  }

  try {
    // Local dev: reads from a JSON file. Production: reads from an env var (see below).
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : require("../config/serviceAccountKey.json");

    initializeApp({ credential: cert(serviceAccount) });
    firebaseReady = true;
    console.log("🔥 Firebase Admin initialised with service account");
  } catch (err) {
    console.warn("⚠️  Firebase service account not found/invalid:", err.message);
  }
}

initFirebaseAdmin();

// Verifies the session cookie instead of a Bearer token now.
async function requireAuth(req, res, next) {
  try {
    const sessionCookie = req.cookies?.session;

    if (!sessionCookie) {
      return sendError(res, "Authentication required", 401);
    }

    if (!firebaseReady) {
      return sendError(res, "Auth service is not configured on the server", 503);
    }

    const decoded = await getAuth().verifySessionCookie(sessionCookie, true); // true = check revocation

    if (!decoded.uid || typeof decoded.uid !== "string") {
      return sendError(res, "Invalid session", 401);
    }

    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    return sendError(res, "Invalid or expired session", 401);
  }
}

module.exports = { requireAuth };