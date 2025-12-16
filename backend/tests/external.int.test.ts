import request from "supertest";
import express from "express";
import { externalRoutes } from "../src/routes/externalRoutes.js";

function makeApp() {
  const app = express();
  app.use("/external", externalRoutes);
  return app;
}

describe("External API integrations", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch as any;
  });

  it("GET /external/rates returns mapped rates (host)", async () => {
    globalThis.fetch = (async (url: any) => {
      const u = String(url);
      if (u.includes("api.exchangerate.host/latest")) {
        return new Response(JSON.stringify({ base: "EUR", date: "2025-12-16", rates: { PLN: 4.33, USD: 1.05 } }), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    }) as any;

    const app = makeApp();
    const res = await request(app).get("/external/rates?base=EUR&symbols=PLN,USD").expect(200);
    expect(res.body).toHaveProperty("base", "EUR");
    expect(res.body.rates?.length).toBe(2);
  });

  it("GET /external/rates falls back to frankfurter when host returns empty", async () => {
    globalThis.fetch = (async (url: any) => {
      const u = String(url);
      if (u.includes("api.exchangerate.host/latest")) {
        return new Response(JSON.stringify({ base: "EUR", date: "2025-12-16", rates: {} }), { status: 200 });
      }
      if (u.includes("api.frankfurter.app/latest")) {
        return new Response(JSON.stringify({ base: "EUR", date: "2025-12-16", rates: { PLN: 4.33 } }), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    }) as any;

    const app = makeApp();
    const res = await request(app).get("/external/rates?base=EUR&symbols=PLN").expect(200);
    expect(res.body.rates?.length).toBe(1);
    expect(res.body.rates[0].symbol).toBe("PLN");
  });
});
