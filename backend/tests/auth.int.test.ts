import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { migrate } from "../src/migrate.js";
import { authRoutes } from "../src/routes/authRoutes.js";
import { cartRoutes } from "../src/routes/cartRoutes.js";
import { requireAuth } from "../src/middleware/authMiddleware.js";

migrate();

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", authRoutes);
  app.use("/api/cart", requireAuth, cartRoutes);
  return app;
}

describe("Auth integration (cookie)", () => {
  it("without cookie returns 401", async () => {
    const app = makeApp();
    await request(app).get("/api/cart").expect(401);
  });
});
