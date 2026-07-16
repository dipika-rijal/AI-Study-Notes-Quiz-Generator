import { useState, useCallback, useRef, useEffect } from "react";
import { streamAIChatResponse, generateChatCompletion } from "../services/ai";
import { getConversation, saveConversation } from "../api/conversationApi";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/api\/?$/, "");

const OPTION_LETTERS = ["A", "B", "C", "D"];

const INITIAL_ACTION_OPTIONS = [
  { value: "intent:topic", label: "📚 Generate Notes", icon: "📚" },
  { value: "intent:upload", label: "📄 Summarize PDF", icon: "📄" },
  { value: "intent:pasteText", label: "📋 Turn pasted text into notes", icon: "📋" },
  { value: "intent:explain", label: "🧠 Explain a topic", icon: "🧠" }
];

const INITIAL_MESSAGE = {
  id: "greeting",
  role: "assistant",
  content: `👋 Hi! I'm your AI Study Assistant.

I can help you:
📚 **Generate Notes**
📄 **Summarize PDFs**
📋 **Turn pasted text into notes**
🧠 **Explain difficult topics**

What would you like to study today?`,
  type: "options",
  options: INITIAL_ACTION_OPTIONS,
  timestamp: new Date()
};

const INTENT_PROMPTS = {
  topic: "What topic would you like notes on?",
  pasteText: "Please paste the text you'd like me to convert into notes.",
  upload: "Upload your PDF and I'll help summarize it, generate notes, quizzes, or flashcards.",
  explain: "What topic would you like me to explain?",
  topic_quiz_setup: "What topic would you like the quiz to cover?"
};

const NOTE_PURPOSE_OPTIONS = [
  { value: "learn", label: "Learn", icon: "📘" },
  { value: "exam", label: "Revise for exam", icon: "🎓" },
  { value: "interview", label: "Interview preparation", icon: "💼" },
  { value: "quick", label: "Quick summary", icon: "⚡" }
];

const FOLLOW_UP_ACTION_OPTIONS = [
  { value: "followup:ask", label: "Ask questions", icon: "?" },
  { value: "followup:quiz", label: "Generate quiz", icon: "Q" },
  { value: "followup:flashcards", label: "Generate flashcards", icon: "F" },
  { value: "followup:save", label: "Save to history", icon: "S" }
];

const NOTE_PURPOSE_CONFIG = {
  learn: {
    label: "Learn",
    style: "beginner",
    instruction: "Use simple language, explain concepts step by step, and make the notes friendly for a learner seeing the topic for the first time."
  },
  exam: {
    label: "Revise for exam",
    style: "exam",
    instruction: "Use structured revision notes, crisp definitions, important points, likely exam traps, and memorable summaries."
  },
  interview: {
    label: "Interview preparation",
    style: "detailed",
    instruction: "Emphasize practical understanding, common interview angles, tradeoffs, and concise answers a candidate can speak aloud."
  },
  quick: {
    label: "Quick summary",
    style: "quick",
    instruction: "Keep the notes short and high signal. Prioritize the core idea, syntax, and the most important mistakes."
  }
};

function isDevelopment() {
  return import.meta.env.DEV;
}

function getDevelopmentErrorMessage(error, fallback) {
  if (!isDevelopment()) return fallback;
  if (error?.message) return error.message;
  return fallback;
}

function logDevelopmentError(label, error, context = {}) {
  if (!isDevelopment()) return;
  console.error(`[Conversation:${label}] context`, context);
  console.error(`[Conversation:${label}] complete error object`, error);
  console.error(`[Conversation:${label}] stack trace`, error?.stack || "No stack trace available");
}

function detectInitialIntent(text) {
  const normalized = text.trim().toLowerCase();

  // Smart Quiz parsing
  if (/\b(quiz|quizzes|question|questions|test|practice)\b/.test(normalized)) {
    let count = 5;
    let difficulty = "medium";
    
    const countMatch = normalized.match(/(\d+|one|single)\s*(?:hard|medium|easy|mixed)?\s*(?:questions?|quiz(?:zes)?|practice|test)?/);
    if (countMatch) {
      const numStr = countMatch[1];
      if (numStr === "one" || numStr === "single") count = 1;
      else count = parseInt(numStr, 10);
    }
    
    if (normalized.includes("easy")) difficulty = "easy";
    else if (normalized.includes("hard")) difficulty = "hard";
    else if (normalized.includes("mixed")) difficulty = "mixed";
    else if (normalized.includes("medium")) difficulty = "medium";
    
    let rawTopic = normalized
      .replace(/\b(generate|create|make|give|start|new|another|next|retry|quiz|quizzes|questions?|test|practice|me|on|about|difficulty|level|for|please|again|but|this|these|the|same)\b/g, " ")
      .replace(/\b(\d+|one|single|easy|medium|hard|mixed|a|an|the|some|any)\b/g, " ")
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
      
    if (rawTopic.length > 0) {
      const topic = rawTopic.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      return { intent: "direct_quiz", params: { count, difficulty, topic } };
    } else {
      return { intent: "topic_quiz_setup" };
    }
  }

  if (["generate notes", "notes", "make notes", "create notes"].includes(normalized)) {
    return { intent: "topic" };
  }
  if (["turn pasted text into notes", "paste text", "pasted text", "paste"].includes(normalized)) {
    return { intent: "pasteText" };
  }
  if (["summarize pdf", "upload pdf", "pdf", "upload"].includes(normalized)) {
    return { intent: "upload" };
  }
  if (["explain a topic", "explain topic", "explain"].includes(normalized)) {
    return { intent: "explain" };
  }

  return { intent: "" };
}

