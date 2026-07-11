import { useState } from "react";
import { glossaryTerms } from "../data/glossaryTerms";

export default function GlossaryPage() {
  const [search, setSearch] = useState("");

  const filtered = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group filtered terms by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: 40, fontFamily: "-apple-system, Inter, sans-serif", background: "#FAFBFF", minHeight: "100vh" }}>
      <h1 style={{ color: "#0E1F4B", fontSize: 26, marginBottom: 4 }}>Glossary</h1>
      <p style={{ color: "#8A93A6", fontSize: 14, marginBottom: 20 }}>
        Plain-English definitions for common investing terms.
      </p>

      <input
        placeholder="Search terms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          maxWidth: 400,
          borderRadius: 10,
          border: "1px solid #E4E8F5",
          marginBottom: 28,
          fontSize: 14,
        }}
      />

      {Object.keys(grouped).length === 0 && (
        <p style={{ color: "#8A93A6" }}>No terms match your search.</p>
      )}

      {Object.entries(grouped).map(([category, terms]) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#4C5FEF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            {category}
          </div>
          {terms.map((t) => (
            <div
              key={t.term}
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 10,
                boxShadow: "0 2px 8px rgba(14,31,75,0.05)",
              }}
            >
              <div style={{ fontWeight: 600, color: "#0E1F4B", fontSize: 14, marginBottom: 4 }}>
                {t.term}
              </div>
              <div style={{ fontSize: 13, color: "#5A6478", lineHeight: 1.5 }}>{t.definition}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}