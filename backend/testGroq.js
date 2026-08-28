require("dotenv").config({ path: ".env" });

async function testGroqJSON() {
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
        messages: [
          { role: "system", content: "You are a quiz bot. Output JSON format." },
          { role: "user", content: "Create 2 multiple choice questions about geography." }
        ]
      })
    });
    const body = await response.text();
    console.log("Status:", response.status);
    console.log("Body:", body);
  } catch (err) {
    console.error(err);
  }
}

testGroqJSON();
