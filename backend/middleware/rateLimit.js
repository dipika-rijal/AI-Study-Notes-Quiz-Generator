const { ipKeyGenerator, rateLimit } = require("express-rate-limit");

exports.strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  // Note generation can involve a few related requests (notes, retries, and
  // quizzes). Five requests is too restrictive during ordinary use.
  max: Number(process.env.AI_RATE_LIMIT_MAX) || 20,
  // AI routes run after authentication, so one student's activity should not
  // exhaust the allowance for every user sharing the same network.
  keyGenerator: (req) => req.user?.uid || ipKeyGenerator(req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please wait a minute and try again." },
});

exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests." },
});
