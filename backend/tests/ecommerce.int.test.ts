import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { migrate } from "../src/migrate.js";
import { authRoutes } from "../src/routes/authRoutes.js";
import { meRoutes } from "../src/routes/meRoutes.js";
import { cartRoutes } from "../src/routes/cartRoutes.js";
import { checkoutRoutes } from "../src/routes/checkoutRoutes.js";
import { orderRoutes } from "../src/routes/orderRoutes.js";
import { productRoutes } from "../src/routes/productRoutes.js";
import { categoryRoutes } from "../src/routes/categoryRoutes.js";
import { requireAuth } from "../src/middleware/authMiddleware.js";
import { requireAdmin } from "../src/middleware/roleMiddleware.js";
import { one, run } from "../src/db.js";

migrate();

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", authRoutes);
  app.use("/api", meRoutes);
  app.use("/api/cart", requireAuth, cartRoutes);
  app.use("/api/checkout", requireAuth, checkoutRoutes);
  app.use("/api/orders", requireAuth, orderRoutes);
  app.use("/api/admin/products", requireAuth, requireAdmin, productRoutes);
  app.use("/api/admin/categories", requireAuth, requireAdmin, categoryRoutes);
  return app;
}

async function ensureAdmin() {
  const exists = one<{ id: number }>("SELECT id FROM users WHERE login='admin'");
  if (!exists) {
    const hash = bcrypt.hashSync("admin12345", 10);
    run("INSERT INTO users(login, password_hash, role) VALUES ('admin', ?, 'ADMIN')", [hash]);
  }
}

describe("Ecommerce + auth minimal", () => {
  it("register -> login -> cart is accessible; admin endpoints forbidden for USER", async () => {
    const app = makeApp();
    const login = "u_" + Date.now();
    const password = "password123";

    await request(app).post("/api/register").send({ login, password }).expect(201);
    const loginRes = await request(app).post("/api/login").send({ login, password }).expect(200);
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeTruthy();

    await request(app).get("/api/cart").set("Cookie", cookies).expect(200);
    await request(app).get("/api/admin/products").set("Cookie", cookies).expect(403);
  });

  it("admin can access admin products", async () => {
    await ensureAdmin();
    const app = makeApp();

    const loginRes = await request(app).post("/api/login").send({ login: "admin", password: "admin12345" }).expect(200);
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeTruthy();

    await request(app).get("/api/admin/products").set("Cookie", cookies).expect(200);
  });
});