function buildTopicNotesPrompt(topic, purpose) {
  const purposeConfig = NOTE_PURPOSE_CONFIG[purpose] || NOTE_PURPOSE_CONFIG.learn;

  return [
    {
      role: "system",
      content: `You are an AI study assistant.

Generate notes about the given topic.

Use these clean section headings in this order:
- Definition
- Simple Explanation
- Syntax
- How It Works
- Key Concepts
- Practical Examples
- Common Mistakes
- Interview Questions
- Exam Summary

Rules:
- Do not use markdown code blocks unless showing actual code.
- Do not use backticks for normal technical words.
- Do not write "CODE", "Copy", or any UI labels.
- Use normal text for concepts like useState, state, props, and hooks.
- Only wrap complete programming examples in triple backticks.
- Keep headings clean.
- Use bullet points instead of excessive numbering.
- Explain concepts before examples.
- Adjust depth based on the selected style:
  quick = short summary
  beginner = simple explanation
  exam = structured revision notes
  detailed = deep explanation

Selected purpose: ${purposeConfig.label}
Selected style: ${purposeConfig.style}
Depth guidance: ${purposeConfig.instruction}`
    },
    { role: "user", content: `Topic: ${topic}` }
  ];
}

function buildDocumentPrompt(action, fileName, content) {
  const baseInstructions = `You are an AI Study Assistant specialized in processing educational documents.

Your task is to analyze uploaded PDFs and help students learn from them.

Document Analysis:
- First determine whether the provided PDF text contains usable extracted content.
- If text is available, use it directly.
- If the PDF appears scanned, image-based, or has missing text, clearly say OCR/text extraction is required.
- Do not assume the document is empty just because extraction failed.
- Do not invent content.

Formatting Rules:
- Use clean Markdown.
- Use headings and bullet points.
- Do not use "CODE", "Copy", or UI-related words.
- Do not wrap normal technical terms in code blocks.
- Only use code blocks for actual programming code.
- Keep output readable for students.

Accuracy Rules:
- Never hallucinate missing PDF content.
- If information is unavailable, clearly say so.
- Base answers only on extracted document content.
- Preserve important technical terms.`;

  const actionInstructions = {
    summarize: `For Summarization, generate a structured summary with:

Title:
- Extract the document title if available.
- If unavailable, create a suitable title based only on the extracted content.

Overview:
- Give a short explanation of the main topic.

Key Concepts:
- List important concepts with clear explanations.

Important Details:
- Include definitions, formulas, examples, diagrams explained in words, and important points that appear in the extracted text.

Exam Focus:
- Highlight concepts likely to appear in exams.

Quick Revision:
- Provide a concise revision section at the end.`,
    notes: `For Note Generation, create student-friendly notes with:

- Topic introduction
- Definitions
- Detailed explanations
- Important points
- Examples
- Common mistakes
- Exam tips
- Summary`,
    explain: `For Difficult Part Explanation:

- Identify complex sections from the extracted content.
- Explain them using simple language.
- Use analogies where helpful.
- Provide examples only when supported by the extracted content.`
  };

  return [
    {
      role: "system",
      content: `${baseInstructions}

${actionInstructions[action] || actionInstructions.notes}`
    },
    {
      role: "user",
      content: `Document name: ${fileName}

Extracted PDF text:
${content.slice(0, 8000)}`
    }
  ];
}

function hasExtractableDocumentText(uploadedFile) {
  return Boolean(uploadedFile?.text && uploadedFile.text.trim().length > 0);
}

function normalizeQuizResult(result, fallback = {}) {
  const questions = Array.isArray(result.questions) ? result.questions : [];

  return {
    quizId: result.quizId || "",
    topic: result.topic || fallback.topic || "Study quiz",
    difficulty: result.difficulty || fallback.difficulty || "medium",
    sourceType: result.sourceType || fallback.sourceType || "topic",
    questions: questions.map((question, index) => ({
      id: question.id || question._id || `${result.quizId || "quiz"}-${index}`,
      question: question.question || question.questionText || `Question ${index + 1}`,
      options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
      correctAnswer: question.correctAnswer || question.answer || "A",
      explanation:
        typeof question.explanation === "object"
          ? question.explanation
          : {
              correct: question.explanation || "This is the correct answer.",
              wrong: {}
            }
    }))
  };
}

function createEmptyQuizState() {
  return {
    selectedAnswers: {},
    currentQuestionIndex: 0,
    submitted: false,
    openedExplanations: {},
    attemptId: null,
    score: null,
    feedback: null
  };
}

function getLatestQuizMessage(messages) {
  return [...messages].reverse().find((message) => message.type === "quiz");
}

function getQuizQuestions(message) {
  const data = message?.data;
  return Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
}

function selectedLetterFor(question, answerRecord) {
  const selected = answerRecord?.selectedAnswer ?? answerRecord;
  if (OPTION_LETTERS.includes(selected)) return selected;
  const options = Array.isArray(question?.options) ? question.options : [];
  const selectedIndex = options.indexOf(selected);
  return selectedIndex >= 0 ? OPTION_LETTERS[selectedIndex] : "";
}

function getMissedQuestionsFromMessage(message) {
  const questions = getQuizQuestions(message);
  const selectedAnswers = message?.quizState?.selectedAnswers || message?.quizState || {};

  return questions
    .map((question, index) => {
      const selectedAnswer = selectedLetterFor(question, selectedAnswers[index]);
      const correctAnswer = question.correctAnswer || question.answer || "A";
      return {
        index,
        question: question.question || question.questionText || `Question ${index + 1}`,
        selectedAnswer,
        correctAnswer,
        explanationCorrect:
          question.explanation?.correct ||
          (typeof question.explanation === "string" ? question.explanation : "")
      };
    })
    .filter((item) => item.selectedAnswer && item.selectedAnswer !== item.correctAnswer);
}

