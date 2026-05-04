import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister, getMe } from "../api";
import { useAuth } from "../AuthContext";

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }
    if (!PASSWORD_RE.test(password)) {
      return setError(
        "Password must be at least 8 characters and include 1 uppercase letter and 1 number."
      );
    }

    setLoading(true);
    try {
      await apiRegister(email, password);
      const data = await getMe();
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Create Account</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Re-enter password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <div className="links">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
