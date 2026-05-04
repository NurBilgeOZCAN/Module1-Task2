import React, { useState, FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPasswordRequest, resetPasswordConfirm } from "../api";

const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  // Step 1: request reset
  const [email, setEmail] = useState("");
  // Step 2: confirm reset
  const [token, setToken] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(tokenFromUrl ? 2 : 1);

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await resetPasswordRequest(email);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReset(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirm) {
      return setError("Passwords do not match.");
    }
    if (!PASSWORD_RE.test(newPassword)) {
      return setError(
        "Password must be at least 8 characters and include 1 uppercase letter and 1 number."
      );
    }

    setLoading(true);
    try {
      const data = await resetPasswordConfirm(token, newPassword);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Reset Password</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {step === 1 && !message && (
        <>
          <form onSubmit={handleRequestReset}>
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
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Token"}
            </button>
          </form>
          <div className="links">
            <button
              type="button"
              className="link-btn"
              onClick={() => setStep(2)}
            >
              I already have a token
            </button>
            <span> | </span>
            <Link to="/login">Back to Login</Link>
          </div>
        </>
      )}

      {step === 2 && !message && (
        <>
          <form onSubmit={handleConfirmReset}>
            <div className="form-group">
              <label htmlFor="token">Reset Token</label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder="Paste your reset token"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Re-enter password"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          <div className="links">
            <button
              type="button"
              className="link-btn"
              onClick={() => setStep(1)}
            >
              Request a token
            </button>
            <span> | </span>
            <Link to="/login">Back to Login</Link>
          </div>
        </>
      )}

      {message && (
        <div className="links">
          <Link to="/login">Go to Login</Link>
        </div>
      )}
    </div>
  );
}
