import { Router } from "express";
import { all, one } from "../db.js";

export const orderRoutes = Router();

orderRoutes.get("/", (req, res) => {
  const userId = req.user!.id;
  const rows = all<any>(
    "SELECT id, total_cents, status, created_at FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
  return res.json(rows.map(r => ({
    id: r.id,
    totalCents: r.total_cents,
    status: r.status,
    createdAt: r.created_at
  })));
});

orderRoutes.get("/:id", (req, res) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: "Invalid id" });

  const order = one<any>(
    "SELECT id, total_cents, status, created_at FROM orders WHERE id=? AND user_id=?",
    [id, userId]
  );
  if (!order) return res.status(404).json({ message: "Not found" });

  const items = all<any>(`
    SELECT oi.product_id, oi.qty, oi.unit_price_cents,
           p.name, p.image_url
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
  `, [id]);

  return res.json({
    id: order.id,
    totalCents: order.total_cents,
    status: order.status,
    createdAt: order.created_at,
    items: items.map(i => ({
      productId: i.product_id,
      name: i.name,
      imageUrl: i.image_url ?? "",
      qty: i.qty,
      unitPriceCents: i.unit_price_cents,
      lineTotalCents: i.unit_price_cents * i.qty
    }))
  });
});
