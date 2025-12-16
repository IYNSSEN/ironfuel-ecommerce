import React, { useState } from "react";
import { useAuth } from "../auth";
import { ApiError } from "../api";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login({ toast }: { toast: (t: string, m: string) => void }) {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from ?? "/app/overview";

  const [loginV, setLoginV] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(loginV, password);
      toast("Signed in", "Welcome to IronFuel ✅");
      nav(from);
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Login failed") : "Login failed";
      toast("Login", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="auth-split">
          <div className="auth-left">
            <h2 style={{ margin: 0 }}>Sign in</h2>
            <p className="small">Access protected CRUD (Products + Categories) and dashboard overview.</p>

            <form className="form" onSubmit={submit}>
              <div className="field">
                <label>Login</label>
                <input value={loginV} onChange={(e) => setLoginV(e.target.value)} placeholder="e.g. carbon9" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>

              <p className="small" style={{ margin: 0 }}>
                New here? <Link to="/register"><b>Create an account</b></Link>.
              </p>
            </form>
          </div>

          <div className="auth-right">
            <div className="blob" />
            <h3>Why login?</h3>
            <p>
              CRUD endpoints are protected. Without authentication you’ll get <b>401</b>.
              After signing in you can add, edit and delete products/categories and see live stats on Overview.
            </p>
            <div className="pills">
              <span className="pill">JWT cookie</span>
              <span className="pill accent">401 protected</span>
              <span className="pill">REST CRUD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
