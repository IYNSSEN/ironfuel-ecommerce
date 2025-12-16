import { Router } from "express";
import { all, one, run } from "../db.js";
import { productSchema } from "../validators.js";

export const productRoutes = Router();

productRoutes.get("/", (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

  const where: string[] = [];
  const params: any[] = [];

  if (q) { where.push("p.name LIKE ?"); params.push(`%${q}%`); }
  if (Number.isFinite(categoryId)) { where.push("p.category_id = ?"); params.push(categoryId); }

  const sql = `
    SELECT 
      p.id, p.name, p.price_cents, p.description, p.category_id, p.created_at, p.stock, p.image_url,
      c.name AS category_name, c.color AS category_color
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY p.created_at DESC
  `;
  const rows = all<any>(sql, params);

  return res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    priceCents: r.price_cents,
    description: r.description,
    categoryId: r.category_id,
    categoryName: r.category_name ?? null,
    categoryColor: r.category_color ?? null,
    createdAt: r.created_at,
    stock: r.stock ?? 0,
    imageUrl: r.image_url ?? ""
  })));
});

productRoutes.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const r = one<any>(`
    SELECT 
      p.id, p.name, p.price_cents, p.description, p.category_id, p.created_at, p.stock, p.image_url,
      c.name AS category_name, c.color AS category_color
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
  `, [id]);

  if (!r) return res.status(404).json({ message: "Not found" });

  return res.json({
    id: r.id, name: r.name, priceCents: r.price_cents, description: r.description,
    categoryId: r.category_id, categoryName: r.category_name ?? null, categoryColor: r.category_color ?? null,
    createdAt: r.created_at, stock: r.stock ?? 0, imageUrl: r.image_url ?? ""
  });
});

productRoutes.post("/", (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const data = parsed.data;

  if (data.categoryId) {
    const exists = one<{ id: number }>("SELECT id FROM categories WHERE id = ?", [data.categoryId]);
    if (!exists) return res.status(400).json({ message: "Invalid categoryId" });
  }

  const r = run(
    "INSERT INTO products(name, price_cents, description, category_id, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    [data.name, data.priceCents, data.description, data.categoryId ?? null, data.stock, data.imageUrl]
  );
  return res.status(201).json({ id: Number(r.lastInsertRowid) });
});

productRoutes.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const data = parsed.data;

  const current = one<{ id: number }>("SELECT id FROM products WHERE id = ?", [id]);
  if (!current) return res.status(404).json({ message: "Not found" });

  if (data.categoryId) {
    const exists = one<{ id: number }>("SELECT id FROM categories WHERE id = ?", [data.categoryId]);
    if (!exists) return res.status(400).json({ message: "Invalid categoryId" });
  }

  run("UPDATE products SET name=?, price_cents=?, description=?, category_id=?, stock=?, image_url=? WHERE id=?",
      [data.name, data.priceCents, data.description, data.categoryId ?? null, data.stock, data.imageUrl, id]);
  return res.status(200).json({ id });
});

productRoutes.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const current = one<{ id: number }>("SELECT id FROM products WHERE id = ?", [id]);
  if (!current) return res.status(404).json({ message: "Not found" });

  run("DELETE FROM products WHERE id = ?", [id]);
  return res.status(204).send();
});
