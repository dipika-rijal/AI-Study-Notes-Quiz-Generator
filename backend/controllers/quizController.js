const Quiz = require("../models/Quiz.js");
const QuizAttempt = require("../models/QuizAttempt.js");

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const OPTION_LETTERS = ["A", "B", "C", "D"];

function getGroqApiKey() {
  return process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
}

function normalizeLetter(value) {
  const letter = String(value || "").trim().toUpperCase();
  return OPTION_LETTERS.includes(letter) ? letter : "";
}

function parseJsonFromText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("AI returned an empty quiz response.");
  }

  try {
    return JSON.parse(text);
  } catch {
    const objectStart = text.indexOf("{");
    const arrayStart = text.indexOf("[");
    const starts = [objectStart, arrayStart].filter(function (index) {
      return index >= 0;
    });
    const start = starts.length ? Math.min.apply(null, starts) : -1;
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));

    if (start < 0 || end <= start) {
      throw new Error("Failed to parse AI quiz response.");
    }

    return JSON.parse(text.slice(start, end + 1));
  }
}

function normalizeSourceType(value) {
  const sourceType = String(value || "topic").toLowerCase();
  return ["topic", "pdf", "notes"].includes(sourceType) ? sourceType : "topic";
}

function normalizeDifficulty(value) {
  const difficulty = String(value || "medium").toLowerCase();
  return ["easy", "medium", "hard", "mixed"].includes(difficulty)
    ? difficulty
    : "medium";
}

function normalizeQuestionCount(value) {
  const count = Number(value) || 5;
  return Math.min(Math.max(count, 5), 20);
}

function getSourceInstruction(sourceType, numberOfQuestions) {
  if (sourceType === "pdf") {
    return `- Base every question ONLY on the extracted document text.
- Do not invent facts that are not present in the document.
- If the document text cannot honestly support ${numberOfQuestions} distinct questions, generate only the high-quality questions it supports.`;
  }

  if (sourceType === "notes") {
    return `- Base every question ONLY on the provided notes or study content.
- Do not introduce outside facts unless they are directly needed to explain a concept already present in the notes.`;
  }

  return `- Base questions on reliable knowledge of the requested topic.
- Do not hallucinate niche facts; prefer broadly accepted concepts and practical understanding.`;
}

function normalizeGeneratedQuestions(rawQuestions, requestedCount) {
  if (!Array.isArray(rawQuestions)) {
    throw new Error("AI response did not include a questions array.");
  }

  const questions = rawQuestions
    .map(function (item) {
      let optionsArray = [];
      if (item.options && !Array.isArray(item.options) && typeof item.options === 'object') {
        optionsArray = [
          String(item.options.A || "").trim(),
          String(item.options.B || "").trim(),
          String(item.options.C || "").trim(),
          String(item.options.D || "").trim()
        ];
      } else if (Array.isArray(item.options)) {
        optionsArray = item.options
          .map(function (option) {
            return String(option || "").trim();
          })
          .slice(0, 4);
      }

      const options = optionsArray.filter(Boolean);

      if (options.length !== 4) return null;

      let correctAnswer = normalizeLetter(item.correct_answer || item.correctAnswer || item.answer);
      if (!correctAnswer && Array.isArray(item.options) && item.options.includes(item.correctAnswer)) {
        correctAnswer = OPTION_LETTERS[item.options.indexOf(item.correctAnswer)];
      }
      if (!correctAnswer) correctAnswer = "A";

      const explanationCorrect = String(
        item.explanation_correct || 
        (item.explanation && item.explanation.correct) || 
        "This option best matches the provided quiz source."
      ).trim();

      const wrong = item.explanation_wrong || (item.explanation && item.explanation.wrong) || {};

      return {
        question: String(item.question || "").trim(),
        options: options,
        correctAnswer: correctAnswer,
        explanation: {
          correct: explanationCorrect,
          wrong: {
            A: String(wrong.A || "").trim(),
            B: String(wrong.B || "").trim(),
            C: String(wrong.C || "").trim(),
            D: String(wrong.D || "").trim()
          }
        }
      };
    })
    .filter(function (item) {
      return item && item.question && item.options.length === 4;
    });

  if (!questions.length) {
    throw new Error("AI did not return valid quiz questions.");
  }

  return questions.slice(0, requestedCount);
}

function toQuizModelQuestions(questions) {
  return questions.map(function (question) {
    return {
      question: question.question,
      questionText: question.question,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      options: question.options.map(function (optionText, index) {
        const letter = OPTION_LETTERS[index];
        const isCorrect = letter === question.correctAnswer;

        return {
          text: optionText,
          isCorrect: isCorrect,
          explanation: isCorrect
            ? question.explanation.correct
            : question.explanation.wrong[letter] ||
              "This option is not correct based on the quiz source."
        };
      })
    };
  });
}

