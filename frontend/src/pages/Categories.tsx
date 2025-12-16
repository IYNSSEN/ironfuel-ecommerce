import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { api, ApiError } from "../api";
import { Category } from "../types";

type FormState = {
  name: string;
  type: string;
  description: string;
  color: string;
  isActive: boolean;
};

const emptyForm: FormState = { name: "", type: "General", description: "", color: "#3b5bfd", isActive: true };

export default function Categories({ toast }: { toast: (t: string, m: string) => void }) {
  const [items, setItems] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setBusy(true);
    try {
      const c = await api.adminCategories() as any;
      setItems(c);
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Failed to load") : "Failed to load";
      toast("Categories", msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditId(c.id);
    setForm({
      name: c.name,
      type: c.type,
      description: c.description ?? "",
      color: c.color ?? "#3b5bfd",
      isActive: c.isActive
    });
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    try {
      if (!form.name.trim()) throw new Error("Name required");

      if (editId) {
        await api.adminUpdateCategory(editId, form);
        toast("Saved", "Category updated ✅");
      } else {
        await api.adminCreateCategory(form);
        toast("Created", "New category added ✅");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Save failed") : (e.message ?? "Save failed");
      toast("Category", msg);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this category?")) return;
    setBusy(true);
    try {
      await api.adminDeleteCategory(id);
      toast("Deleted", "Category removed 🗑️");
      await load();
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Delete failed") : "Delete failed";
      toast("Category", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="panel-top">
        <h2 className="h2">Categories</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add category</button>
      </div>

      {busy ? <p className="small">Loading...</p> : null}

      <table className="table">
        <thead>
          <tr>
            <th>Color</th>
            <th>Name</th>
            <th>Type</th>
            <th>Active</th>
            <th style={{ width: 220 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id}>
              <td><span className="badge"><span className="dot" style={{ background: c.color }} />{c.color}</span></td>
              <td><b>{c.name}</b><div className="small">{c.description || "—"}</div></td>
              <td>{c.type}</td>
              <td>{c.isActive ? "Yes" : "No"}</td>
              <td>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn" onClick={() => remove(c.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 ? (
            <tr><td colSpan={5} className="small">No categories. Click “Add category”.</td></tr>
          ) : null}
        </tbody>
      </table>

      <Modal title={editId ? "Edit category" : "Add category"} open={open} onClose={() => setOpen(false)}>
        <div className="form">
          <div className="field">
            <label>Name (unique)</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hardware" />
          </div>

          <div className="field">
            <label>Type</label>
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. IT" />
          </div>

          <div className="field">
            <label>Color</label>
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#3b5bfd" />
          </div>

          <div className="field">
            <label>Active</label>
            <select value={form.isActive ? "1" : "0"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
