const admin = require("firebase-admin");
const { sendError } = require("../utils/apiResponse.js");

let firebaseReady = false;

function initFirebaseAdmin() {
  if (firebaseReady || admin.apps.length) {
    firebaseReady = true;
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.warn(
      "FIREBASE_PROJECT_ID is not set. Auth middleware will reject requests."
    );
    return;
  }

  admin.initializeApp({ projectId });
  firebaseReady = true;
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

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null
    };
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired authentication token", 401);
  }
}

module.exports = {
  requireAuth
};
