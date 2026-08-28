require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const { buildQuizPrompt, generateWithRetry, toQuizModelQuestions } = require("./controllers/quizController.js");
const Quiz = require("./models/Quiz.js");

async function testBackend() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const prompt = {
    numberOfQuestions: 5,
    difficulty: "medium",
    sourceType: "topic",
    topic: "React hooks",
    messages: [
      {
        role: "system",
        content: `You are StudyGen AI... Return exactly 2 multiple-choice quiz questions.`
      },
      {
        role: "user",
        content: `Topic: React hooks...`
      }
    ]
  };

  try {
    // Actually require the actual functions, wait, I can't easily export internal functions.
    // Let's just mock req, res
    const { generateQuiz } = require("./controllers/quizController.js");
    
    const req = {
      user: { uid: "test-user-123" },
      body: {
        topic: "React hooks",
        sourceType: "topic",
        content: "",
        numberOfQuestions: 2,
        difficulty: "easy"
      }
    };
    
    const res = {
      status: (code) => {
        console.log("Status:", code);
        return res;
      },
      json: (data) => console.log("JSON:", JSON.stringify(data, null, 2))
    };
    
    const next = (err) => console.error("NEXT ERROR:", err);
    
    console.log("Calling generateQuiz...");
    await generateQuiz(req, res, next);
    
  } catch (err) {
    console.error("Caught error:", err);
  } finally {
    mongoose.disconnect();
  }
}

testBackend();