function summarizeQuizForContext(message) {
  const questions = getQuizQuestions(message);
  const quizState = message?.quizState || {};
  const selectedAnswers = quizState.selectedAnswers || quizState || {};
  const missed = getMissedQuestionsFromMessage(message)
    .slice(0, 6)
    .map((item) => `Q${item.index + 1}: "${item.question}" - user picked ${item.selectedAnswer}, correct answer is ${item.correctAnswer}.`);

  return `Quiz summary:
Topic: ${message?.data?.topic || message?.topic || "unknown"}
Difficulty: ${message?.data?.difficulty || "medium"}
Questions: ${questions.length}
Answered: ${Object.keys(selectedAnswers).length}/${questions.length}
Submitted: ${Boolean(quizState.submitted)}
Score: ${quizState.score === null || quizState.score === undefined ? "not submitted" : `${quizState.score}/${questions.length}`}
Missed questions:
${missed.length ? missed.join("\n") : "None recorded."}`;
}

function getRelevantSessionContent(messages) {
  const latestNotes = [...messages].reverse().find((message) => message.type === "notes");
  const latestQuiz = getLatestQuizMessage(messages);

  if (latestNotes?.content) {
    return {
      topic: latestNotes.title || "Study quiz",
      sourceType: "notes",
      content: latestNotes.content
    };
  }

  if (latestQuiz) {
    return {
      topic: latestQuiz.data?.topic || "Study quiz",
      sourceType: "topic",
      content: summarizeQuizForContext(latestQuiz)
    };
  }

  const recentText = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-5)
    .map((message) => message.content)
    .filter(Boolean)
    .join("\n\n");

  return {
    topic: "Study quiz",
    sourceType: "notes",
    content: recentText
  };
}

/**
 * Custom hook to manage the conversational AI state machine and session flow.
 * 
 * @param {object} options
 * @param {string|null} options.conversationId - Optional conversation ID from URL params.
 * @param {string|null} options.savedNoteId - Optional saved note ID from URL params.
 * @param {function} options.loadSavedNoteById - Callback to load saved notes from history.
 */
