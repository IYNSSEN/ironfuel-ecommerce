import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="container">
      <div className="layout">
        <Sidebar onLogout={onLogout} />
        <div className="panel">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
