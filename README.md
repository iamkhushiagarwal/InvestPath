# Company Fundamentals Comparator

A research tool that compares public companies side-by-side using their financial
fundamentals — valuation, growth, profitability, and financial health — and produces
a relative composite score. Built as a learning project to understand both the stock
market and full-stack app development, then extended into a portfolio-ready tool.

**This is a research aid, not investment advice.** Scores are relative between the
companies entered in a single comparison — they are not absolute ratings.

## Why I built this

I wanted to understand how real quantitative/fundamental analysis works — not just
use an existing tool, but build the scoring logic myself and understand every
decision behind it. This project started as a way to learn stock market basics and
became a full end-to-end app: live financial data, a custom scoring formula, and a
UI to explore it.

## How the scoring works

For each company, 8 metrics are pulled across 4 categories:

| Category | Metrics | Weight (default) |
|---|---|---|
| Valuation | P/E ratio, P/B ratio | 30% |
| Growth | Revenue growth (YoY), EPS growth (YoY) | 25% |
| Profitability | ROE, Free Cash Flow, Net Margin | 25% |
| Financial Health | Debt-to-Equity | 20% |

Each metric is converted to a **0–100 percentile score relative to the other
companies being compared** (min-max normalization), with "lower is better" metrics
(P/E, P/B, D/E) inverted. Category scores are averaged, then combined into a
composite score using the weights above — which the user can adjust live via
sliders.

This approach is based on how real quant/fundamental screening tools (e.g.
Stockopedia's StockRanks) combine multiple normalized factors rather than relying
on a single ratio.

## Known limitations

- **Scores are relative, not absolute.** Comparing the same company against a
  different peer set will produce different scores. This is intentional, but worth
  understanding — it's not a fixed "grade."
- **Small comparison sets can produce ties.** With only 2 companies and 2 metrics
  per category, it's mathematically possible for both companies to land exactly at
  a 50/50 tie in a category, even with real, different underlying data (each company
  "wins" one metric and "loses" the other). This becomes far less likely with 3+
  companies.
- **Cross-sector comparisons are flagged, not adjusted.** The app warns when
  comparing companies from different sectors (since valuation norms differ by
  industry), but does not currently apply sector-specific benchmarks.
- **Category weights aren't auto-normalized.** If the 4 weight sliders don't sum to
  100%, the composite score may not land cleanly within 0–100. A future version
  could auto-adjust the other sliders when one changes.
- **In-memory cache only.** Cached data resets on page refresh — there's no
  persistent storage.

## Tech stack

- React + Vite
- [Financial Modeling Prep API](https://financialmodelingprep.com) for financial data
- No external UI/charting libraries — sparklines and score bars are hand-built SVG

## Running it locally

```bash
npm install
npm run dev
```

You'll need a free API key from [financialmodelingprep.com](https://financialmodelingprep.com)
(free tier: 250 requests/day). Paste it into the app's API key field — it's kept only
in memory and never stored or transmitted anywhere else.

## Project structure

```
src/
  api/
    fmpClient.js       # All external API calls
  scoring/
    scoreEngine.js      # Metric extraction + percentile/weighting formula
  components/
    LedgerBar.jsx
    CompanyCard.jsx
    Sparkline.jsx
  App.jsx               # State, data flow, UI composition
```

## Screenshots
\\