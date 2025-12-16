import React, { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api";
import { useAuth } from "../auth";

function formatPrice(cents: number) {
  const v = (cents / 100).toFixed(2);
  return `$${v}`;
}

export default function Home({
  toast,
  search,
  onAddToCart,
}: {
  toast: (t: string, m: string) => void;
  search: string;
  onAddToCart: (productId: number) => Promise<void>;
}) {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.publicProducts(40), api.publicCategories()])
      .then(([p, c]) => { setProducts(p as any); setCats(c as any); })
      .catch(() => toast("Public data", "Backend not reachable or no data yet."));
  }, []);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return products;
    return products.filter((p: any) =>
      String(p.name).toLowerCase().includes(q) ||
      String(p.description ?? "").toLowerCase().includes(q) ||
      String(p.categoryName ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="container">
      <div className="hero">
        <div>
          <h1>Fuel your training.<br/>Shop smarter.</h1>
          <p>
            <b>IronFuel</b> is a mini gym-supplement store: public catalog + customer accounts.
            After login you can add products to cart and place an order.
            Admin account manages stock via secured CRUD (Products + Categories).
          </p>

          <div className="pills">
            <span className="pill">Customer login</span>
            <span className="pill">Cart + checkout</span>
            <span className="pill">Orders history</span>
            <span className="pill accent">Admin CRUD ×2</span>
            <span className="pill">HTTP codes + validation</span>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {user ? (
              <>
                <a className="btn btn-primary" href="/cart">Open cart</a>
                {user.role === "ADMIN" ? <a className="btn" href="/admin/overview">Admin panel</a> : null}
              </>
            ) : (
              <>
                <a className="btn btn-primary" href="/register">Create account</a>
                <a className="btn" href="/login">Sign in</a>
              </>
            )}
          </div>
        </div>

        <div className="hero-card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
            <b>Quick preview</b>
            <span className="badge"><span className="dot" /> Public</span>
          </div>
          <div style={{ height: 10 }} />
          <div style={{ display:"grid", gap: 10 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span className="small">Products</span>
              <span className="small">{products.length}</span>
            </div>
            <div className="bar"><div style={{ width: `${Math.min(100, products.length * 6)}%` }} /></div>

            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span className="small">Active categories</span>
              <span className="small">{cats.length}</span>
            </div>
            <div className="bar"><div style={{ width: `${Math.min(100, cats.length * 18)}%` }} /></div>

            <div style={{ height: 6 }} />
            <div className="small">Sign in to add to cart & checkout.</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 8 }}>
        <div className="panel-top">
          <h3 className="h2">Supplements</h3>
          <span className="small">Public catalog</span>
        </div>

        <div className="grid" style={{ paddingTop: 12 }}>
          {filtered.map((p: any) => (
            <div className="card" key={p.id}>
              <div className="card-img">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className="small">No image</div>}
              </div>
              <div className="card-body">
                <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
                  <div className="card-title">{p.name}</div>
                  <div className="price">{formatPrice(p.priceCents)}</div>
                </div>

                <div className="card-sub" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {p.categoryName ? (
                    <span className="badge"><span className="dot" style={{ background: p.categoryColor ?? "var(--brand)" }} />{p.categoryName}</span>
                  ) : (
                    <span className="badge">Uncategorized</span>
                  )}
                  <span className="badge">Stock: {p.stock}</span>
                </div>

                <div className="card-sub">{p.description || "—"}</div>

                <div className="card-row" style={{ justifyContent:"flex-end" }}>
                  {user ? (
                    <button className="btn btn-primary" disabled={p.stock <= 0} onClick={() => onAddToCart(p.id)}>
                      {p.stock <= 0 ? "Out of stock" : "Add to cart"}
                    </button>
                  ) : (
                    <a className="btn" href="/login">Sign in to buy</a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? <div className="small">No products match your search.</div> : null}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18, marginBottom: 60 }}>
        <div className="panel-top">
          <h3 className="h2">Categories</h3>
          <span className="small">Active only</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {cats.map((c: any) => (
            <span key={c.id} className="badge" title={c.type}>
              <span className="dot" style={{ background: c.color }} />
              {c.name}
            </span>
          ))}
          {cats.length === 0 ? <span className="small">No categories yet.</span> : null}
        </div>
      </div>
    </div>
  );
}
