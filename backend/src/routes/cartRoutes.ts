import { Router } from "express";
import { all, one, run, db } from "../db.js";

export const cartRoutes = Router();

/**
 * Cart model:
 * - Each user has rows in cart_items(user_id, product_id, qty)
 * - We join products for display
 */

cartRoutes.get("/", (req, res) => {
  const userId = req.user!.id;
  const rows = all<any>(`
    SELECT 
      ci.product_id, ci.qty,
      p.name, p.price_cents, p.stock, p.image_url, p.description,
      c.name AS category_name, c.color AS category_color
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `, [userId]);

  const items = rows.map(r => ({
    productId: r.product_id,
    qty: r.qty,
    name: r.name,
    priceCents: r.price_cents,
    stock: r.stock ?? 0,
    imageUrl: r.image_url ?? "",
    description: r.description ?? "",
    categoryName: r.category_name ?? null,
    categoryColor: r.category_color ?? null,
    lineTotalCents: r.price_cents * r.qty
  }));

  const totalCents = items.reduce((s: number, it: any) => s + it.lineTotalCents, 0);

  return res.json({ items, totalCents });
});

cartRoutes.post("/", (req, res) => {
  const userId = req.user!.id;
  const productId = Number(req.body?.productId);
  const qty = Number(req.body?.qty ?? 1);

  if (!Number.isFinite(productId) || productId <= 0) return res.status(400).json({ message: "Invalid productId" });
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "Invalid qty" });

  const p = one<{ id: number; stock: number }>("SELECT id, stock FROM products WHERE id = ?", [productId]);
  if (!p) return res.status(404).json({ message: "Product not found" });

  // Upsert with qty +=
  const existing = one<{ qty: number }>("SELECT qty FROM cart_items WHERE user_id=? AND product_id=?", [userId, productId]);
  const newQty = (existing?.qty ?? 0) + qty;
  if (newQty > (p.stock ?? 0)) return res.status(409).json({ message: "Not enough stock" });

  if (existing) {
    run("UPDATE cart_items SET qty=? WHERE user_id=? AND product_id=?", [newQty, userId, productId]);
  } else {
    run("INSERT INTO cart_items(user_id, product_id, qty) VALUES (?, ?, ?)", [userId, productId, newQty]);
  }

  return res.status(200).json({ ok: true });
});

cartRoutes.put("/:productId", (req, res) => {
  const userId = req.user!.id;
  const productId = Number(req.params.productId);
  const qty = Number(req.body?.qty);

  if (!Number.isFinite(productId) || productId <= 0) return res.status(400).json({ message: "Invalid productId" });
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "Invalid qty" });

  const p = one<{ id: number; stock: number }>("SELECT id, stock FROM products WHERE id = ?", [productId]);
  if (!p) return res.status(404).json({ message: "Product not found" });
  if (qty > (p.stock ?? 0)) return res.status(409).json({ message: "Not enough stock" });

  const existing = one<{ qty: number }>("SELECT qty FROM cart_items WHERE user_id=? AND product_id=?", [userId, productId]);
  if (!existing) return res.status(404).json({ message: "Item not in cart" });

  run("UPDATE cart_items SET qty=? WHERE user_id=? AND product_id=?", [qty, userId, productId]);
  return res.status(200).json({ ok: true });
});

cartRoutes.delete("/:productId", (req, res) => {
  const userId = req.user!.id;
  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId) || productId <= 0) return res.status(400).json({ message: "Invalid productId" });

  run("DELETE FROM cart_items WHERE user_id=? AND product_id=?", [userId, productId]);
  return res.status(204).send();
});

cartRoutes.delete("/", (req, res) => {
  const userId = req.user!.id;
  run("DELETE FROM cart_items WHERE user_id=?", [userId]);
  return res.status(204).send();
});
