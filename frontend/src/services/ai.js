import api from "../api/axios";
import { auth } from "../config/firebase";

const MODEL = "qwen/qwen3.8-27b";

function cleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function parseJson(content) {
  if (!content) throw new Error("AI returned empty response.");
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI did not return valid JSON.");
    return JSON.parse(content.slice(start, end + 1));
  }
}

function cleanArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateNotesWithAI(input, inputType, learningProfile = null) {
  const isVideo = inputType.toLowerCase().includes("video");
  
  let profileContext = "";
  if (learningProfile && learningProfile.weaknesses && learningProfile.weaknesses.length > 0) {
    profileContext = `The student has weaknesses in the following areas: ${learningProfile.weaknesses.join(", ")}. Please preemptively address these if they are relevant to the topic.`;
  }

  const response = await api.post("/ai/chat/complete", {
    model: MODEL,
    temperature: 0.35,
    max_completion_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are StudyGen AI, an expert, encouraging university professor. Return only valid JSON. No markdown outside of the JSON. No code block wrappers.",
      },
      {
        role: "user",
        content: `
Create an expert, structured study guide that takes the student from absolute beginner to advanced understanding.
Speak in a patient, encouraging, and clear tone.

Input type: ${inputType}
Student input:
${input}
${profileContext}

Return only JSON in this EXACT shape:
{
  "title": "short clear title",
  "summary": "simple summary paragraph",
  "level1_beginner": {
    "simpleDefinition": "Explain like the student has never heard about this. Define basic words first.",
    "realLifeExample": "A simple example from daily life."
  },
  "level2_foundation": {
    "coreConcept": "Explain the core concept, why it exists, and how it works step-by-step."
  },
  "level3_technical": {
    "technicalUnderstanding": "Introduce proper terminology, formulas, algorithms, or architecture. Explain each part clearly."
  },
  "level4_advanced": {
    "advancedApplications": "Explain deeper concepts and real-world applications.",
    "commonMistakes": "Common mistakes and how to avoid them."
  },
  "level5_expert": {
    "expertThinking": "How professionals think about this. Connect with related concepts.",
    "interviewExamPerspective": "Crucial points for exams or interviews."
  },
  "rememberThis": "One final, memorable sentence to summarize everything.",
  "practiceQuestion": "A short practice question to test understanding."
}

Rules:
- If input type is Topic, explain the topic directly.
- If input type is Upload / Paste, summarize the pasted/uploaded content in this structure.
- If input type is Video Link, use the video link plus any title/topic/description provided. If you can't access it, create general notes on the topic.
- Return ONLY JSON.
${isVideo ? "Important: For video link mode, focus on the video title/topic/details supplied by the user. Do not claim to access full transcript." : ""}
        `,
      },
    ],
  });

  const content = response.data?.choices?.[0]?.message?.content;
  const data = parseJson(content);

  const title = cleanText(data.title, "Generated Notes");
  const summary = cleanText(data.summary, "No summary generated.");

  return {
    title,
    summary,
    level1_beginner: data.level1_beginner || {},
    level2_foundation: data.level2_foundation || {},
    level3_technical: data.level3_technical || {},
    level4_advanced: data.level4_advanced || {},
    level5_expert: data.level5_expert || {},
    rememberThis: cleanText(data.rememberThis, "Revise carefully."),
    practiceQuestion: cleanText(data.practiceQuestion, "")
  };
}

export async function generateQuizWithAI(input, inputType, questionCount) {
  const safeCount = Math.min(Math.max(Number(questionCount) || 5, 1), 20);

  const response = await api.post("/ai/chat/complete", {
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

  const content = response.data?.choices?.[0]?.message?.content;
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
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please sign in before using the AI study assistant.");
  }
  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}/ai/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || `AI stream request failed: ${response.status}`);
    error.status = response.status;
    error.retryAfter = response.headers.get("retry-after") || response.headers.get("ratelimit-reset");
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line for next chunk

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.slice(6);
        if (dataStr.trim() === "[DONE]") continue;
        try {
          const json = JSON.parse(dataStr);
          const text = json.choices[0]?.delta?.content || "";
          if (text) yield text;
        } catch (e) {}
      }
    }
  }
}

export async function generateChatCompletion(messages) {
  const response = await api.post("/ai/chat/complete", {
    model: MODEL,
    messages: messages,
    temperature: 0.3,
  });

  return response.data?.choices?.[0]?.message?.content || "";
}

