import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Toasts, { ToastItem } from "./components/Toast";
import { AuthProvider, useAuth } from "./auth";
import { api } from "./api";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

import DashboardLayout from "./pages/DashboardLayout";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Overview from "./pages/Overview";
import Weather from "./pages/Weather";
import Rates from "./pages/Rates";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="container" style={{ padding: "24px 0" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: "24px 0" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Shell() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const nav = useNavigate();

  function toast(title: string, message: string) {
    const id = String(Date.now()) + Math.random().toString(16).slice(2);
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4500);
  }

  async function refreshCartCount() {
    if (!user) { setCartCount(0); return; }
    try {
      const data: any = await api.cart();
      const count = (data.items ?? []).reduce((s: number, it: any) => s + (it.qty ?? 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  useEffect(() => { refreshCartCount(); }, [user?.id]);

  async function onAddToCart(productId: number) {
    try {
      await api.cartAdd(productId, 1);
      toast("Added", "Added to cart ✅");
      await refreshCartCount();
    } catch (e: any) {
      toast("Cart", e?.data?.message ?? "Failed to add to cart");
    }
  }

  async function onLogout() {
    await logout();
    toast("Logged out", "See you soon 👋");
    nav("/");
  }

  return (
    <>
      <Navbar user={user} cartCount={cartCount} search={search} onSearchChange={setSearch} onLogout={onLogout} />

      <Routes>
        <Route path="/" element={<Home toast={toast} search={search} onAddToCart={onAddToCart} />} />
        <Route path="/login" element={<Login toast={toast} />} />
        <Route path="/register" element={<Register toast={toast} />} />

        <Route path="/cart" element={
          <Protected>
            <Cart toast={toast} onCartChanged={refreshCartCount} />
          </Protected>
        } />

        <Route path="/orders" element={
          <Protected>
            <Orders toast={toast} />
          </Protected>
        } />

        <Route path="/admin" element={
          <AdminOnly>
            <DashboardLayout onLogout={onLogout} />
          </AdminOnly>
        }>
          <Route path="overview" element={<Overview toast={toast} />} />
          <Route path="products" element={<Products search={""} toast={toast} />} />
          <Route path="categories" element={<Categories toast={toast} />} />
          <Route index element={<Navigate to="/admin/overview" replace />} />
        </Route>

        <Route path="/weather" element={<Weather />} />
        <Route path="/rates" element={<Rates />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toasts items={toasts} onClose={(id) => setToasts(prev => prev.filter(x => x.id !== id))} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
