import { Router } from "express";
import { all, one, run, db } from "../db.js";

export const checkoutRoutes = Router();

/**
 * MOCK payment:
 * - creates PAID order immediately
 * - decrements stock
 * - clears cart
 */
checkoutRoutes.post("/", (req, res) => {
  const userId = req.user!.id;

  const cart = all<any>(`
    SELECT ci.product_id, ci.qty, p.price_cents, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
  `, [userId]);

  if (cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  // Validate stock
  for (const it of cart) {
    if ((it.stock ?? 0) < it.qty) {
      return res.status(409).json({ message: `Not enough stock for productId=${it.product_id}` });
    }
  }

  const totalCents = cart.reduce((s: number, it: any) => s + (it.price_cents * it.qty), 0);

  const tx = db.transaction(() => {
    const orderRes = run("INSERT INTO orders(user_id, total_cents, status) VALUES (?, ?, 'PAID')", [userId, totalCents]);
    const orderId = Number(orderRes.lastInsertRowid);

    for (const it of cart) {
      run("INSERT INTO order_items(order_id, product_id, qty, unit_price_cents) VALUES (?, ?, ?, ?)",
        [orderId, it.product_id, it.qty, it.price_cents]);
      run("UPDATE products SET stock = stock - ? WHERE id = ?", [it.qty, it.product_id]);
    }

    run("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    return orderId;
  });

  const orderId = tx();
  return res.status(200).json({ orderId, status: "PAID", totalCents });
});
