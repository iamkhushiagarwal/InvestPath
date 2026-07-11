// Turn raw API data into the numbers we actually care about (growth, FCF, etc.)
export function extractMetrics(companyRaw) {
  const { ticker, income, ratios, keyMetrics, cashFlow } = companyRaw;

  const [curIncome, prevIncome] = income;
   // Build a clean revenue history array, oldest → newest, for charting
  const revenueHistory = [...income]
    .reverse()
    .map((yearData) => ({
      year: yearData.date?.slice(0, 4) || "?",
      revenue: yearData.revenue,
    }));
  const [curCF, prevCF] = cashFlow;
  const r = ratios[0];
  const km = keyMetrics[0];

  const revenueGrowth = prevIncome?.revenue
    ? ((curIncome.revenue - prevIncome.revenue) / Math.abs(prevIncome.revenue)) * 100
    : 0;

  const epsGrowth = prevIncome?.eps
    ? ((curIncome.eps - prevIncome.eps) / Math.abs(prevIncome.eps)) * 100
    : 0;

  const fcf = (curCF.operatingCashFlow || 0) - Math.abs(curCF.capitalExpenditure || 0);
  console.log(ticker, { revenueGrowth, epsGrowth, pe: r.priceToEarningsRatio, pb: r.priceToBookRatio });

  return {
    ticker,
    revenueHistory,
    pe: r.priceToEarningsRatio ?? null,
    pb: r.priceToBookRatio ?? null,
    de: r.debtToEquityRatio ?? null,
    roe: (km.returnOnEquity ?? r.returnOnEquity ?? 0) * 100,
    revenueGrowth,
    epsGrowth,
    fcf,
    netMargin: (r.netProfitMargin ?? 0) * 100,
  };
}

// Convert one raw value into a 0-100 percentile relative to peers
function percentileScore(value, min, max, invert = false) {
  if (max === min) return 50; // all companies tied on this metric
  let score = ((value - min) / (max - min)) * 100;
  if (invert) score = 100 - score;
  return Math.max(0, Math.min(100, score));
}

function average(nums) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Score every company relative to the whole group
export function scoreCompanies(metricsList, weights = { valuation: 0.3, growth: 0.25, profitability: 0.25, health: 0.2 }) {
  const range = (key) => {
    const vals = metricsList.map((m) => m[key]).filter((v) => v != null);
    return [Math.min(...vals), Math.max(...vals)];
  };

  const [peMin, peMax] = range("pe");
  const [pbMin, pbMax] = range("pb");
  const [deMin, deMax] = range("de");
  const [revMin, revMax] = range("revenueGrowth");
  const [epsMin, epsMax] = range("epsGrowth");
  const [roeMin, roeMax] = range("roe");
  const [fcfMin, fcfMax] = range("fcf");
  const [marginMin, marginMax] = range("netMargin");

  return metricsList.map((m) => {
    const valuationScores = [];
    if (m.pe != null) valuationScores.push(percentileScore(m.pe, peMin, peMax, true));
    if (m.pb != null) valuationScores.push(percentileScore(m.pb, pbMin, pbMax, true));

    const growthScores = [
      percentileScore(m.revenueGrowth, revMin, revMax),
      percentileScore(m.epsGrowth, epsMin, epsMax),
    ];

    const profitabilityScores = [
      percentileScore(m.roe, roeMin, roeMax),
      percentileScore(m.fcf, fcfMin, fcfMax),
      percentileScore(m.netMargin, marginMin, marginMax),
    ];

    const healthScores = [];
    if (m.de != null) healthScores.push(percentileScore(m.de, deMin, deMax, true));

    const categories = {
      valuation: valuationScores.length ? average(valuationScores) : 50,
      growth: average(growthScores),
      profitability: average(profitabilityScores),
      health: healthScores.length ? average(healthScores) : 50,
    };

    const composite =
      weights.valuation * categories.valuation +
      weights.growth * categories.growth +
      weights.profitability * categories.profitability +
      weights.health * categories.health;

    return { ...m, categories, composite };
  });
}