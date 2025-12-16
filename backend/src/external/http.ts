export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class ExternalTimeoutError extends Error {
  constructor(message = "External request timeout") {
    super(message);
    this.name = "ExternalTimeoutError";
  }
}

export class ExternalUpstreamError extends Error {
  status: number;
  constructor(status: number, message = "External upstream error") {
    super(message);
    this.name = "ExternalUpstreamError";
    this.status = status;
  }
}

export async function fetchJson(fetchImpl: FetchLike, url: string, timeoutMs = 6500) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: controller.signal, headers: { "Accept": "application/json" } });
    if (!res.ok) throw new ExternalUpstreamError(res.status, `Upstream returned ${res.status}`);
    return await res.json();
  } catch (e: any) {
    if (e?.name === "AbortError") throw new ExternalTimeoutError();
    throw e;
  } finally {
    clearTimeout(t);
  }
}
