/**
 * Validates required environment variables at startup.
 * Accepts VITE_-prefixed fallbacks so a single .env file works for both
 * the backend (Node/Express) and frontend (Vite).
 */
function validateEnv() {
  const required = [
    { name: "MONGODB_URI" },
    { name: "GROQ_API_KEY",        fallback: "VITE_GROQ_API_KEY" },
    { name: "FIREBASE_PROJECT_ID", fallback: "VITE_FIREBASE_PROJECT_ID" }
  ];

  const missing = [];

  for (const variable of required) {
    const primary  = process.env[variable.name];
    const fallback = variable.fallback ? process.env[variable.fallback] : undefined;

    if (!primary && !fallback) {
      missing.push(variable.name);
    }

    // Auto-promote fallback so the rest of the app can use the plain name
    if (!primary && fallback) {
      process.env[variable.name] = fallback;
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    for (const v of missing) {
      console.error("   - " + v + (v !== "MONGODB_URI" ? ` (or VITE_${v})` : ""));
    }
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
}

module.exports = validateEnv;
