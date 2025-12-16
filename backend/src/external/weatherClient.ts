import { fetchJson, type FetchLike } from "./http.js";

export type WeatherQuery =
  | { city: string }
  | { lat: number; lon: number };

export type WeatherSummary = {
  location: { city?: string; latitude: number; longitude: number };
  current: { temperatureC: number | null; time: string | null; windKph: number | null; weatherCode: number | null };
  nextHours: { time: string; temperatureC: number }[];
  source: "open-meteo";
};

type GeoResp = { results?: { name: string; latitude: number; longitude: number; country?: string }[] };
type ForecastResp = {
  current_weather?: { temperature?: number; time?: string; windspeed?: number; weathercode?: number };
  hourly?: { time?: string[]; temperature_2m?: number[] };
};

export class WeatherClient {
  constructor(private fetchImpl: FetchLike = fetch) {}

  async resolveCity(city: string): Promise<{ name: string; latitude: number; longitude: number } | null> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const data = await fetchJson(this.fetchImpl, url, 6500) as GeoResp;
    const r = data.results?.[0];
    if (!r) return null;
    return { name: r.name, latitude: r.latitude, longitude: r.longitude };
  }

  async forecast(q: WeatherQuery): Promise<WeatherSummary> {
    let latitude: number;
    let longitude: number;
    let cityName: string | undefined;

    if ("city" in q) {
      const r = await this.resolveCity(q.city);
      if (!r) {
        return {
          source: "open-meteo",
          location: { city: q.city, latitude: 0, longitude: 0 },
          current: { temperatureC: null, time: null },
          nextHours: [],
        };
      }
      latitude = r.latitude;
      longitude = r.longitude;
      cityName = q.city;
    } else {
      latitude = q.lat;
      longitude = q.lon;
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(String(latitude))}` +
      `&longitude=${encodeURIComponent(String(longitude))}` +
      `&hourly=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&current_weather=true&forecast_days=1&timezone=auto`;

    const data = await fetchJson(this.fetchImpl, url, 6500) as ForecastResp;

    const times = data.hourly?.time ?? [];
    const temps = data.hourly?.temperature_2m ?? [];
    const pairs: { time: string; temperatureC: number }[] = [];
    for (let i = 0; i < Math.min(times.length, temps.length, 8); i++) {
      pairs.push({ time: String(times[i]), temperatureC: Number(temps[i]) });
    }

    return {
      source: "open-meteo",
      location: { city: cityName, latitude, longitude },
      current: {
        temperatureC: data.current_weather?.temperature ?? null,
        time: data.current_weather?.time ?? null,
      },
      nextHours: pairs,
    };
  }
}
