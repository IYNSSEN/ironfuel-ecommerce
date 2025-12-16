import React, { useEffect, useState } from "react";
import { api, ApiError } from "../api";

function money(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

export default function Orders({ toast }: { toast: (t: string, m: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const data: any = await api.orders();
      setOrders(data);
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Failed to load orders") : "Failed to load orders";
      toast("Orders", msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container" style={{ padding: "18px 0 50px" }}>
      <div className="panel">
        <div className="panel-top">
          <h2 className="h2">Orders</h2>
          <span className="small">Last 50</span>
        </div>

        {busy ? <p className="small">Loading...</p> : null}

        {orders.length === 0 ? (
          <p className="small">No orders yet. Go to Cart and checkout.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b></td>
                  <td>{o.status}</td>
                  <td>{money(o.totalCents)}</td>
                  <td className="small">{o.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
