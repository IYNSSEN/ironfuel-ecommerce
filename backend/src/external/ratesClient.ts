import { fetchJson, type FetchLike } from "./http.js";

export type RatesSummary = {
  base: string;
  date: string | null;
  rates: { symbol: string; rate: number }[];
  source: "exchangerate.host" | "frankfurter.app";
};

type HostLatestResp = {
  base?: string;
  date?: string;
  rates?: Record<string, number>;
  success?: boolean;
  error?: any;
};

type FrankfurterLatestResp = {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Record<string, number>;
};

function normalizeRates(symbols: string[], rates: Record<string, number> | undefined) {
  const out: { symbol: string; rate: number }[] = [];
  const r = rates ?? {};
  for (const s of symbols) {
    const v = r[s];
    if (typeof v === "number" && Number.isFinite(v)) out.push({ symbol: s, rate: v });
  }
  return out;
}

export class RatesClient {
  constructor(private fetchImpl: FetchLike = fetch) {}

  async latest(base: string, symbols: string[]): Promise<RatesSummary> {
    const b = base.toUpperCase();
    const syms = symbols.map(s => s.toUpperCase());

    // 1) Try exchangerate.host
    try {
      const url =
        `https://api.exchangerate.host/latest?base=${encodeURIComponent(b)}` +
        `&symbols=${encodeURIComponent(syms.join(","))}`;
      const data = await fetchJson(this.fetchImpl, url) as HostLatestResp;

      const outRates = normalizeRates(syms, data.rates);
      if (outRates.length > 0) {
        return {
          source: "exchangerate.host",
          base: (data.base ?? b).toUpperCase(),
          date: data.date ?? null,
          rates: outRates,
        };
      }
      // If rates are empty, fall through to Frankfurter.
    } catch {
      // Ignore and try fallback.
    }

    // 2) Fallback: Frankfurter (free)
    const url2 =
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(b)}` +
      `&to=${encodeURIComponent(syms.join(","))}`;
    const data2 = await fetchJson(this.fetchImpl, url2) as FrankfurterLatestResp;

    return {
      source: "frankfurter.app",
      base: (data2.base ?? b).toUpperCase(),
      date: data2.date ?? null,
      rates: normalizeRates(syms, data2.rates),
    };
  }
}
