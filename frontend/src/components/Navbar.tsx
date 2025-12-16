import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "../types";

export default function Navbar({
  user,
  cartCount,
  search,
  onSearchChange,
  onLogout
}: {
  user: User | null;
  cartCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  onLogout: () => void;
}) {
  const loc = useLocation();
  const nav = useNavigate();

  const showSearch = loc.pathname === "/";

  return (
    <div className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="IronFuel home">
            <span className="logo" />
            <span>IronFuel</span>
          </Link>

          <div className="search">
            {showSearch ? (
              <input
                placeholder="Search supplements..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            ) : (
              <div style={{ width: "min(560px, 100%)" }} />
            )}
          </div>

          <div className="nav-actions">
            <Link className="btn" to="/weather">Weather</Link>
            <Link className="btn" to="/rates">Rates</Link>
            {user ? (
              <>
                <span className="badge" title={user.role}>
                  <span className="dot" />
                  {user.login}
                </span>

                <Link className="btn" to="/orders">Orders</Link>
                <Link className="btn" to="/cart">Cart {cartCount ? `(${cartCount})` : ""}</Link>

                {user.role === "ADMIN" ? (
                  <button className="btn" onClick={() => nav("/admin/overview")}>Admin</button>
                ) : null}

                <button className="btn btn-primary" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn" to="/login">Sign in</Link>
                <Link className="btn btn-primary" to="/register">Create account</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
