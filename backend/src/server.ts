import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { migrate } from "./migrate.js";
import { seedIfEmpty } from "./seed.js";
import { authRoutes } from "./routes/authRoutes.js";
import { meRoutes } from "./routes/meRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";
import { publicRoutes } from "./routes/publicRoutes.js";
import { externalRoutes } from "./routes/externalRoutes.js";
import { cartRoutes } from "./routes/cartRoutes.js";
import { checkoutRoutes } from "./routes/checkoutRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { requireAdmin } from "./middleware/roleMiddleware.js";

migrate();
seedIfEmpty();

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/health", (_req, res) => res.json({ ok: true }));

// Public catalog (read-only)
app.use("/public", publicRoutes);

// External integrations (REST API)
app.use("/external", externalRoutes);

// Auth + session
app.use("/api", authRoutes);
app.use("/api", meRoutes);

// Customer features
app.use("/api/cart", requireAuth, cartRoutes);
app.use("/api/checkout", requireAuth, checkoutRoutes);
app.use("/api/orders", requireAuth, orderRoutes);

// Admin inventory CRUD (2 encje CRUD)
app.use("/api/admin/products", requireAuth, requireAdmin, productRoutes);
app.use("/api/admin/categories", requireAuth, requireAdmin, categoryRoutes);

app.use((_req, res) => res.status(404).json({ message: "Not found" }));

app.listen(config.port, () => {
  console.log(`✅ Backend listening on http://localhost:${config.port}`);
});
