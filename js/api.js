// api.js — Frankfurter exchange rate API wrappers

const BASE_URL = 'https://api.frankfurter.dev/v1';

export async function getLatestRate(base, symbol) {
  const res = await fetch(`${BASE_URL}/latest?base=${base}&symbols=${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch latest rate (${res.status})`);
  return res.json();
}

export async function getHistoricalRate(base, symbol, date) {
  const res = await fetch(`${BASE_URL}/${date}?base=${base}&symbols=${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch historical rate (${res.status})`);
  return res.json();
}

export async function getRateHistory(base, symbol, from, to) {
  const res = await fetch(`${BASE_URL}/${from}..${to}?base=${base}&symbols=${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch rate history (${res.status})`);
  return res.json();
}

export async function getCurrencies() {
  const res = await fetch(`${BASE_URL}/currencies`);
  if (!res.ok) throw new Error(`Failed to fetch currency list (${res.status})`);
  return res.json();
}

export function getDateRangeFor(range) {
  const to = new Date();
  const from = new Date(to);

  switch (range) {
    case '1D': from.setDate(to.getDate() - 1); break;
    case '1W': from.setDate(to.getDate() - 7); break;
    case '1M': from.setMonth(to.getMonth() - 1); break;
    case '3M': from.setMonth(to.getMonth() - 3); break;
    case '1Y': from.setFullYear(to.getFullYear() - 1); break;
    case '5Y': from.setFullYear(to.getFullYear() - 5); break;
    default: from.setMonth(to.getMonth() - 1);
  }

  const fmt = (d) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}
