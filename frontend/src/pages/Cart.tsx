import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api";

function money(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

export default function Cart({
  toast,
  onCartChanged,
}: {
  toast: (t: string, m: string) => void;
  onCartChanged: () => Promise<void>;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [totalCents, setTotalCents] = useState(0);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data: any = await api.cart();
      setItems(data.items);
      setTotalCents(data.totalCents);
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Failed to load cart") : "Failed to load cart";
      toast("Cart", msg);
    }
  }

  useEffect(() => { load(); }, []);

  async function setQty(productId: number, qty: number) {
    setBusy(true);
    try {
      await api.cartSetQty(productId, qty);
      await load();
      await onCartChanged();
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Update failed") : "Update failed";
      toast("Cart", msg);
    } finally {
      setBusy(false);
    }
  }

  async function remove(productId: number) {
    setBusy(true);
    try {
      await api.cartRemove(productId);
      await load();
      await onCartChanged();
      toast("Removed", "Item removed 🗑️");
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Remove failed") : "Remove failed";
      toast("Cart", msg);
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setBusy(true);
    try {
      const res: any = await api.checkout();
      toast("Payment (mock)", `Order #${res.orderId} paid ✅`);
      await load();
      await onCartChanged();
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Checkout failed") : "Checkout failed";
      toast("Checkout", msg);
    } finally {
      setBusy(false);
    }
  }

  const count = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);

  return (
    <div className="container" style={{ padding: "18px 0 50px" }}>
      <div className="panel">
        <div className="panel-top">
          <h2 className="h2">Your cart</h2>
          <span className="small">{count} items</span>
        </div>

        {items.length === 0 ? (
          <p className="small">Cart is empty. Go back to Home and add supplements.</p>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th style={{ width: 150 }}>Qty</th>
                  <th>Line total</th>
                  <th style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.productId}>
                    <td>
                      <b>{it.name}</b>
                      <div className="small">Stock: {it.stock}</div>
                    </td>
                    <td>{money(it.priceCents)}</td>
                    <td>
                      <input
                        className="btn"
                        style={{ width: 120 }}
                        type="number"
                        min={1}
                        max={it.stock}
                        value={it.qty}
                        onChange={(e) => setQty(it.productId, Number(e.target.value))}
                        disabled={busy}
                      />
                    </td>
                    <td><b>{money(it.lineTotalCents)}</b></td>
                    <td>
                      <button className="btn" onClick={() => remove(it.productId)} disabled={busy}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 14, gap: 12, flexWrap:"wrap" }}>
              <span className="badge"><span className="dot" /> Total: <b style={{ marginLeft: 6 }}>{money(totalCents)}</b></span>
              <button className="btn btn-primary" onClick={checkout} disabled={busy}>
                {busy ? "Processing..." : "Pay & Place Order (mock)"}
              </button>
            </div>

            <p className="small" style={{ marginTop: 10 }}>
              Payment is a **mock gateway** for project demo: it creates a PAID order and decreases stock.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