function toApiQuestion(question) {
  const correctIndex = question.options.findIndex(function (option) {
    return option.isCorrect;
  });
  const correctLetter = OPTION_LETTERS[correctIndex >= 0 ? correctIndex : 0];

  return {
    question: question.question || question.questionText,
    options: question.options.map(function (option) {
      return option.text;
    }),
    correctAnswer: question.correctAnswer || correctLetter,
    explanation: {
      correct:
        question.explanation?.correct ||
        question.options[correctIndex]?.explanation ||
        "This is the correct answer.",
      wrong: {
        A: question.explanation?.wrong?.A || question.options[0]?.explanation || "",
        B: question.explanation?.wrong?.B || question.options[1]?.explanation || "",
        C: question.explanation?.wrong?.C || question.options[2]?.explanation || "",
        D: question.explanation?.wrong?.D || question.options[3]?.explanation || ""
      }
    }
  };
}

function buildQuizPrompt(payload) {
  const numberOfQuestions = normalizeQuestionCount(payload.numberOfQuestions);
  const difficulty = normalizeDifficulty(payload.difficulty);
  const sourceType = normalizeSourceType(payload.sourceType);
  const topic = String(payload.topic || "").trim() || "Study quiz";
  const content = String(payload.content || "").trim();

  return {
    numberOfQuestions,
    difficulty,
    sourceType,
    topic,
    messages: [
      {
        role: "system",
        content: `You are StudyGen AI, an educational quiz generator.

Rules:
${getSourceInstruction(sourceType, numberOfQuestions)}
- Return exactly ${numberOfQuestions} questions unless the source content cannot support that many.
- Mix conceptual and practical/scenario questions.
- Difficulty must materially affect complexity:
  easy = recall or definition level
  medium = applied understanding
  hard = edge cases, tradeoffs, or multi-step reasoning
  mixed = a balanced spread
- Return only valid JSON. No markdown. No extra text.`
      },
      {
        role: "user",
        content: `Create exactly ${numberOfQuestions} multiple-choice quiz questions.

Topic: ${topic}
Source type: ${sourceType}
Difficulty: ${difficulty}
Content:
${(content || topic).slice(0, 12000)}

For EACH question, follow this exact internal process before finalizing:
1. Write the question.
2. Write 4 answer options (A-D), only one of which is factually correct.
3. Identify which letter is correct.
4. VERIFY: Re-read the correct option's text on its own — does it, standing alone, accurately and completely answer the question? If not, rewrite the option or change which letter is marked correct until it does.
5. Write a one-sentence justification for the correct answer that directly supports the exact wording of that option (not a different, better phrasing).
6. Write one short reason each option is wrong — for the "correct" slot, this step should be empty/skipped.

Output strict JSON in this schema:
{
  "questions": [
    {
      "question": "string",
      "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation_correct": "string, must justify the exact text of the correct_answer option",
      "explanation_wrong": {"A": "string", "B": "string", "C": "string", "D": "string"}
    }
  ]
}

Rules:
- Never let explanation_correct contradict the wording of the option marked correct_answer.
- Double-check factual accuracy against well-established knowledge before finalizing.
- If your explanation reasoning points to a different option than the one marked correct_answer, fix correct_answer to match the reasoning, not the other way around.
- Omit the key matching correct_answer from explanation_wrong.`
      }
    ]
  };
}

function buildRetryQuizPrompt(payload) {
  const difficulty = normalizeDifficulty(payload.difficulty);
  const topic = String(payload.topic || "").trim() || "Study quiz";
  const missedQuestions = Array.isArray(payload.missedQuestions)
    ? payload.missedQuestions.slice(0, 20)
    : [];
  const numberOfQuestions = normalizeQuestionCount(
    payload.numberOfQuestions || missedQuestions.length || 5
  );

  const missedSummary = missedQuestions
    .map(function (item, index) {
      return `${index + 1}. Original question: ${String(item.question || item.questionText || "").trim()}
Correct idea: ${String(item.explanationCorrect || item.correctOptionExplanation || item.correctAnswer || "").trim()}
User picked: ${String(item.selectedAnswer || item.selectedOptionText || "unknown").trim()}`;
    })
    .join("\n\n");

  return {
    numberOfQuestions,
    difficulty,
    sourceType: "topic",
    topic,
    messages: [
      {
        role: "system",
        content: `You are StudyGen AI. The user missed previous quiz questions. Generate NEW practice questions that test the same underlying concepts at the same difficulty.

Strict rules:
- Do not reuse the same question wording, phrasing, examples, scenarios, or answer options.
- Cover the same concepts and difficulty level, but from a different angle.
- Return only valid JSON. No markdown. No extra text.`
      },
      {
        role: "user",
        content: `Topic: ${topic}
Difficulty: ${difficulty}

Missed concepts/questions:
${missedSummary || "No missed questions were supplied. Create fresh practice questions for the topic."}

Generate exactly ${numberOfQuestions} new multiple-choice questions.

For EACH question, follow this exact internal process before finalizing:
1. Write the question.
2. Write 4 answer options (A-D), only one of which is factually correct.
3. Identify which letter is correct.
4. VERIFY: Re-read the correct option's text on its own — does it, standing alone, accurately and completely answer the question? If not, rewrite the option or change which letter is marked correct until it does.
5. Write a one-sentence justification for the correct answer that directly supports the exact wording of that option.
6. Write one short reason each option is wrong — for the "correct" slot, this step should be empty/skipped.

Return JSON in this exact shape:
{
  "questions": [
    {
      "question": "string",
      "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation_correct": "string, must justify the exact text of the correct_answer option",
      "explanation_wrong": {"A": "string", "B": "string", "C": "string", "D": "string"}
    }
  ]
}

Rules:
- Never let explanation_correct contradict the wording of the option marked correct_answer.
- Omit the key matching correct_answer from explanation_wrong.`
      }
    ]
  };
}

