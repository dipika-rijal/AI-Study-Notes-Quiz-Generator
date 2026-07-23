function validateEnv() {
  const required = [
    "MONGODB_URI",
    "GROQ_API_KEY",
    "FIREBASE_PROJECT_ID"
  ];
  
  const missing = [];
  
  for (const variable of required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    for (const v of missing) {
      console.error("- " + v);
    }
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
}

module.exports = validateEnv;
