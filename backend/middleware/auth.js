const { initializeApp, getApps, getApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { sendError } = require("../utils/apiResponse.js");

let firebaseReady = false;

function initFirebaseAdmin() {
  if (firebaseReady || getApps().length > 0) {
    firebaseReady = true;
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.warn(
      "⚠️  FIREBASE_PROJECT_ID is not set. Auth middleware will reject all requests."
    );
    return;
  }

  initializeApp({ projectId });
  firebaseReady = true;
  console.log("🔥 Firebase Admin initialised (projectId:", projectId + ")");
}

initFirebaseAdmin();

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return sendError(res, "Authentication required", 401);
    }

    if (!firebaseReady) {
      return sendError(res, "Auth service is not configured on the server", 503);
    }

    // Revocation checks require Firebase service-account credentials. This app
    // is configured with a project ID only, so standard signature/expiry
    // verification keeps authenticated client requests working locally.
    const decoded = await getAuth().verifyIdToken(token);

    if (!decoded.uid || typeof decoded.uid !== "string") {
      return sendError(res, "Invalid token payload", 401);
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || null
    };
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired authentication token", 401);
  }
}

module.exports = { requireAuth };