export function useConversationFlow({ conversationId: propConversationId, savedNoteId, loadSavedNoteById }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [conversationId, setConversationId] = useState(propConversationId || null);
  const [conversationTitle, setConversationTitle] = useState("");
  const [conversationSummary, setConversationSummary] = useState("");
  const [conversationStep, setConversationStep] = useState("idle"); // idle, waitingForTopic, waitingForPaste, waitingForUpload, awaiting_topic_purpose, awaiting_pdf_action, awaiting_paste_action, generating, finished
  const [loadingState, setLoadingState] = useState("none"); // none, thinking, uploading, extracting, generating, saving, downloading
  const [currentIntent, setCurrentIntent] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null); // { name, text, size }
  const [pastedContent, setPastedContent] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState(""); // learn, exam, interview, quick
  const [errorMessage, setErrorMessage] = useState("");

  const activeStreamRef = useRef(null);

  // If there's a savedNoteId parameter, load it as a static message in the chat
  useEffect(() => {
    if (savedNoteId && loadSavedNoteById) {
      const loadNote = async () => {
        setLoadingState("thinking");
        try {
          const note = await loadSavedNoteById(savedNoteId);
          if (note) {
            setMessages([
              INITIAL_MESSAGE,
              {
                id: `user-loaded-${savedNoteId}`,
                role: "user",
                content: `Load saved note: "${note.title}"`,
                type: "text",
                timestamp: new Date()
              },
              {
                id: `ai-loaded-${savedNoteId}`,
                role: "assistant",
                content: note.body || note.summary || "",
                type: "notes",
                title: note.title,
                category: note.category,
                dbNoteId: note._id, // Save reference to database ID
                saved: true,
                timestamp: new Date()
              }
            ]);
            setConversationStep("finished");
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to load the saved note from history.");
        } finally {
          setLoadingState("none");
        }
      };
      loadNote();
    }
  }, [savedNoteId, loadSavedNoteById]);

  // If there's a conversationId parameter, load it from the backend
  useEffect(() => {
    if (propConversationId) {
      setConversationId(propConversationId);
      setLoadingState("thinking");
      getConversation(propConversationId)
        .then((res) => {
          if (res.success && res.conversation) {
            setMessages(res.conversation.messages.length ? res.conversation.messages : [INITIAL_MESSAGE]);
            setConversationTitle(res.conversation.title || "");
            setConversationSummary(res.conversation.summary || "");
            setCurrentTopic(res.conversation.topic || "");
            setConversationStep("finished");
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage("Failed to load conversation history.");
        })
        .finally(() => setLoadingState("none"));
    }
  }, [propConversationId]);

  // Auto-save debounced effect
  useEffect(() => {
    if (loadingState === "generating" || conversationStep === "generating") return;
    if (messages.length <= 1 && messages[0].id === "greeting") return;

    const handler = setTimeout(async () => {
      let currentId = conversationId;
      if (!currentId) {
        currentId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        setConversationId(currentId);
      }

      let title = conversationTitle;
      if (!title || title === "New Chat") {
        const firstUserMsg = messages.find((m) => m.role === "user");
        if (firstUserMsg) {
          title = firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
          setConversationTitle(title);
        } else {
          title = "New Chat";
        }
      }

      try {
        await saveConversation(currentId, {
          messages,
          title,
          topic: currentTopic,
          summary: conversationSummary
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [messages, loadingState, conversationStep, conversationId, conversationTitle, conversationSummary, currentTopic]);

  /**
   * Appends a new message to the chat list.
   */
  const appendMessage = useCallback((msg) => {
    const messageId = msg.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMsg = {
      ...msg,
      id: messageId,
      timestamp: msg.timestamp || new Date()
    };
    setMessages((prev) => [...prev, newMsg]);
    return messageId;
  }, []);

  /**
   * Updates an existing message partially.
   */
  const updateMessageData = useCallback((msgId, partialData) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, ...partialData } : msg
      )
    );
  }, []);

  /**
   * Resets the entire chat conversation back to the initial state.
   */
  const resetChat = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current = null; // stop any running streaming generators
    }
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
    setConversationTitle("");
    setConversationSummary("");
    setConversationStep("idle");
    setLoadingState("none");
    setCurrentIntent("");
    setCurrentTopic("");
    setUploadedFile(null);
    setPastedContent("");
    setSelectedPurpose("");
    setErrorMessage("");
  }, []);

  const startIntentFlow = useCallback((intent) => {
    if (!INTENT_PROMPTS[intent]) {
      const error = new Error("Conversation state is invalid.");
      logDevelopmentError("startIntentFlow", error, { intent });
      setErrorMessage(getDevelopmentErrorMessage(error, "Something went wrong. Please try again."));
      return;
    }

    setCurrentIntent(intent);
    setSelectedPurpose("");
    setCurrentTopic("");
    setPastedContent("");
    setUploadedFile(null);

    if (intent === "topic" || intent === "explain") {
      setConversationStep("waitingForTopic");
    } else if (intent === "pasteText") {
      setConversationStep("waitingForPaste");
    } else if (intent === "upload") {
      setConversationStep("waitingForUpload");
    }

    appendMessage({
      role: "assistant",
      content: INTENT_PROMPTS[intent],
      type: "text"
    });
  }, [appendMessage]);

  /**
   * Processes a chunk generator stream from AI services.
   */
  const streamAIResponse = useCallback(async (promptHistory, messageType, customFields = {}) => {
    const { showFollowUpActions = messageType === "notes", ...messageFields } = customFields;

    setLoadingState("generating");
    setConversationStep("generating");

    const messageId = appendMessage({
      role: "assistant",
      content: "",
      type: messageType,
      ...messageFields
    });

    let currentContent = "";
    activeStreamRef.current = true;

    try {
      const stream = streamAIChatResponse(promptHistory);
      for await (const chunk of stream) {
        if (!activeStreamRef.current) {
          // Stream cancelled
          break;
        }
        currentContent += chunk;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content: currentContent } : msg))
        );
      }
      setConversationStep("finished");
      if (showFollowUpActions) {
        appendMessage({
          role: "assistant",
          content: "What would you like to do next?",
          type: "options",
          options: FOLLOW_UP_ACTION_OPTIONS
        });
      }
    } catch (error) {
      logDevelopmentError("streamAIResponse", error, { promptHistory, messageType });

      try {
        const fallbackContent = await generateChatCompletion(promptHistory);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: fallbackContent, status: "success" }
              : msg
          )
        );
        setConversationStep("finished");
        if (showFollowUpActions) {
          appendMessage({
            role: "assistant",
            content: "What would you like to do next?",
            type: "options",
            options: FOLLOW_UP_ACTION_OPTIONS
          });
        }
      } catch (fallbackError) {
        logDevelopmentError("streamAIResponseFallback", fallbackError, { promptHistory, messageType });
        const displayMessage = getDevelopmentErrorMessage(fallbackError, "I couldn't generate that response.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: displayMessage, status: "error" }
              : msg
          )
        );
        setErrorMessage(getDevelopmentErrorMessage(fallbackError, "AI generation failed. Please try again."));
        setConversationStep("finished");
      }
    } finally {
      setLoadingState("none");
      activeStreamRef.current = null;
    }
  }, [appendMessage]);

  /**
   * Generates a structured JSON response (used for quizzes and flashcards).
   */
  const generateStructuredResponse = useCallback(async (promptHistory, messageType) => {
    setLoadingState("generating");
    setConversationStep("generating");

    const messageId = appendMessage({
      role: "assistant",
      content: "Thinking...",
      type: "loading",
      status: "pending"
    });

    try {
      const response = await generateChatCompletion(promptHistory);
      let parsedData = null;

      // Extract JSON block if LLM wrapped it in markdown code fences
      let jsonString = response;
      const jsonStart = response.indexOf("```json");
      if (jsonStart !== -1) {
        const jsonEnd = response.lastIndexOf("```");
        jsonString = response.slice(jsonStart + 7, jsonEnd).trim();
      } else {
        const startBrace = response.indexOf("{");
        const startBracket = response.indexOf("[");
        const start = startBrace !== -1 && (startBracket === -1 || startBrace < startBracket) ? startBrace : startBracket;
        const end = response.lastIndexOf(start === startBrace ? "}" : "]");
        if (start !== -1 && end !== -1) {
          jsonString = response.slice(start, end + 1);
        }
      }

      parsedData = JSON.parse(jsonString);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: "",
                type: messageType,
                data: parsedData,
                status: "success"
              }
            : msg
        )
      );
      setConversationStep("finished");
    } catch (error) {
      logDevelopmentError("generateStructuredResponse", error, { promptHistory, messageType });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: getDevelopmentErrorMessage(error, "I couldn't generate that response."), type: "text", status: "error" }
            : msg
        )
      );
      setErrorMessage(getDevelopmentErrorMessage(error, "AI generation failed or output structure was invalid."));
      setConversationStep("finished");
    } finally {
      setLoadingState("none");
    }
  }, [appendMessage]);

  const generateBackendQuiz = useCallback(async (payload, options = {}) => {
    const { retry = false } = options;
    setLoadingState("generating");
    setConversationStep("generating");

    const messageId = appendMessage({
      role: "assistant",
      content: retry ? "Preparing a fresh retry quiz..." : "Generating your quiz...",
      type: "loading",
      status: "pending"
    });

    try {
      const endpoint = retry ? "/api/quiz/retry" : "/api/quiz/generate";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Quiz generation failed.");
      }

      const quizData = normalizeQuizResult(result, payload);
      if (!quizData.questions.length) {
        throw new Error("Quiz generation returned no questions.");
      }

      setCurrentTopic(quizData.topic);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: "",
                type: "quiz",
                data: quizData,
                quizState: createEmptyQuizState(),
                status: "success"
              }
            : msg
        )
      );
      setConversationStep("finished");
      return quizData;
    } catch (error) {
      logDevelopmentError("generateBackendQuiz", error, { payload, retry });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: getDevelopmentErrorMessage(error, "I couldn't generate that quiz."),
                type: "text",
                status: "error"
              }
            : msg
        )
      );
      setErrorMessage(getDevelopmentErrorMessage(error, "Quiz generation failed. Please try again."));
      setConversationStep("finished");
      return null;
    } finally {
      setLoadingState("none");
    }
  }, [appendMessage]);

  /**
   * Submits a text query manually typed by the user.
   */
  const handleUserMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setErrorMessage("");

    // Detect if this user message is a follow-up request when in "finished" stage
    if (conversationStep === "finished") {
      appendMessage({ role: "user", content: text, type: "text" });
      
      // Build token-efficient session context
      const maxMessages = 5;
      const recentMessages = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-maxMessages)
        .map(msg => ({
          role: msg.role,
          content: msg.type === "notes" ? `Notes:\n${msg.content}` : msg.type === "quiz" ? summarizeQuizForContext(msg) : msg.content
        }));
      recentMessages.push({ role: "user", content: text });

      const contextPrompt = conversationSummary ? `\nPrevious summary:\n${conversationSummary}` : "";

      // Determine follow-up intent: If they ask for quiz, flashcard, etc.
      const query = text.toLowerCase();
      const latestQuiz = getLatestQuizMessage(messages);
      const detectedIntent = detectInitialIntent(text);
      const asksRetry = /\b(retry|again|missed|incorrect|wrong)\b/.test(query) && latestQuiz;
      const asksWeakSummary = /\b(weak|weakness|mistakes|missed)\b/.test(query) && /\b(summary|summarize|notes|explain|areas|weakness)\b/.test(query);

      if (asksRetry) {
        const missedQuestions = getMissedQuestionsFromMessage(latestQuiz);
        if (!missedQuestions.length) {
          appendMessage({
            role: "assistant",
            content: "I do not see any missed submitted answers yet. Submit a quiz first, then I can create a focused retry set.",
            type: "text"
          });
        } else {
          await generateBackendQuiz({
            topic: latestQuiz.data?.topic || currentTopic || "Study quiz",
            difficulty: latestQuiz.data?.difficulty || "medium",
            numberOfQuestions: missedQuestions.length,
            missedQuestions
          }, { retry: true });
        }
      } else if (detectedIntent.intent === "direct_quiz") {
        const sessionContent = getRelevantSessionContent(messages);
        await generateBackendQuiz({
          topic: detectedIntent.params.topic || sessionContent.topic,
          sourceType: detectedIntent.params.topic ? "topic" : sessionContent.sourceType,
          content: detectedIntent.params.topic ? detectedIntent.params.topic : sessionContent.content,
          numberOfQuestions: detectedIntent.params.count,
          difficulty: detectedIntent.params.difficulty
        });
      } else if (detectedIntent.intent === "topic_quiz_setup") {
        const sessionContent = getRelevantSessionContent(messages);
        await generateBackendQuiz({
          ...sessionContent,
          numberOfQuestions: 5,
          difficulty: "medium"
        });
      } else if (asksWeakSummary && latestQuiz) {
        const missedQuestions = getMissedQuestionsFromMessage(latestQuiz);
        const missedSummary = missedQuestions.length
          ? missedQuestions.map((item) => `Q${item.index + 1}: ${item.question} (Correct: ${item.correctAnswer}. ${item.explanationCorrect})`).join("\n")
          : "No missed questions recorded.";
        await streamAIResponse([
          {
            role: "system",
            content: `You are StudyGen AI, a concise study coach. Summarize weak areas only from the missed questions provided. Group related misses. Give 2-3 concrete next steps. Keep it encouraging.${contextPrompt}`
          },
          {
            role: "user",
            content: `Topic: ${latestQuiz.data?.topic || currentTopic || "Study quiz"}\n\nMissed questions:\n${missedSummary}`
          }
        ], "text");
      } else if (query.includes("quiz") || query.includes("test") || query.includes("questions")) {
        const sessionContent = getRelevantSessionContent(messages);
        await generateBackendQuiz({
          ...sessionContent,
          numberOfQuestions: 5,
          difficulty: "medium"
        });
      } else if (query.includes("flashcard") || query.includes("cards")) {
        await generateStructuredResponse([
          { role: "system", content: `You are an assistant. Generate flashcards based on previous context. Output ONLY structured JSON matching the flashcards requirements. No intro/outro.${contextPrompt}` },
          ...recentMessages
        ], "flashcards");
      } else {
        // Default to streaming notes/text follow-up
        await streamAIResponse([
          { role: "system", content: `You are a helpful study assistant. Answer questions or revise notes based on the session details. Format with headers/markdown. Keep responses short, clear, natural, and beginner-friendly. Provide detailed explanations only if explicitly requested.${contextPrompt}` },
          ...recentMessages
        ], "text");
      }
      return;
    }

    // Step 1: Detect intent and transition from idle state
    const cleanText = text.trim();
    appendMessage({ role: "user", content: cleanText, type: "text" });

    if (conversationStep === "idle") {
      const detectedIntent = detectInitialIntent(cleanText);
      if (detectedIntent.intent === "direct_quiz") {
        await generateBackendQuiz({
          topic: detectedIntent.params.topic,
          sourceType: "topic",
          content: detectedIntent.params.topic,
          numberOfQuestions: detectedIntent.params.count,
          difficulty: detectedIntent.params.difficulty
        });
        return;
      }
      if (detectedIntent.intent === "topic_quiz_setup") {
        setCurrentIntent("topic_quiz_setup");
        setConversationStep("waitingForTopic");
        appendMessage({
          role: "assistant",
          content: INTENT_PROMPTS.topic_quiz_setup,
          type: "text"
        });
        return;
      }
      if (detectedIntent.intent) {
        startIntentFlow(detectedIntent.intent);
        return;
      }
    }

    if (conversationStep === "waitingForUpload") {
      appendMessage({
        role: "assistant",
        content: INTENT_PROMPTS.upload,
        type: "text"
      });
      return;
    }

    if (conversationStep === "waitingForPaste") {
      setPastedContent(cleanText);
      setConversationStep("awaiting_paste_action");
      appendMessage({
        role: "assistant",
        content: "I've received your text.\n\nHow would you like me to process it?",
        type: "options",
        options: [
          { value: "notes", label: "📚 Generate Notes", icon: "📚" },
          { value: "summary", label: "📝 Summary", icon: "📝" },
          { value: "flashcards", label: "🧠 Flashcards", icon: "🧠" },
          { value: "quiz", label: "❓ Quiz", icon: "❓" }
        ]
      });
      return;
    }

    if (conversationStep === "waitingForTopic") {
      setCurrentTopic(cleanText);

      if (currentIntent === "topic_quiz_setup") {
        await generateBackendQuiz({
          topic: cleanText,
          sourceType: "topic",
          content: cleanText,
          numberOfQuestions: 5,
          difficulty: "medium"
        });
        return;
      }

      if (currentIntent === "explain") {
        const promptHistory = [
          {
            role: "system",
            content: "You are a helpful study assistant. Explain the requested topic clearly for a student. Use Markdown with a definition, simple explanation, key points, practical example, common confusion, and summary."
          },
          { role: "user", content: `Topic: ${cleanText}` }
        ];
        await streamAIResponse(promptHistory, "notes", { title: cleanText, category: "Explanation" });
        return;
      }

      setConversationStep("awaiting_topic_purpose");
      appendMessage({
        role: "assistant",
        content: `What is your purpose for studying **${cleanText}**?`,
        type: "options",
        options: NOTE_PURPOSE_OPTIONS
      });
      return;
    }

    // Simple heuristic: if it has newlines or is long, treat it as pasted text. Otherwise, a topic.
    const isPasted = cleanText.length > 150 || cleanText.includes("\n");

    if (isPasted) {
      setPastedContent(cleanText);
      setConversationStep("awaiting_paste_action");
      appendMessage({
        role: "assistant",
        content: "I've received your text.\n\nHow would you like me to process it?",
        type: "options",
        options: [
          { value: "notes", label: "📚 Generate Notes", icon: "📚" },
          { value: "summary", label: "📝 Summary", icon: "📝" },
          { value: "flashcards", label: "🧠 Flashcards", icon: "🧠" },
          { value: "quiz", label: "❓ Quiz", icon: "❓" }
        ]
      });
    } else {
      setCurrentTopic(cleanText);
      setConversationStep("awaiting_topic_purpose");
      appendMessage({
        role: "assistant",
        content: `What is your purpose for studying **${cleanText}**?`,
        type: "options",
        options: NOTE_PURPOSE_OPTIONS
      });
    }
  }, [conversationStep, currentIntent, messages, appendMessage, generateStructuredResponse, streamAIResponse, startIntentFlow]);

  /**
   * Action selection (handling chip/button clicks).
   */
  const handleSelectOption = useCallback(async (optionValue) => {
    setErrorMessage("");

    if (optionValue.startsWith("intent:")) {
      startIntentFlow(optionValue.replace("intent:", ""));
      return;
    }

    if (optionValue.startsWith("followup:")) {
      const followUpAction = optionValue.replace("followup:", "");
      
      const maxMessages = 5;
      const recentMessages = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-maxMessages)
        .map(msg => ({
          role: msg.role,
          content: msg.type === "notes" ? `Notes:\n${msg.content}` : msg.type === "quiz" ? `Generated Quiz JSON:\n${JSON.stringify(msg.data)}` : msg.content
        }));
      
      const contextPrompt = conversationSummary ? `\nPrevious summary:\n${conversationSummary}` : "";

      if (followUpAction === "ask") {
        appendMessage({
          role: "assistant",
          content: "Ask me any question about these notes.",
          type: "text"
        });
      } else if (followUpAction === "quiz") {
        await generateStructuredResponse([
          { role: "system", content: `You are an assistant. Generate a quiz based on the notes in the previous context. Output ONLY structured JSON matching the quiz requirements. No intro/outro.${contextPrompt}` },
          ...recentMessages
        ], "quiz");
      } else if (followUpAction === "flashcards") {
        await generateStructuredResponse([
          { role: "system", content: `You are an assistant. Generate flashcards based on the notes in the previous context. Output ONLY structured JSON matching the flashcards requirements. No intro/outro.${contextPrompt}` },
          ...recentMessages
        ], "flashcards");
      } else if (followUpAction === "save") {
        appendMessage({
          role: "assistant",
          content: "Use the Save to History button on the notes card to save these notes.",
          type: "text"
        });
      }
      return;
    }

    if (conversationStep === "awaiting_topic_purpose") {
      setSelectedPurpose(optionValue);

      if (!currentTopic || !NOTE_PURPOSE_CONFIG[optionValue]) {
        const error = new Error("Conversation state is invalid.");
        logDevelopmentError("awaiting_topic_purpose", error, { currentTopic, purpose: optionValue });
        setErrorMessage(getDevelopmentErrorMessage(error, "Something went wrong. Please start over."));
        return;
      }

      appendMessage({
        role: "assistant",
        content: `Generating notes for **${currentTopic}**.`,
        type: "text"
      });
      await streamAIResponse(buildTopicNotesPrompt(currentTopic, optionValue), "notes", {
        title: currentTopic,
        category: NOTE_PURPOSE_CONFIG[optionValue].label,
        showFollowUpActions: true
      });
    } else if (conversationStep === "awaiting_pdf_action") {
      appendMessage({ role: "user", content: `Action: ${optionValue}`, type: "text" });

      const contentSource = uploadedFile?.text || "";
      if (!hasExtractableDocumentText(uploadedFile)) {
        appendMessage({
          role: "assistant",
          content: `I could not find extractable text in **${uploadedFile?.name || "this PDF"}**. This PDF may be scanned, image-based, or missing readable text. OCR/text extraction is required before I can summarize it, generate notes, explain difficult sections, create a quiz, or make flashcards. I will not invent content from an unreadable document.`,
          type: "text",
          status: "error"
        });
        setConversationStep("finished");
        return;
      }

      if (optionValue === "quiz") {
        const promptHistory = [
          {
            role: "system",
            content: "You are an AI Study Assistant specialized in educational documents. Generate exactly 5 multiple choice questions based only on the extracted PDF text. Output ONLY a valid JSON array of objects containing question, options, correct answer, and explanation. Do not invent missing document content. Do not add intro/outro text."
          },
          { role: "user", content: `Document name: ${uploadedFile.name}\n\nDocument text:\n${contentSource.slice(0, 8000)}` }
        ];
        await generateStructuredResponse(promptHistory, "quiz");
      } else if (optionValue === "summarize") {
        const promptHistory = buildDocumentPrompt("summarize", uploadedFile.name, contentSource);
        await streamAIResponse(promptHistory, "notes", { title: `Summary: ${uploadedFile.name}`, category: "Summary" });
      } else if (optionValue === "explain") {
        const promptHistory = buildDocumentPrompt("explain", uploadedFile.name, contentSource);
        await streamAIResponse(promptHistory, "notes", { title: `Explanations: ${uploadedFile.name}`, category: "Explanation" });
      } else {
        const promptHistory = buildDocumentPrompt("notes", uploadedFile.name, contentSource);
        await streamAIResponse(promptHistory, "notes", { title: uploadedFile.name, category: "Notes" });
      }
    } else if (conversationStep === "awaiting_paste_action") {
      appendMessage({ role: "user", content: `Action: ${optionValue}`, type: "text" });

      if (optionValue === "quiz") {
        const promptHistory = [
          {
            role: "system",
            content: "You are a quiz generator. Generate exactly 5 multiple choice questions based on the provided text. Output ONLY a valid JSON array of objects inside a markdown code block (```json ... ```) containing questions, options, correct answer, and explanation. Do not add intro/outro text."
          },
          { role: "user", content: `Text contents:\n${pastedContent.slice(0, 8000)}` }
        ];
        await generateStructuredResponse(promptHistory, "quiz");
      } else if (optionValue === "flashcards") {
        const promptHistory = [
          {
            role: "system",
            content: "You are an assistant. Generate exactly 5 study flashcards based on the provided text. Output ONLY a valid JSON object matching this exact structure: { \"flashcards\": [ { \"front\": \"...\", \"back\": \"...\" } ] } inside a markdown code block (```json ... ```). Do not add intro/outro text."
          },
          { role: "user", content: `Text contents:\n${pastedContent.slice(0, 8000)}` }
        ];
        await generateStructuredResponse(promptHistory, "flashcards");
      } else if (optionValue === "summary") {
        const promptHistory = [
          {
            role: "system",
            content: "You are a study assistant. Summarize the provided text in a visually rich Markdown format. Focus on key details, structure, and main ideas."
          },
          { role: "user", content: `Text contents:\n${pastedContent.slice(0, 8000)}` }
        ];
        await streamAIResponse(promptHistory, "notes", { title: "Text Summary", category: "Summary" });
      } else {
        // Notes
        const promptHistory = [
          {
            role: "system",
            content: `You are a helpful study assistant. Read the provided text and generate clear study notes. Format using the exact Markdown layout:
# [Topic Title]
📌 **Definition**
💡 **Simple Explanation**
⭐ **Key Points**
📝 **Example**
⚠️ **Common Mistakes**
🎯 **Exam Tips**
📖 **Summary**`
          },
          { role: "user", content: `Text contents:\n${pastedContent.slice(0, 8000)}` }
        ];
        await streamAIResponse(promptHistory, "notes", { title: "Study Notes", category: "Notes" });
      }
    }
  }, [conversationStep, currentTopic, uploadedFile, pastedContent, messages, appendMessage, generateStructuredResponse, streamAIResponse, startIntentFlow]);

  /**
   * Handles a file upload (PDF/TXT/MD) and initiates document flow.
   */
  const handleFileUpload = useCallback(async (fileName, fileText, fileSize, metadata = {}) => {
    setErrorMessage("");

    if (fileSize > 2 * 1024 * 1024) {
      setErrorMessage("File is too large. Please upload files under 2MB.");
      return;
    }

    const cleanFileName = fileName.toLowerCase();
    const isPDF = cleanFileName.endsWith(".pdf");
    const isText = cleanFileName.endsWith(".txt") || cleanFileName.endsWith(".md");

    if (!isPDF && !isText) {
      setErrorMessage("Unsupported file type. Please upload a .pdf, .txt, or .md file.");
      return;
    }

    const fileRecord = {
      name: fileName,
      text: fileText || "",
      size: fileSize,
      requiresOcr: Boolean(metadata.requiresOcr),
      extractionError: metadata.extractionError || ""
    };

    setUploadedFile(fileRecord);
    setCurrentIntent("upload");

    appendMessage({
      role: "user",
      content: `Uploaded: ${fileName} (${(fileSize / 1024).toFixed(1)} KB)`,
      type: "text"
    });

    if (isPDF && fileRecord.requiresOcr) {
      setConversationStep("finished");
      appendMessage({
        role: "assistant",
        content: `I could not find extractable text in **${fileName}**. This PDF may be scanned, image-based, or missing readable text. OCR/text extraction is required before I can summarize it, generate notes, explain difficult sections, create a quiz, or make flashcards. I will not invent content from an unreadable document.`,
        type: "text",
        status: "error"
      });
    } else if (isPDF) {
      setConversationStep("awaiting_pdf_action");
      appendMessage({
        role: "assistant",
        content: `I received your PDF **${fileName}**.\n\nWhat would you like me to do?`,
        type: "options",
        options: [
          { value: "notes", label: "📚 Generate Notes", icon: "📚" },
          { value: "summarize", label: "📝 Summarize", icon: "📝" },
          { value: "explain", label: "❓ Explain Difficult Parts", icon: "❓" },
          { value: "quiz", label: "🧠 Generate Quiz", icon: "🧠" }
        ]
      });
    } else {
      setConversationStep("awaiting_paste_action");
      appendMessage({
        role: "assistant",
        content: `I received your text document **${fileName}**.\n\nHow would you like me to process it?`,
        type: "options",
        options: [
          { value: "notes", label: "📚 Notes", icon: "📚" },
          { value: "summary", label: "📝 Summary", icon: "📝" },
          { value: "flashcards", label: "🧠 Flashcards", icon: "🧠" },
          { value: "quiz", label: "❓ Quiz", icon: "❓" }
        ]
      });
    }
  }, [appendMessage]);

  /**
   * Action: Regenerates the last AI response.
   */
  const regenerateLastResponse = useCallback(async () => {
    if (messages.length < 2) return;
    setErrorMessage("");

    // Find last user message
    const msgs = [...messages];
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    // Cut messages back to the last user message
    const trimmedMessages = msgs.slice(0, lastUserIndex + 1);
    setMessages(trimmedMessages);

    // Get prompt history
    const promptHistory = trimmedMessages.map(msg => ({
      role: msg.role,
      content: msg.type === "notes" ? `Notes:\n${msg.content}` : msg.content
    }));

    // Trigger same style generation based on stage
    const lastAI = msgs[msgs.length - 1];
    if (lastAI && lastAI.type === "quiz") {
      await generateStructuredResponse(promptHistory, "quiz");
    } else if (lastAI && lastAI.type === "flashcards") {
      await generateStructuredResponse(promptHistory, "flashcards");
    } else {
      await streamAIResponse(promptHistory, lastAI?.type || "notes", {
        title: lastAI?.title || "Notes",
        category: lastAI?.category || "Notes"
      });
    }
  }, [messages, generateStructuredResponse, streamAIResponse]);

  /**
   * Action: Handles Save to History via external API.
   */
  const handleSaveToHistory = useCallback(async (msgId, notePayload) => {
    setLoadingState("saving");
    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notePayload)
      });

      if (!response.ok) throw new Error("Server error");
      const result = await response.json();
      const savedId = result.note?._id;

      // Update message with saved state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? { ...msg, saved: true, dbNoteId: savedId }
            : msg
        )
      );
      return savedId;
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not save to MongoDB. Make sure backend is running.");
      throw err;
    } finally {
      setLoadingState("none");
    }
  }, []);

  return {
    messages,
    conversationStep,
    loadingState,
    uploadedFile,
    selectedStyle: selectedPurpose,
    selectedPurpose,
    errorMessage,
    setErrorMessage,
    setLoadingState,
    setMessages,
    actions: {
      sendMessage: handleUserMessage,
      selectOption: handleSelectOption,
      uploadFile: handleFileUpload,
      resetChat,
      regenerateResponse: regenerateLastResponse,
      saveNote: handleSaveToHistory,
      updateMessageData
    }
  };
}
