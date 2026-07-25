import { useState, useCallback, useRef, useEffect } from "react";
import { streamAIChatResponse } from "../services/ai";
import { getPreferences } from "../api/preferenceApi";
import { getConversation, saveConversation } from "../api/conversationApi";

const INITIAL_MESSAGE = {
  id: "greeting",
  role: "assistant",
  content: "👋 Hello! I'm your AI Tutor. I can help you understand difficult concepts, prepare for exams, or review coding problems. How can I help you today?",
  type: "text",
  timestamp: new Date()
};

export function useTutorFlow(initialConversationId = null) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loadingState, setLoadingState] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [learningProfile, setLearningProfile] = useState(null);
  const [tutorMode, setTutorMode] = useState("beginner"); // beginner, exam, deep, coding
  const [conversationId, setConversationId] = useState(initialConversationId);

  const activeStreamRef = useRef(null);

  useEffect(() => {
    getPreferences().then((data) => {
      if (data?.data?.learningProfile) {
        setLearningProfile(data.data.learningProfile);
      }
    }).catch(err => console.error("Failed to load learning profile", err));
  }, []);

  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      setLoadingState("thinking");
      getConversation(initialConversationId)
        .then((res) => {
          if (res.success && res.conversation) {
            setMessages(res.conversation.messages.length ? res.conversation.messages : [INITIAL_MESSAGE]);
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage("Failed to load conversation history.");
        })
        .finally(() => setLoadingState("none"));
    }
  }, [initialConversationId]);

  // Auto-save debounced effect
  useEffect(() => {
    if (loadingState === "generating") return;
    if (messages.length <= 1 && messages[0].id === "greeting") return;

    const handler = setTimeout(async () => {
      let currentId = conversationId;
      if (!currentId) {
        currentId = `tutor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        setConversationId(currentId);
      }

      let title = "Tutor Session";
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        title = firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? "..." : "");
      }

      try {
        await saveConversation(currentId, {
          messages,
          title,
          topic: "Tutor",
          summary: ""
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [messages, loadingState, conversationId]);

  const appendMessage = useCallback((msg) => {
    const messageId = msg.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMsg = { ...msg, id: messageId, timestamp: msg.timestamp || new Date() };
    setMessages((prev) => [...prev, newMsg]);
    return messageId;
  }, []);

  const buildSystemPrompt = useCallback(() => {
    let profileContext = "";
    if (learningProfile?.weaknesses?.length > 0) {
      profileContext = `\nImportant: The student has weaknesses in the following areas: ${learningProfile.weaknesses.join(", ")}. Be patient and preemptively explain these concepts if they come up.`;
    }

    const basePrompt = "You are StudyGen AI, a supportive and encouraging university professor. You are acting as a personal tutor.";
    
    const modeInstructions = {
      beginner: "Speak in a very patient, simple tone. Define basic terms first. Never assume prior knowledge. Use real-world analogies.",
      exam: "Focus on exam preparation. Ask the student questions to test their knowledge. Highlight common pitfalls and key points to remember.",
      deep: "Focus on deep, comprehensive understanding. Explore the 'why' behind concepts. Introduce advanced terminology but explain it clearly.",
      coding: "Act as an expert pair programmer. When explaining code, walk through the logic step-by-step. Encourage best practices."
    };

    return {
      role: "system",
      content: `${basePrompt}\n\nMode: ${tutorMode.toUpperCase()}\n${modeInstructions[tutorMode]}\n${profileContext}\n\nReturn clean markdown. Use bullet points and bold text for emphasis. Do not output raw JSON.`
    };
  }, [tutorMode, learningProfile]);

  const sendMessage = useCallback(async (text, file) => {
    if (!text.trim() && !file) return;

    appendMessage({
      role: "user",
      content: text,
      type: "text"
    });

    setLoadingState("generating");
    setErrorMessage("");

    const messageId = appendMessage({
      role: "assistant",
      content: "",
      type: "text"
    });

    activeStreamRef.current = true;

    try {
      // Build full conversation history for the AI
      const promptHistory = [
        buildSystemPrompt(),
        ...messages.map(m => ({ role: m.role, content: m.content })).filter(m => m.content && m.role !== "system"),
        { role: "user", content: text }
      ];

      const stream = streamAIChatResponse(promptHistory);
      let currentContent = "";

      for await (const chunk of stream) {
        if (!activeStreamRef.current) break;
        currentContent += chunk;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content: currentContent } : msg))
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("I'm sorry, I encountered an error while responding.");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: "Error: Could not generate response." } : msg
        )
      );
    } finally {
      setLoadingState("none");
      activeStreamRef.current = null;
    }
  }, [messages, appendMessage, buildSystemPrompt]);

  const resetChat = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current = null;
    }
    setMessages([INITIAL_MESSAGE]);
    setErrorMessage("");
    setLoadingState("none");
  }, []);

  return {
    messages,
    loadingState,
    errorMessage,
    setErrorMessage,
    tutorMode,
    setTutorMode,
    actions: {
      sendMessage,
      resetChat
    }
  };
}
