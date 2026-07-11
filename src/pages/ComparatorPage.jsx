import { useState } from "react";
import { fetchCompanyRaw, fetchCompanyProfile } from "../api/fmpClient";
import CompanyCard from "../components/CompanyCard";
import { extractMetrics, scoreCompanies } from "../scoring/scoreEngine";
import { FMP_KEY } from "../config";

export default function ComparatorPage() {
  const [tickers, setTickers] = useState(["AAPL", "MSFT"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [cache, setCache] = useState({});
  const [weights, setWeights] = useState({
    valuation: 30,
    growth: 25,
    profitability: 25,
    health: 20,
  });

  const updateTicker = (index, value) => {
    const updated = [...tickers];
    updated[index] = value;
    setTickers(updated);
  };

  const updateWeight = (key, value) => {
    setWeights({ ...weights, [key]: Number(value) });
  };

  const getCachedOrFetch = async (ticker, cacheObj) => {
    const cacheKey = `raw:${ticker}`;
    if (cacheObj[cacheKey]) return cacheObj[cacheKey];
    const data = await fetchCompanyRaw(ticker, FMP_KEY);
    cacheObj[cacheKey] = data;
    return data;
  };

  const getCachedOrFetchProfile = async (ticker, cacheObj) => {
    const cacheKey = `profile:${ticker}`;
    if (cacheObj[cacheKey]) return cacheObj[cacheKey];
    const data = await fetchCompanyProfile(ticker, FMP_KEY);
    cacheObj[cacheKey] = data;
    return data;
  };

  const addTicker = () => {
    if (tickers.length >= 6) return;
    setTickers([...tickers, ""]);
  };

  const removeTicker = (index) => {
    setTickers(tickers.filter((_, i) => i !== index));
  };

  const cleanTickersForSkeleton = () => tickers.filter((t) => t.trim() !== "");

  const handleCompare = async () => {
    setError("");
    setResults(null);

    const cleanTickers = tickers.map((t) => t.trim()).filter((t) => t !== "");
    if (cleanTickers.length < 2) {
      setError("Enter at least 2 tickers.");
      return;
    }

    setLoading(true);
    try {
      const workingCache = { ...cache };

      const rawSettled = await Promise.allSettled(
        cleanTickers.map((t) => getCachedOrFetch(t.toUpperCase(), workingCache))
      );
      const profileSettled = await Promise.allSettled(
        cleanTickers.map((t) => getCachedOrFetchProfile(t.toUpperCase(), workingCache))
      );

      setCache(workingCache);

      const rawResults = rawSettled
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      const failedTickers = cleanTickers.filter(
        (t, i) => rawSettled[i].status === "rejected"
      );

      const profiles = profileSettled
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      if (failedTickers.length > 0) {
        setError(
          `Couldn't fetch data for: ${failedTickers.join(", ")}. Showing results for the rest.`
        );
      }

      const metrics = rawResults.map(extractMetrics);
      if (metrics.length === 0) {
        setError("No valid data could be retrieved. Check your tickers.");
        setLoading(false);
        return;
      }

      const decimalWeights = {
        valuation: weights.valuation / 100,
        growth: weights.growth / 100,
        profitability: weights.profitability / 100,
        health: weights.health / 100,
      };
      const scored = scoreCompanies(metrics, decimalWeights);

      const merged = scored.map((s) => {
        const profile = profiles.find((p) => p.ticker === s.ticker);
        return { ...s, sector: profile?.sector, industry: profile?.industry, companyName: profile?.companyName };
      });

      setResults(merged);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "-apple-system, Inter, sans-serif", background: "#FAFBFF", minHeight: "100vh" }}>
      <h1 style={{ color: "#0E1F4B", fontSize: 26, marginBottom: 4 }}>Company Fundamentals Comparator</h1>
      <p style={{ color: "#8A93A6", fontSize: 14, marginBottom: 28 }}>
        Research aid, not investment advice. Scores are relative between the companies entered.
      </p>

      {tickers.map((t, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <input
            placeholder={`Ticker ${i + 1}`}
            value={t}
            onChange={(e) => updateTicker(i, e.target.value)}
            style={{ padding: 8, width: 200 }}
          />
          <button onClick={() => removeTicker(i)} style={{ marginLeft: 8 }}>
            Remove
          </button>
        </div>
      ))}

      <button onClick={addTicker}>+ Add company</button>
      <br />
      <br />

      <div style={{ marginBottom: 20, maxWidth: 320 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0E1F4B", marginBottom: 10 }}>
          Category Weights (total: {weights.valuation + weights.growth + weights.profitability + weights.health}%)
        </div>
        {["valuation", "growth", "profitability", "health"].map((key) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8A93A6" }}>
              <span style={{ textTransform: "capitalize" }}>{key}</span>
              <span>{weights[key]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[key]}
              onChange={(e) => updateWeight(key, e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        ))}
      </div>

      <button onClick={handleCompare} disabled={loading}>
        {loading ? "Fetching..." : "Compare"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!results && !loading && (
        <div style={{ marginTop: 40, padding: 32, textAlign: "center", color: "#8A93A6", border: "1px dashed #E4E8F5", borderRadius: 16 }}>
          Enter at least 2 tickers, then click Compare to see fundamentals side by side.
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", gap: 20, marginTop: 30, flexWrap: "wrap" }}>
          {cleanTickersForSkeleton().map((_, i) => (
            <div key={i} style={{ background: "#FFFFFF", borderRadius: 20, padding: 28, minWidth: 260, flex: 1, boxShadow: "0 8px 24px rgba(14,31,75,0.05)" }}>
              <div style={{ height: 14, width: "50%", background: "#F0F2FA", borderRadius: 6, marginBottom: 14 }} />
              <div style={{ height: 40, width: "70%", background: "#F0F2FA", borderRadius: 8, marginBottom: 20 }} />
              <div style={{ height: 8, width: "100%", background: "#F0F2FA", borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 8, width: "100%", background: "#F0F2FA", borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 8, width: "100%", background: "#F0F2FA", borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 8, width: "100%", background: "#F0F2FA", borderRadius: 4 }} />
            </div>
          ))}
        </div>
      )}

      {results && (
        <div style={{ marginTop: 30 }}>
          {new Set(results.map((r) => r.sector)).size > 1 && (
            <p style={{ color: "#b45309", fontWeight: "bold", marginBottom: 16 }}>
              ⚠️ Comparing companies across different sectors (
              {[...new Set(results.map((r) => r.sector))].join(", ")}) — valuation metrics may
              not be directly comparable.
            </p>
          )}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {results.map((r) => (
              <CompanyCard key={r.ticker} company={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}