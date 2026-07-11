import { useState, useEffect } from "react";
import LedgerBar from "./LedgerBar";
import Sparkline from "./Sparkline";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../data/watchlistStorage";

export default function CompanyCard({ company }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getWatchlist().includes(company.ticker));
  }, [company.ticker]);

  const toggleWatchlist = () => {
    if (saved) {
      removeFromWatchlist(company.ticker);
      setSaved(false);
    } else {
      addToWatchlist(company.ticker);
      setSaved(true);
    }
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 8px 24px rgba(14,31,75,0.08)",
        flex: 1,
        minWidth: 260,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13, color: "#8A93A6", fontWeight: 600, letterSpacing: 0.5 }}>
          {company.ticker} · {company.sector}
        </div>
        <button
          onClick={toggleWatchlist}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: saved ? "#C9A05C" : "#D0D5E2",
          }}
          title={saved ? "Remove from watchlist" : "Add to watchlist"}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      <div style={{ fontFamily: "monospace", fontSize: 44, fontWeight: 700, color: "#4C5FEF", margin: "6px 0 20px" }}>
        {company.composite.toFixed(1)}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#8A93A6", fontWeight: 600, marginBottom: 6 }}>5-Year Revenue</div>
        <Sparkline data={company.revenueHistory} />
      </div>

      <LedgerBar label="Valuation" value={company.categories.valuation} />
      <LedgerBar label="Growth" value={company.categories.growth} />
      <LedgerBar label="Profitability" value={company.categories.profitability} />
      <LedgerBar label="Financial Health" value={company.categories.health} />
    </div>
  );
}