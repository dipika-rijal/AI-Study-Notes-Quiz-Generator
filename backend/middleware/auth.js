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

// Accepts either a session cookie (desktop) or a Bearer ID token (iOS/Safari,
// where cross-site cookies are blocked), so protected routes work on both.
async function requireAuth(req, res, next) {
  try {
    if (!firebaseReady) {
      return sendError(res, "Auth service is not configured on the server", 503);
    }

    const sessionCookie = req.cookies?.session;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    let decoded;

    if (sessionCookie) {
      decoded = await getAuth().verifySessionCookie(sessionCookie, true); // true = check revocation
    } else if (bearerToken) {
      decoded = await getAuth().verifyIdToken(bearerToken);
    } else {
      return sendError(res, "Authentication required", 401);
    }

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