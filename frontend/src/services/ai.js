import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../config/localGroqKey";

const MODEL = "llama-3.1-8b-instant";

function getGroqClient() {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key is missing from localGroqKey.js");
  }

  return new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });
}

function parseJson(content) {
  if (!content) {
    throw new Error("AI returned empty response.");
  }

  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("AI did not return valid JSON.");
    }

    return JSON.parse(content.slice(start, end + 1));
  }
}

function cleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function cleanArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateNotesWithAI(input, inputType) {
  const groq = getGroqClient();

  const isVideo = inputType.toLowerCase().includes("video");

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.35,
    max_completion_tokens: 900,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are StudyGen AI, a helpful study assistant. Return only valid JSON. No markdown. No code block.",
      },
      {
        role: "user",
        content: `
Create beginner-friendly study notes.

Input type: ${inputType}
Student input:
${input}

Return only JSON in this exact shape:
{
  "title": "short clear title",
  "summary": "simple summary paragraph",
  "points": ["point 1", "point 2", "point 3", "point 4"],
  "revisionLine": "one final revision sentence"
}

Rules:
- Make the notes simple, clear, and useful for revision.
- If input type is Topic, explain the topic directly.
- If input type is Upload / Paste, summarize the pasted/uploaded content.
- If input type is Video Link, use the video link plus any title/topic/description provided by the user.
- If only a raw video link is provided and no title/topic is clear, do not pretend you watched the video. Create general notes from available text and mention that transcript extraction is not added yet.
- Return only JSON.
${isVideo ? "Important: For video link mode, focus on the video title/topic/details supplied by the user. Do not claim to access full transcript." : ""}
        `,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  const data = parseJson(content);

  const title = cleanText(data.title, "Generated Notes");
  const summary = cleanText(data.summary, "No summary generated.");
  const points = cleanArray(data.points);
  const revisionLine = cleanText(
    data.revisionLine,
    "Revise the summary and key points carefully."
  );

  if (!points.length) {
    throw new Error("AI did not return valid key points.");
  }

  return {
    title,
    summary,
    points,
    revisionLine,
  };
}

export async function generateQuizWithAI(input, inputType, questionCount) {
  const groq = getGroqClient();

  const safeCount = Math.min(Math.max(Number(questionCount) || 5, 1), 20);

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_completion_tokens: 1800,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are StudyGen AI, a quiz generator. Return only valid JSON. No markdown. No code block.",
      },
      {
        role: "user",
        content: `
Create exactly ${safeCount} multiple-choice quiz questions.

Input type: ${inputType}
Student input:
${input}

Return only JSON in this exact shape:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "answer": "exact correct option text"
    }
  ]
}

Rules:
- Create exactly ${safeCount} questions.
- Each question must have exactly 4 options.
- The answer must exactly match one of the options.
- Questions should be beginner-friendly but meaningful.
- Do not include video-link based questions.
- Return only JSON.
        `,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  const data = parseJson(content);

  if (!Array.isArray(data.questions)) {
    throw new Error("AI response did not include questions.");
  }

  const questions = data.questions
    .map((item) => {
      const question = cleanText(item.question);
      const options = cleanArray(item.options).slice(0, 4);
      let answer = cleanText(item.answer);

      if (options.length === 4 && !options.includes(answer)) {
        answer = options[0];
      }

      return {
        question,
        options,
        answer,
      };
    })
    .filter(
      (item) =>
        item.question &&
        item.options.length === 4 &&
        item.answer &&
        item.options.includes(item.answer)
    );

  if (!questions.length) {
    throw new Error("AI did not return valid quiz questions.");
  }

  return questions.slice(0, safeCount);
}
