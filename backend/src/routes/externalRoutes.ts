import { Router } from "express";
import { RatesClient } from "../external/ratesClient.js";
import { WeatherClient } from "../external/weatherClient.js";
import { ExternalTimeoutError, ExternalUpstreamError } from "../external/http.js";

export const externalRoutes = Router();

function badRequest(res: any, message: string) {
  return res.status(400).json({ message });
}
function badGateway(res: any, message: string) {
  return res.status(502).json({ message });
}
function unavailable(res: any, message: string) {
  return res.status(503).json({ message });
}

// GET /external/weather?city=Warsaw
// or /external/weather?lat=52.23&lon=21.01
externalRoutes.get("/weather", async (req, res) => {
  const city = (req.query.city as string | undefined)?.trim();
  const latRaw = req.query.lat as string | undefined;
  const lonRaw = req.query.lon as string | undefined;

  const client = new WeatherClient();

  try {
    if (city) {
      const data = await client.forecast({ city });
      if (data.current.temperatureC === null) {
        return badRequest(res, "Unknown city (geocoding returned no results)");
      }
      return res.status(200).json(data);
    }

    if (latRaw && lonRaw) {
      const lat = Number(latRaw);
      const lon = Number(lonRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return badRequest(res, "Invalid lat/lon");
      const data = await client.forecast({ lat, lon });
      return res.status(200).json(data);
    }

    return badRequest(res, "Provide either city or lat+lon");
  } catch (e: any) {
    if (e instanceof ExternalTimeoutError) return unavailable(res, "Open-Meteo timeout (try again)");
    if (e instanceof ExternalUpstreamError) return badGateway(res, "Open-Meteo error (upstream)");
    return unavailable(res, "Weather service unavailable");
  }
});

// GET /external/rates?base=EUR&symbols=PLN,USD
externalRoutes.get("/rates", async (req, res) => {
  const base = String(req.query.base ?? "").trim().toUpperCase();
  const symbolsRaw = String(req.query.symbols ?? "").trim().toUpperCase();

  if (!base || !/^[A-Z]{3}$/.test(base)) return badRequest(res, "Invalid base currency (use 3-letter code like EUR)");
  const symbols = symbolsRaw ? symbolsRaw.split(",").map(s => s.trim()).filter(Boolean) : ["PLN", "USD", "GBP"];
  if (symbols.some(s => !/^[A-Z]{3}$/.test(s))) return badRequest(res, "Invalid symbols (use comma-separated 3-letter codes)");

  const client = new RatesClient();
  try {
    const data = await client.latest(base, symbols);
    return res.status(200).json(data);
  } catch (e: any) {
    if (e instanceof ExternalTimeoutError) return unavailable(res, "Rates API timeout (try again)");
    if (e instanceof ExternalUpstreamError) return badGateway(res, "Rates API error (upstream)");
    return unavailable(res, "Rates service unavailable");
  }
});
