import { useState, useEffect } from "react";
import {
  getWatchlist,
  removeFromWatchlist,
  getCachedCompanyData,
  setCachedCompanyData,
} from "../data/watchlistStorage";
import { fetchCompanyRaw, fetchCompanyProfile } from "../api/fmpClient";
import { extractMetrics, scoreCompanies } from "../scoring/scoreEngine";
import CompanyCard from "../components/CompanyCard";
import { FMP_KEY } from "../config";
import { Link } from "react-router-dom";

export default function WatchlistPage() {
  const [tickers, setTickers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTickers(getWatchlist());
  }, []);

  const loadWatchlistData = async () => {
    setError("");
    setResults(null);
    if (tickers.length === 0) return;

    setLoading(true);
    try {
      const rawResults = [];
      const profiles = [];
      const tickersNeedingFetch = [];

      for (const t of tickers) {
        const cached = getCachedCompanyData(t);
        if (cached) {
          rawResults.push(cached.raw);
          profiles.push(cached.profile);
        } else {
          tickersNeedingFetch.push(t);
        }
      }

      if (tickersNeedingFetch.length > 0) {
        const rawSettled = await Promise.allSettled(
          tickersNeedingFetch.map((t) => fetchCompanyRaw(t, FMP_KEY))
        );
        const profileSettled = await Promise.allSettled(
          tickersNeedingFetch.map((t) => fetchCompanyProfile(t, FMP_KEY))
        );

        tickersNeedingFetch.forEach((t, i) => {
          if (rawSettled[i].status === "fulfilled" && profileSettled[i].status === "fulfilled") {
            const raw = rawSettled[i].value;
            const profile = profileSettled[i].value;
            rawResults.push(raw);
            profiles.push(profile);
            setCachedCompanyData(t, { raw, profile });
          }
        });
      }

      if (rawResults.length === 0) {
        setError("Couldn't load data for your watchlist companies.");
        setLoading(false);
        return;
      }

      const metrics = rawResults.map(extractMetrics);
      const scored = scoreCompanies(metrics);

      const merged = scored.map((s) => {
        const profile = profiles.find((p) => p.ticker === s.ticker);
        return { ...s, sector: profile?.sector, industry: profile?.industry };
      });

      setResults(merged);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (ticker) => {
    const updated = removeFromWatchlist(ticker);
    setTickers(updated);
    setResults((prev) => (prev ? prev.filter((r) => r.ticker !== ticker) : prev));
  };

  return (
    <div style={{ padding: 40, fontFamily: "-apple-system, Inter, sans-serif", background: "#FAFBFF", minHeight: "100vh" }}>
      <h1 style={{ color: "#0E1F4B", fontSize: 26, marginBottom: 4 }}>My Watchlist</h1>
      <p style={{ color: "#8A93A6", fontSize: 14, marginBottom: 24 }}>
        Companies you've saved from the Comparator. Data is cached for 24 hours to limit API usage.
      </p>

      {tickers.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: "#8A93A6", border: "1px dashed #E4E8F5", borderRadius: 16 }}>
          No saved companies yet. Star a company on the{" "}
          <Link to="/compare" style={{ color: "#4C5FEF" }}>Comparator page</Link> to add it here.
        </div>
      )}

      {tickers.length > 0 && !results && (
        <button onClick={loadWatchlistData} disabled={loading}>
          {loading ? "Loading..." : `Load data for ${tickers.length} saved companies`}
        </button>
      )}

      {error && <p style={{ color: "#FF6B6B", marginTop: 12 }}>{error}</p>}

      {results && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 24 }}>
          {results.map((r) => (
            <div key={r.ticker} style={{ position: "relative" }}>
              <CompanyCard company={r} />
              <button
                onClick={() => handleRemove(r.ticker)}
                style={{ marginTop: 8, fontSize: 12, color: "#FF6B6B", background: "none", border: "none", cursor: "pointer" }}
              >
                Remove from watchlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}