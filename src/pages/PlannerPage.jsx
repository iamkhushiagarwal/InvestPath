import { useState } from "react";
import { getInvestmentPlan } from "../api/geminiClient";
import { GEMINI_KEY } from "../config";

export default function PlannerPage() {
  const [userInput, setUserInput] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setPlan("");
    if (!userInput.trim()) {
      setError("Describe your situation first.");
      return;
    }
    setLoading(true);
    try {
      const result = await getInvestmentPlan(userInput.trim(), GEMINI_KEY);
      setPlan(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "-apple-system, Inter, sans-serif", background: "#FAFBFF", minHeight: "100vh" }}>
      <h1 style={{ color: "#0E1F4B", fontSize: 26, marginBottom: 4 }}>AI Investment Planner</h1>
      <p style={{ color: "#8A93A6", fontSize: 14, marginBottom: 20, maxWidth: 600 }}>
        Describe your income, timeline, and goals in your own words. This tool explains general
        portfolio concepts — it does not recommend specific stocks or guarantee returns.
      </p>

      <div style={{ background: "#FFF8E6", border: "1px solid #F0D98C", borderRadius: 12, padding: "12px 16px", marginBottom: 24, maxWidth: 600, fontSize: 13, color: "#8A6D1F" }}>
        ⚠️ <strong>Educational tool, not licensed financial advice.</strong> For real financial
        decisions, consult a licensed financial advisor.
      </div>

      <textarea
        placeholder="e.g. I'm 24, earn $50,000/year, want to start investing for retirement in 30 years and I'm comfortable with some risk."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        rows={4}
        style={{ display: "block", width: "100%", maxWidth: 560, padding: 12, borderRadius: 12, border: "1px solid #E4E8F5", marginBottom: 12, fontFamily: "inherit", fontSize: 14 }}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Thinking..." : "Generate my plan"}
      </button>

      {error && <p style={{ color: "#FF6B6B", marginTop: 12 }}>{error}</p>}

      {plan && (
        <div style={{ marginTop: 24, background: "#FFFFFF", borderRadius: 16, padding: 24, maxWidth: 600, boxShadow: "0 8px 24px rgba(14,31,75,0.08)", whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#0E1F4B", fontSize: 14 }}>
          {plan}
        </div>
      )}
    </div>
  );
}