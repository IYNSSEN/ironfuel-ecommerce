import { Router } from "express";
import { all } from "../db.js";

export const publicRoutes = Router();

publicRoutes.get("/categories", (_req, res) => {
  const rows = all<any>(
    "SELECT id, name, type, description, created_at, color FROM categories WHERE is_active = 1 ORDER BY created_at DESC"
  );
  return res.json(rows.map(c => ({
    id: c.id, name: c.name, type: c.type, description: c.description, createdAt: c.created_at, color: c.color
  })));
});

publicRoutes.get("/products", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 6), 1), 24);
  const rows = all<any>(`
    SELECT p.id, p.name, p.price_cents, p.description, p.created_at, p.stock, p.image_url,
           c.name AS category_name, c.color AS category_color
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.created_at DESC
    LIMIT ?
  `, [limit]);

  return res.json(rows.map(r => ({
    id: r.id, name: r.name, priceCents: r.price_cents, description: r.description, createdAt: r.created_at,
    stock: r.stock ?? 0, imageUrl: r.image_url ?? "", categoryName: r.category_name ?? null, categoryColor: r.category_color ?? null
  })));
});
