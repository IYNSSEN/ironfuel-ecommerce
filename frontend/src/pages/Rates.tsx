import React, { useState } from "react";
import { api, ApiError } from "../api";

export default function RatesPage() {
  const [base, setBase] = useState("EUR");
  const [symbols, setSymbols] = useState("PLN,USD,GBP");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  async function fetchRates() {
    setErr(""); setData(null); setLoading(true);
    try {
      const d = await api.externalRates(base, symbols);
      setData(d);
    } catch (e: any) {
      const msg = e instanceof ApiError ? `HTTP ${e.status}: ${e.data?.message ?? "Error"}` : "Error";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ padding: "18px 0 50px" }}>
      <h2 style={{ margin: "6px 0 8px" }}>Currency rates (exchangerate.host)</h2>
      <p className="small">Endpoint: <code>/external/rates</code></p>

      <div className="grid2">
        <div className="panel">
          <div className="field">
            <label>base currency</label>
            <input value={base} onChange={e => setBase(e.target.value.toUpperCase())} placeholder="EUR" maxLength={3} />
          </div>
          <div className="field">
            <label>symbols</label>
            <input value={symbols} onChange={e => setSymbols(e.target.value.toUpperCase())} placeholder="PLN,USD,GBP" />
          </div>
          <button className="btn btn-primary" onClick={fetchRates} disabled={loading}>Pobierz kursy</button>

          {loading ? <p className="small" style={{ marginTop: 10 }}>Ładowanie...</p> : null}
          {err ? <p className="err" style={{ marginTop: 10 }}>{err}</p> : null}
        </div>

        <div className="panel">
          <h3>Result</h3>
          {!data ? <p className="small">No data yet.</p> : (
            <>
              <div className="badge" style={{ marginBottom: 10 }}>
                <span className="dot" /> base {data.base} · date {data.date ?? "-"}
              </div>
              <table className="table">
                <thead>
                  <tr><th>currency</th><th>rate</th></tr>
                </thead>
                <tbody>
                  {(data.rates ?? []).map((x: any) => (
                    <tr key={x.symbol}><td><b>{x.symbol}</b></td><td>{x.rate}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
