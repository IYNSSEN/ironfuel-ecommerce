import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api";
import { Category, Product } from "../types";

function money(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

export default function Overview({ toast }: { toast: (t: string, m: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const [p, c] = await Promise.all([api.adminProducts() as any, api.adminCategories() as any]);
      setProducts(p);
      setCategories(c);
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Failed to load") : "Failed to load";
      toast("Admin overview", msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.isActive).length;
    const totalStock = products.reduce((s, p) => s + (p.stock ?? 0), 0);
    const inventoryValue = products.reduce((s, p) => s + (p.priceCents * (p.stock ?? 0)), 0);

    const countsByCat: Record<string, number> = {};
    for (const p of products) {
      const key = p.categoryName ?? "Uncategorized";
      countsByCat[key] = (countsByCat[key] ?? 0) + 1;
    }
    const chart = Object.entries(countsByCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return { totalProducts, totalCategories, activeCategories, totalStock, inventoryValue, chart };
  }, [products, categories]);

  const max = Math.max(1, ...totals.chart.map(([, v]) => v));

  return (
    <>
      <div className="panel-top">
        <h2 className="h2">Admin overview</h2>
        <span className="small">Stock + categories</span>
      </div>

      {busy ? <p className="small">Loading...</p> : null}

      <div className="kpi-row">
        <div className="kpi">
          <div className="label">Products</div>
          <div className="value">{totals.totalProducts}</div>
          <div className="hint">Items in catalog</div>
        </div>
        <div className="kpi">
          <div className="label">Categories</div>
          <div className="value">{totals.totalCategories}</div>
          <div className="hint">{totals.activeCategories} active</div>
        </div>
        <div className="kpi">
          <div className="label">Stock</div>
          <div className="value">{totals.totalStock}</div>
          <div className="hint">Total units on hand</div>
        </div>
        <div className="kpi">
          <div className="label">Inventory value</div>
          <div className="value">{money(totals.inventoryValue)}</div>
          <div className="hint">Price × stock</div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="panel" style={{ background: "rgba(255,255,255,.05)" }}>
        <div className="panel-top">
          <h3 className="h2" style={{ fontSize: 18 }}>Products per category</h3>
          <span className="small">Top 6</span>
        </div>

        {totals.chart.length === 0 ? (
          <p className="small">No data yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {totals.chart.map(([name, count]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                  <b>{name}</b>
                  <span className="small">{count}</span>
                </div>
                <div className="bar"><div style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 8 }} />
      <p className="small">
        Admin can create/edit categories and products to control stock and public catalog.
      </p>
    </>
  );
}
