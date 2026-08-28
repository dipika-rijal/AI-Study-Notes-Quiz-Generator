const { GROQ_MODEL } = require("../config/groq.js");

function getGroqApiKey() {
  return process.env.GROQ_API_KEY || "";
}

exports.generateChatCompletion = async (req, res, next) => {
  try {
    const { messages, temperature, max_completion_tokens, response_format } = req.body;
    
    if (!Array.isArray(messages) || messages.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid or too many messages" });
    }
    if (messages.some(m => typeof m.content === "string" && m.content.length > 20000)) {
      return res.status(400).json({ success: false, message: "Message content too long" });
    }

    const apiKey = getGroqApiKey();
    if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
      throw new Error("Groq API key is missing on the backend.");
    }

    const payload = {
      model: GROQ_MODEL,
      temperature: temperature ?? 0.35,
      messages: messages
    };
    if (max_completion_tokens) payload.max_completion_tokens = Math.min(Number(max_completion_tokens), 2048);
    if (response_format) payload.response_format = response_format;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = await response.text();
    if (!response.ok) {
      let groqMessage = "";
      try { groqMessage = JSON.parse(body)?.error?.message || ""; } catch {}
      const err = new Error(`Groq API error ${response.status}: ${groqMessage || body.slice(0, 200)}`);
      err.status = response.status === 429 ? 429 : 502;
      err.retryAfter = response.headers.get("retry-after");
      throw err;
    }

    const data = JSON.parse(body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.streamAIChatResponse = async (req, res, next) => {
  try {
    const { messages, temperature } = req.body;
    
    if (!Array.isArray(messages) || messages.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid or too many messages" });
    }
    if (messages.some(m => typeof m.content === "string" && m.content.length > 20000)) {
      return res.status(400).json({ success: false, message: "Message content too long" });
    }

    const apiKey = getGroqApiKey();
    if (!apiKey) throw new Error("Groq API key is missing on the backend.");

    const payload = {
      model: GROQ_MODEL,
      temperature: temperature ?? 0.4,
      messages: messages,
      stream: true
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      let groqMessage = "";
      try { groqMessage = JSON.parse(body)?.error?.message || ""; } catch {}
      const err = new Error(`Groq API error ${response.status}: ${groqMessage || body.slice(0, 200)}`);
      err.status = response.status === 429 ? 429 : 502;
      err.retryAfter = response.headers.get("retry-after");
      throw err;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (error) {
    next(error);
  }
};
