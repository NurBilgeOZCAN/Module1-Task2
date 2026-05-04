const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { pool } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = Router();
const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const JWT_EXPIRES_SECONDS = 24 * 60 * 60;

// Password: min 8 chars, at least 1 uppercase, at least 1 number
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// ── Rate limiter for login: 5 attempts per hour per IP ──────
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many attempts. Try again in 1 hour.",
      },
    });
  },
});

// ── POST /register ──────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION", message: "Email and password are required." },
      });
    }

    if (!PASSWORD_RE.test(password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message:
            "Password must be at least 8 characters and include 1 uppercase letter and 1 number.",
        },
      });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: "EMAIL_EXISTS", message: "Email is already registered." },
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      data: { token, expiresIn: JWT_EXPIRES_SECONDS },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error." },
    });
  }
});

// ── POST /login ─────────────────────────────────────────────
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION", message: "Email and password are required." },
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      });
    }

    const token = signToken(user);

    res.json({
      success: true,
      data: { token, expiresIn: JWT_EXPIRES_SECONDS },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error." },
    });
  }
});

// ── POST /reset-password ────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Step 1: Request a reset (only email provided)
    if (email && !token && !newPassword) {
      const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

      // Always succeed to prevent email enumeration
      if (result.rows.length === 0) {
        return res.json({
          success: true,
          data: { message: "If that email is registered, a reset token has been generated." },
        });
      }

      const userId = result.rows[0].id;
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await pool.query(
        "UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE",
        [userId]
      );
      await pool.query(
        "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        [userId, tokenHash, expiresAt]
      );

      // In production, send via email. For dev, log to console.
      console.log(`\nPassword reset token for ${email}: ${rawToken}\n`);

      return res.json({
        success: true,
        data: { message: "If that email is registered, a reset token has been generated." },
      });
    }

    // Step 2: Use token + new password to reset
    if (token && newPassword) {
      if (!PASSWORD_RE.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "WEAK_PASSWORD",
            message:
              "Password must be at least 8 characters and include 1 uppercase letter and 1 number.",
          },
        });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const result = await pool.query(
        `SELECT * FROM password_resets
         WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_TOKEN", message: "Invalid or expired reset token." },
        });
      }

      const resetRow = result.rows[0];
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
        passwordHash,
        resetRow.user_id,
      ]);
      await pool.query("UPDATE password_resets SET used = TRUE WHERE id = $1", [resetRow.id]);

      return res.json({
        success: true,
        data: { message: "Password has been reset successfully." },
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION", message: "Invalid request." },
    });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error." },
    });
  }
});

// ── GET /me (protected) ─────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found." },
      });
    }
    res.json({ success: true, data: { user: result.rows[0] } });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Internal server error." },
    });
  }
});

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = router;
