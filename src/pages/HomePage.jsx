import { useState, useEffect } from "react";
import { fetchGainers, fetchLosers, fetchMostActive } from "../api/fmpClient";
import { Link } from "react-router-dom";
import { FMP_KEY } from "../config";
import { getCachedTrending, setCachedTrending } from "../data/watchlistStorage";

function StockRow({ stock }) {
  const isUp = stock.changesPercentage >= 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F2FA" }}>
      <div>
        <div style={{ fontWeight: 600, color: "#0E1F4B", fontSize: 14 }}>{stock.symbol}</div>
        <div style={{ fontSize: 12, color: "#8A93A6" }}>{stock.name}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "monospace", fontSize: 14, color: "#0E1F4B" }}>
          ${stock.price?.toFixed(2)}
        </div>
        <div style={{ fontSize: 12, color: isUp ? "#00C2A8" : "#FF6B6B", fontWeight: 600 }}>
          {isUp ? "+" : ""}
          {stock.changesPercentage?.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function StockList({ title, stocks }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 20, flex: 1, minWidth: 260, boxShadow: "0 4px 16px rgba(14,31,75,0.06)" }}>
      <div style={{ fontWeight: 700, color: "#0E1F4B", marginBottom: 8 }}>{title}</div>
      {stocks.slice(0, 8).map((s) => (
        <StockRow key={s.symbol} stock={s} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setError("");

      const cached = getCachedTrending();
      if (cached) {
        setGainers(cached.gainers);
        setLosers(cached.losers);
        setMostActive(cached.mostActive);
        setLoading(false);
        return; // skip the API call entirely
      }

      setLoading(true);
      try {
        const [g, l, a] = await Promise.all([
          fetchGainers(FMP_KEY),
          fetchLosers(FMP_KEY),
          fetchMostActive(FMP_KEY),
        ]);
        setGainers(g);
        setLosers(l);
        setMostActive(a);
        setCachedTrending({ gainers: g, losers: l, mostActive: a });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "-apple-system, Inter, sans-serif", background: "#FAFBFF", minHeight: "100vh" }}>
      <h1 style={{ color: "#0E1F4B", fontSize: 26, marginBottom: 4 }}>Trending Today</h1>
      <p style={{ color: "#8A93A6", fontSize: 14, marginBottom: 24 }}>
        Market snapshot — biggest gainers, losers, and most active stocks today.
      </p>

      {loading && <p style={{ color: "#8A93A6" }}>Loading trending stocks...</p>}
      {error && <p style={{ color: "#FF6B6B" }}>{error}</p>}

      {gainers.length > 0 && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <StockList title="🔥 Top Gainers" stocks={gainers} />
          <StockList title="📉 Top Losers" stocks={losers} />
          <StockList title="⚡ Most Active" stocks={mostActive} />
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 13, color: "#8A93A6" }}>
        Want to dig deeper into any of these? <Link to="/compare" style={{ color: "#4C5FEF" }}>Compare their fundamentals →</Link>
      </p>
    </div>
  );
}