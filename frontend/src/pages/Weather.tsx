import React, { useState } from "react";
import { api, ApiError } from "../api";

function iconForCode(code: number | null) {
  if (code == null) return "🌡️";
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 86) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}


export default function WeatherPage() {
  const [city, setCity] = useState("Warsaw");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  async function fetchByCity() {
    setErr(""); setData(null); setLoading(true);
    try {
      const d = await api.externalWeather({ city });
      setData(d);
    } catch (e: any) {
      const msg = e instanceof ApiError ? `HTTP ${e.status}: ${e.data?.message ?? "Error"}` : "Error";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchByCoords() {
    setErr(""); setData(null); setLoading(true);
    try {
      const d = await api.externalWeather({ lat: Number(lat), lon: Number(lon) });
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
      <h2 style={{ margin: "6px 0 8px" }}>Weather (Open‑Meteo)</h2>
      <p className="small">Integracja z zewnętrznym REST API. Endpoint: <code>/external/weather</code></p>

      <div className="grid2">
        <div className="panel">
          <h3>By city</h3>
          <div className="field">
            <label>city</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Warsaw" />
          </div>
          <button className="btn btn-primary" onClick={fetchByCity} disabled={loading}>Pobierz pogodę</button>

          <hr className="hr" />

          <h3>By coordinates</h3>
          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <label>lat</label>
              <input value={lat} onChange={e => setLat(e.target.value)} placeholder="52.23" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>lon</label>
              <input value={lon} onChange={e => setLon(e.target.value)} placeholder="21.01" />
            </div>
          </div>
          <button className="btn" onClick={fetchByCoords} disabled={loading}>Fetch by coords</button>

          {loading ? <p className="small" style={{ marginTop: 10 }}>Ładowanie...</p> : null}
          {err ? <p className="err" style={{ marginTop: 10 }}>{err}</p> : null}
        </div>

        <div className="panel">
          <h3>Result</h3>
          {!data ? null : (
            <div className="row" style={{ gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <div className="panel" style={{ minWidth: 220 }}>
                <h4 style={{ marginTop: 0 }}>Current conditions</h4>
                <div style={{ fontSize: 44, lineHeight: 1 }}>
                  {iconForCode(data.current?.weatherCode ?? null)}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  {data.current?.temperatureC ?? "-"}°C
                </div>
                <div className="small">
                  Wind: {data.current?.windKph ?? "-"} km/h · Time: {data.current?.time ?? "-"}
                </div>
              </div>
            </div>
          )}

          {!data ? <p className="small">No data yet.</p> : (
            <>
              <div className="badge" style={{ marginBottom: 10 }}>
                <span className="dot" /> {data.location?.city ?? "coords"} · {data.location?.latitude}, {data.location?.longitude}
              </div>
              <p className="small">
                Current: <b>{data.current?.temperatureC ?? "-"}°C</b> ({data.current?.time ?? "-"})
              </p>
              <table className="table">
                <thead>
                  <tr><th>time</th><th>temp °C</th></tr>
                </thead>
                <tbody>
                  {(data.nextHours ?? []).map((x: any, i: number) => (
                    <tr key={i}><td>{x.time}</td><td>{x.temperatureC}</td></tr>
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
