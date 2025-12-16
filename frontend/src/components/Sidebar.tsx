import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="sidebar">
      <div className="side-title">Admin Panel</div>

      <NavLink to="/admin/overview" className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
        Overview <span>★</span>
      </NavLink>

      <NavLink to="/admin/products" className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
        Products <span>→</span>
      </NavLink>

      <NavLink to="/admin/categories" className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
        Categories <span>→</span>
      </NavLink>

      <div style={{ height: 10 }} />
      <button className="side-link" onClick={onLogout}>
        Logout <span>⎋</span>
      </button>
    </div>
  );
}