async function callGroqForQuiz(messages) {
  const apiKey = getGroqApiKey();

  if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
    throw new Error("Groq API key is missing on the backend.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: messages
    })
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error("Groq API returned " + response.status + ". " + body.slice(0, 300));
  }

  const data = JSON.parse(body);
  return data.choices?.[0]?.message?.content || "";
}

async function getQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json({ success: true, total: quizzes.length, quizzes: quizzes });
  } catch (error) {
    next(error);
  }
}

async function getQuizById(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, quiz: quiz });
  } catch (error) {
    console.error("Error in getQuizById:", error);
    if (error.name === "CastError") {
      return res.status(500).json({ 
        success: false, 
        message: "This quiz could not be loaded — it may be an older format." 
      });
    }
    next(error);
  }
}

async function createQuiz(req, res, next) {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, message: "Quiz created", quiz: quiz });
  } catch (error) {
    next(error);
  }
}

async function generateWithRetry(prompt) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const aiContent = await callGroqForQuiz(prompt.messages);
      const parsed = parseJsonFromText(aiContent);
      const generatedQuestions = normalizeGeneratedQuestions(
        parsed.questions,
        prompt.numberOfQuestions
      );
      
      for (const q of generatedQuestions) {
        if (!q.correctAnswer || !OPTION_LETTERS.includes(q.correctAnswer)) {
          throw new Error("Invalid correct_answer format");
        }
      }
      return generatedQuestions;
    } catch (error) {
      lastError = error;
      console.warn(`Quiz generation attempt ${attempt} failed:`, error.message);
    }
  }
  throw lastError;
}

async function generateQuiz(req, res, next) {
  try {
    const prompt = buildQuizPrompt(req.body || {});
    const generatedQuestions = await generateWithRetry(prompt);

    const quiz = await Quiz.create({
      userId: req.body.userId || "anonymous",
      topic: prompt.topic,
      content: String(req.body.content || "").slice(0, 12000),
      sourceType: prompt.sourceType,
      difficulty: prompt.difficulty,
      totalQuestions: generatedQuestions.length,
      score: 0,
      questions: toQuizModelQuestions(generatedQuestions)
    });

    res.status(201).json({
      success: true,
      quizId: String(quiz._id),
      questions: quiz.questions.map(toApiQuestion)
    });
  } catch (error) {
    next(error);
  }
}

async function retryQuiz(req, res, next) {
  try {
    const prompt = buildRetryQuizPrompt(req.body || {});
    const generatedQuestions = await generateWithRetry(prompt);

    const quiz = await Quiz.create({
      userId: req.body.userId || "anonymous",
      topic: prompt.topic,
      content: "Retry incorrect questions",
      sourceType: "topic",
      difficulty: prompt.difficulty,
      totalQuestions: generatedQuestions.length,
      score: 0,
      questions: toQuizModelQuestions(generatedQuestions)
    });

    res.status(201).json({
      success: true,
      quizId: String(quiz._id),
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      sourceType: quiz.sourceType,
      questions: quiz.questions.map(toApiQuestion)
    });
  } catch (error) {
    next(error);
  }
}

async function checkAnswer(req, res, next) {
  try {
    const quizId = req.body.quizId;
    const questionIndex = Number(req.body.questionIndex);
    const selectedAnswer = normalizeLetter(req.body.selectedAnswer);

    if (!quizId || Number.isNaN(questionIndex) || !selectedAnswer) {
      return res.status(400).json({
        success: false,
        message: "quizId, questionIndex, and selectedAnswer are required"
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz || !quiz.questions[questionIndex]) {
      return res.status(404).json({ success: false, message: "Quiz question not found" });
    }

    const apiQuestion = toApiQuestion(quiz.questions[questionIndex]);
    const correct = selectedAnswer === apiQuestion.correctAnswer;

    res.json({
      success: true,
      correct: correct,
      correctAnswer: apiQuestion.correctAnswer,
      explanation: apiQuestion.explanation,
      nextQuestion: questionIndex < quiz.questions.length - 1
    });
  } catch (error) {
    next(error);
  }
}

async function updateQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, message: "Quiz updated", quiz: quiz });
  } catch (error) {
    next(error);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    await QuizAttempt.deleteMany({ quizId: req.params.id });

    res.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  generateQuiz,
  retryQuiz,
  checkAnswer,
  updateQuiz,
  deleteQuiz
};
