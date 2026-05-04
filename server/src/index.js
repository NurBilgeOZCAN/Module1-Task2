require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDB } = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ success: true, data: { status: "ok" } })
);

async function start() {
  await initDB();
  console.log("Database tables ready.");
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
