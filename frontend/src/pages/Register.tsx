import React, { useState } from "react";
import { useAuth } from "../auth";
import { ApiError } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register({ toast }: { toast: (t: string, m: string) => void }) {
  const { register } = useAuth();
  const nav = useNavigate();
  const [loginV, setLoginV] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(loginV, password);
      toast("Account created", "You’re in ✅");
      nav("/app/overview");
    } catch (e: any) {
      const msg = e instanceof ApiError ? (e.data?.message ?? "Registration failed") : "Registration failed";
      toast("Registration", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="auth-split">
          <div className="auth-left">
            <h2 style={{ margin: 0 }}>Create account</h2>
            <p className="small">Password must be at least <b>8</b> characters.</p>

            <form className="form" onSubmit={submit}>
              <div className="field">
                <label>Login</label>
                <input value={loginV} onChange={(e) => setLoginV(e.target.value)} placeholder="min 3 chars" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 8 chars" />
              </div>

              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </button>

              <p className="small" style={{ margin: 0 }}>
                Already have an account? <Link to="/login"><b>Sign in</b></Link>.
              </p>
            </form>
          </div>

          <div className="auth-right">
            <div className="blob" />
            <h3>What you’ll get</h3>
            <p>
              A secured dashboard with two full CRUD modules: Products and Categories.
              You also get an Overview page with live stats and a simple chart.
            </p>
            <div className="pills">
              <span className="pill">CRUD ×2</span>
              <span className="pill accent">Overview chart</span>
              <span className="pill">SQL migrations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
