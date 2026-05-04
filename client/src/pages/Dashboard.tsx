import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="card">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <p>
        Welcome, <strong>{user?.email}</strong>!
      </p>
      <p className="text-muted">
        Member since:{" "}
        {user?.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : ""}
      </p>
    </div>
  );
}
