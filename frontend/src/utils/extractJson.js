export function extractJson(responseString) {
  let jsonString = responseString;
  const jsonStart = responseString.indexOf("```json");
  
  if (jsonStart !== -1) {
    const jsonEnd = responseString.lastIndexOf("```");
    jsonString = responseString.slice(jsonStart + 7, jsonEnd).trim();
  } else {
    const startBrace = responseString.indexOf("{");
    const startBracket = responseString.indexOf("[");
    const start = startBrace !== -1 && (startBracket === -1 || startBrace < startBracket) ? startBrace : startBracket;
    const end = responseString.lastIndexOf(start === startBrace ? "}" : "]");
    
    if (start !== -1 && end !== -1 && end > start) {
      jsonString = responseString.slice(start, end + 1);
    }
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Failed to parse extracted JSON.");
  }
}
