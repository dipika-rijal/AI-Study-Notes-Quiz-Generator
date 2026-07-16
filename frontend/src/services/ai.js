import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../config/localGroqKey";

const MODEL = "llama-3.1-8b-instant";
const PLACEHOLDER_GROQ_API_KEY = "PASTE_YOUR_GROQ_API_KEY_HERE";

function getConfiguredGroqApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY || GROQ_API_KEY;
}

function isDevelopment() {
  return import.meta.env.DEV;
}

function logGroqRequest(label, payload) {
  if (!isDevelopment()) return;
  console.info(`[Groq:${label}] request payload`, payload);
}

function logGroqResponse(label, response) {
  if (!isDevelopment()) return;
  console.info(`[Groq:${label}] response`, response);
}

function createGroqError(error) {
  const status = error?.status || error?.response?.status;
  const statusText = error?.statusText || error?.response?.statusText || "";
  const groqMessage = error?.error?.message || error?.message || "Groq request failed.";
  const message = status
    ? `Groq API returned ${status}${statusText ? ` ${statusText}` : ""}.`
    : groqMessage;

  const wrapped = new Error(message);
  wrapped.name = "GroqRequestError";
  wrapped.status = status;
  wrapped.groqMessage = groqMessage;
  wrapped.cause = error;
  return wrapped;
}

function logGroqError(label, payload, error) {
  if (!isDevelopment()) return;
  console.error(`[Groq:${label}] request payload`, payload);
  console.error(`[Groq:${label}] complete error object`, error);
  console.error(`[Groq:${label}] HTTP status`, error?.status || error?.response?.status || "unknown");
  console.error(`[Groq:${label}] response`, error?.response || error?.error || "No response object available");
  console.error(`[Groq:${label}] stack trace`, error?.stack || "No stack trace available");
}

async function createGroqCompletion(label, payload) {
  const groq = getGroqClient();
  logGroqRequest(label, payload);

  try {
    const response = await groq.chat.completions.create(payload);
    logGroqResponse(label, response);
    return response;
  } catch (error) {
    logGroqError(label, payload, error);
    throw createGroqError(error);
  }
}

function getGroqClient() {
  const apiKey = getConfiguredGroqApiKey();

  if (!apiKey || apiKey === PLACEHOLDER_GROQ_API_KEY) {
    throw new Error("Groq API key is missing. Set VITE_GROQ_API_KEY in your frontend environment or update localGroqKey.js.");
  }

  return new Groq({
    apiKey,
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
  const isVideo = inputType.toLowerCase().includes("video");

  const response = await createGroqCompletion("generateNotesWithAI", {
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
  const safeCount = Math.min(Math.max(Number(questionCount) || 5, 1), 20);

  const response = await createGroqCompletion("generateQuizWithAI", {
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

/**
 * Streams a chat completion response from Groq.
 * Yields chunks of text as they arrive.
 * 
 * @param {Array<object>} messages - Message list in the format [{ role, content }].
 * @returns {AsyncGenerator<string>} Async generator yielding text chunks.
 */
export async function* streamAIChatResponse(messages) {
  const payload = {
    model: MODEL,
    messages: messages,
    temperature: 0.4,
    stream: true,
  };
  const responseStream = await createGroqCompletion("streamAIChatResponse", payload);

  for await (const chunk of responseStream) {
    const text = chunk.choices[0]?.delta?.content || "";
    yield text;
  }
}

/**
 * Generates a complete chat completion from Groq (non-streaming).
 * 
 * @param {Array<object>} messages - Message list in the format [{ role, content }].
 * @returns {Promise<string>} Full content string returned by the AI.
 */
export async function generateChatCompletion(messages) {
  const response = await createGroqCompletion("generateChatCompletion", {
    model: MODEL,
    messages: messages,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "";
}

