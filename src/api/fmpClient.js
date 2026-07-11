const BASE = "https://financialmodelingprep.com/stable";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCompanyRaw(ticker, apiKey) {
  const urls = {
    income: `${BASE}/income-statement?symbol=${ticker}&limit=5&apikey=${apiKey}`,
    ratios: `${BASE}/ratios?symbol=${ticker}&limit=1&apikey=${apiKey}`,
    keyMetrics: `${BASE}/key-metrics?symbol=${ticker}&limit=1&apikey=${apiKey}`,
    cashFlow: `${BASE}/cash-flow-statement?symbol=${ticker}&limit=2&apikey=${apiKey}`,
  };

  const [income, ratios, keyMetrics, cashFlow] = await Promise.all(
    Object.values(urls).map(fetchJson)
  );

  if (!income?.length || !ratios?.length || !keyMetrics?.length || !cashFlow?.length) {
    throw new Error(`No data returned for "${ticker}". Check the ticker symbol.`);
  }

  return { ticker, income, ratios, keyMetrics, cashFlow };
}
export async function fetchCompanyProfile(ticker, apiKey) {
  const url = `${BASE}/profile?symbol=${ticker}&apikey=${apiKey}`;
  const data = await fetchJson(url);
  if (!data?.length) {
    throw new Error(`No profile data for "${ticker}".`);
  }
  return {
    ticker,
    sector: data[0].sector || "Unknown",
    industry: data[0].industry || "Unknown",
    companyName: data[0].companyName || ticker,
  };
}
export async function fetchGainers(apiKey) {
  return fetchJson(`${BASE}/biggest-gainers?apikey=${apiKey}`);
}

export async function fetchLosers(apiKey) {
  return fetchJson(`${BASE}/biggest-losers?apikey=${apiKey}`);
}

export async function fetchMostActive(apiKey) {
  return fetchJson(`${BASE}/most-actives?apikey=${apiKey}`);
}