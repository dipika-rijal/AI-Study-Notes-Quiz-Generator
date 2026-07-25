const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function getGroqApiKey() {
  return process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
}

exports.generateChatCompletion = async (req, res, next) => {
  try {
    const { model, messages, temperature, max_completion_tokens, response_format } = req.body;
    
    const apiKey = getGroqApiKey();
    if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
      throw new Error("Groq API key is missing on the backend.");
    }

    const payload = {
      model: model || GROQ_MODEL,
      temperature: temperature ?? 0.35,
      messages: messages
    };
    if (max_completion_tokens) payload.max_completion_tokens = max_completion_tokens;
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
      throw new Error("Groq API returned " + response.status + ". " + body.slice(0, 300));
    }

    const data = JSON.parse(body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.streamAIChatResponse = async (req, res, next) => {
  try {
    const { model, messages, temperature } = req.body;
    
    const apiKey = getGroqApiKey();
    if (!apiKey) throw new Error("Groq API key is missing on the backend.");

    const payload = {
      model: model || GROQ_MODEL,
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
      throw new Error("Groq API returned " + response.status + ". " + body.slice(0, 300));
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
