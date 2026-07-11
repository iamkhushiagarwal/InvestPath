const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

export async function getInvestmentPlan(userInput, apiKey) {
  const systemInstruction = `You are an educational financial literacy assistant, not a licensed financial advisor.
Given a person's income, timeline, and goals, explain general portfolio allocation concepts
(e.g., typical stock/bond mix ranges by risk tolerance and time horizon, the value of diversification,
the idea of emergency funds before investing). Speak in percentages and general asset categories only.
Do NOT recommend specific companies, stocks, or securities. Do NOT guarantee returns.
Always include a brief reminder that this is educational, not personalized financial advice,
and that a licensed advisor should be consulted for real decisions.
Keep the response concise, friendly, and beginner-appropriate.`;

  const body = {
    contents: [
      {
        parts: [{ text: `${systemInstruction}\n\nUser's situation: ${userInput}` }],
      },
    ],
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini API request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response generated. Try rephrasing your input.");
  }

  return text;
}