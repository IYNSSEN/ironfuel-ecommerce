import { Router } from "express";
import { all, one, run } from "../db.js";
import { categorySchema } from "../validators.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", (_req, res) => {
  const rows = all<any>("SELECT id, name, type, description, created_at, color, is_active FROM categories ORDER BY created_at DESC");
  return res.json(rows.map((c: any) => ({
    id: c.id, name: c.name, type: c.type, description: c.description,
    createdAt: c.created_at, color: c.color, isActive: c.is_active === 1
  })));
});

categoryRoutes.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
  const c = one<any>("SELECT id, name, type, description, created_at, color, is_active FROM categories WHERE id = ?", [id]);
  if (!c) return res.status(404).json({ message: "Not found" });
  return res.json({
    id: c.id, name: c.name, type: c.type, description: c.description,
    createdAt: c.created_at, color: c.color, isActive: c.is_active === 1
  });
});

categoryRoutes.post("/", (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const data = parsed.data;

  const exists = one<{ id: number }>("SELECT id FROM categories WHERE name = ?", [data.name]);
  if (exists) return res.status(409).json({ message: "Category name must be unique" });

  const r = run(
    "INSERT INTO categories(name, type, description, color, is_active) VALUES (?, ?, ?, ?, ?)",
    [data.name, data.type, data.description, data.color, data.isActive ? 1 : 0]
  );
  return res.status(201).json({ id: Number(r.lastInsertRowid) });
});

categoryRoutes.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const data = parsed.data;

  const current = one<{ id: number }>("SELECT id FROM categories WHERE id = ?", [id]);
  if (!current) return res.status(404).json({ message: "Not found" });

  const nameOwner = one<{ id: number }>("SELECT id FROM categories WHERE name = ?", [data.name]);
  if (nameOwner && nameOwner.id !== id) return res.status(409).json({ message: "Category name must be unique" });

  run("UPDATE categories SET name=?, type=?, description=?, color=?, is_active=? WHERE id=?",
      [data.name, data.type, data.description, data.color, data.isActive ? 1 : 0, id]);
  return res.status(200).json({ id });
});

categoryRoutes.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
  const current = one<{ id: number }>("SELECT id FROM categories WHERE id = ?", [id]);
  if (!current) return res.status(404).json({ message: "Not found" });

  run("DELETE FROM categories WHERE id = ?", [id]);
  return res.status(204).send();
});
