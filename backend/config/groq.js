const DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b";
const RETIRED_GROQ_MODELS = new Set([
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
]);

const configuredGroqModel = process.env.GROQ_MODEL;
const GROQ_MODEL = RETIRED_GROQ_MODELS.has(configuredGroqModel)
  ? DEFAULT_GROQ_MODEL
  : configuredGroqModel || DEFAULT_GROQ_MODEL;

if (configuredGroqModel && RETIRED_GROQ_MODELS.has(configuredGroqModel)) {
  console.warn(
    `GROQ_MODEL ${configuredGroqModel} is retired; using ${DEFAULT_GROQ_MODEL} instead.`
  );
}

module.exports = { GROQ_MODEL };
