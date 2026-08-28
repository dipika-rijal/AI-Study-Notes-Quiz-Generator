require("dotenv").config({ path: ".env" });
const extractJson = require("./utils/extractJson.js");

function getSourceInstruction(sourceType, numberOfQuestions) { return ""; }
const OPTION_LETTERS = ["A", "B", "C", "D"];
function normalizeLetter(value) {
  const letter = String(value || "").trim().toUpperCase();
  return OPTION_LETTERS.includes(letter) ? letter : "";
}

const prompt = {
    numberOfQuestions: 2,
    difficulty: "easy",
    sourceType: "topic",
    topic: "React hooks",
    messages: [
      {
        role: "system",
        content: `You are StudyGen AI, an educational quiz generator... Return only valid JSON.`
      },
      {
        role: "user",
        content: `Create exactly 2 multiple-choice quiz questions.
Topic: React hooks
Source type: topic
Difficulty: easy

Output strict JSON in this schema:
{
  "questions": [
    {
      "question": "string",
      "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
      "correct_answer": "A",
      "explanation_correct": "string",
      "explanation_wrong": {"A": "string", "B": "string", "C": "string", "D": "string"},
      "core_concept": "string",
      "memory_trick": "string"
    }
  ]
}`
      }
    ]
  };

async function testGroqFull() {
  const apiKey = process.env.GROQ_API_KEY;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: prompt.messages
      })
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    console.log("Raw content:\n", content);
    
    // Test parsing logic
    const parsed = extractJson(content);
    if (!parsed) console.log("Failed to parse JSON!");
    
    console.log("Parsed keys:", Object.keys(parsed));
  } catch (err) {
    console.error(err);
  }
}

testGroqFull();
