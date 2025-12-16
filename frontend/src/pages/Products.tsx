import React, { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import { api, ApiError } from "../api";
import { Category, Product } from "../types";

function formatPrice(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

type FormState = {
  name: string;
  priceCents: number;
  description: string;
  categoryId: number | null;
  stock: number;
  imageUrl: string;
};

const emptyForm: FormState = { name: "", priceCents: 0, description: "", categoryId: null, stock: 0, imageUrl: "" };

export default function Products({ search, toast }: { search: string; toast: (t: string, m: string) => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);

  const [filterCat, setFilterCat] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setBusy(true);
    try {
      const [p, c] = await Promise.all([api.adminProducts(search, filterCat) as any, api.adminCategories() as any]);
      setItems(p);
      setCats(c);
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Failed to load") : "Failed to load";
      toast("Products", msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, [search, filterCat]);

  const catOptions = useMemo(() => cats.filter(c => c.isActive), [cats]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name,
      priceCents: p.priceCents,
      description: p.description ?? "",
      categoryId: p.categoryId,
      stock: p.stock,
      imageUrl: p.imageUrl ?? ""
    });
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    try {
      if (!form.name.trim()) throw new Error("Name required");
      if (form.priceCents < 0) throw new Error("Price must be >= 0");

      if (editId) {
        await api.adminUpdateProduct(editId, form);
        toast("Saved", "Product updated ✅");
      } else {
        await api.adminCreateProduct(form);
        toast("Created", "New product added ✅");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Save failed") : (e.message ?? "Save failed");
      toast("Product", msg);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this product?")) return;
    setBusy(true);
    try {
      await api.adminDeleteProduct(id);
      toast("Deleted", "Product removed 🗑️");
      await load();
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Delete failed") : "Delete failed";
      toast("Product", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="panel-top">
        <h2 className="h2">Products</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select className="btn" value={filterCat ?? ""} onChange={(e) => setFilterCat(e.target.value ? Number(e.target.value) : null)}>
            <option value="">All categories</option>
            {catOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Add product</button>
        </div>
      </div>

      {busy ? <p className="small">Loading...</p> : null}

      <div className="grid" style={{ paddingTop: 8 }}>
        {items.map(p => (
          <div className="card" key={p.id}>
            <div className="card-img">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className="small">No image</div>}
            </div>
            <div className="card-body">
              <div className="card-title">{p.name}</div>
              <div className="card-sub">
                {p.categoryName ? (
                  <span className="badge"><span className="dot" style={{ background: p.categoryColor ?? "var(--brand)" }} />{p.categoryName}</span>
                ) : (
                  <span className="badge">Uncategorized</span>
                )}
              </div>
              <div className="card-sub">{p.description || "—"}</div>

              <div className="card-row">
                <div className="price">{formatPrice(p.priceCents)}</div>
                <span className="badge">Stock: {p.stock}</span>
              </div>

              <div className="card-row" style={{ justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 ? <div className="small">No products. Click “Add product”.</div> : null}
      </div>

      <Modal title={editId ? "Edit product" : "Add product"} open={open} onClose={() => setOpen(false)}>
        <div className="form">
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
          </div>

          <div className="field">
            <label>Price (cents)</label>
            <input
              type="number"
              value={form.priceCents}
              onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })}
              placeholder="e.g. 1999"
            />
            <div className="small" style={{ marginTop: 6 }}>Display: {formatPrice(form.priceCents)}</div>
          </div>

          <div className="field">
            <label>Category</label>
            <select value={form.categoryId ?? ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Uncategorized</option>
              {catOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Stock</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>

          <div className="field">
            <label>Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Notes..." />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
