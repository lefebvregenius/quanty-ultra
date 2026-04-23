const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

//////////////////////////////////////////////////
// LOG ENV (DEBUG SAFE)
//////////////////////////////////////////////////

console.log("🚀 ENV CHECK");
console.log("MONGO_URI =", process.env.MONGO_URI ? "OK" : "MISSING");

//////////////////////////////////////////////////
// MIDDLEWARE
//////////////////////////////////////////////////

app.use(cors({
  origin: "*"
}));

app.use(express.json());

//////////////////////////////////////////////////
// 🔥 MONGODB CONNECTION (RAILWAY SAFE)
//////////////////////////////////////////////////

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
  })
  .catch(err => {
    console.log("❌ MongoDB ERROR:");
    console.log(err.message);
  });

mongoose.connection.on("connected", () => {
  console.log("🟢 DB CONNECTED");
});

mongoose.connection.on("error", (err) => {
  console.log("🔴 DB ERROR:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ DB DISCONNECTED");
});

//////////////////////////////////////////////////
// 📦 MODEL
//////////////////////////////////////////////////

const StatSchema = new mongoose.Schema({
  type: String,
  duration: Number,
  country: String,
  date: { type: Date, default: Date.now }
});

const Stat = mongoose.model("Stat", StatSchema);

//////////////////////////////////////////////////
// 🔐 AUTH TOKEN
//////////////////////////////////////////////////

const TOKEN = "quanty_ultra_token";

const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== "Bearer " + TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

//////////////////////////////////////////////////
// 🔐 LOGIN
//////////////////////////////////////////////////

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    return res.json({
      success: true,
      token: TOKEN
    });
  }

  return res.status(401).json({ success: false });
});

//////////////////////////////////////////////////
// 📊 COLLECT DATA
//////////////////////////////////////////////////

app.post("/api/collect", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

    const stat = new Stat({
      type: req.body.type || "visit",
      duration: req.body.duration || 0,
      country: req.body.country || "MG"
    });

    await stat.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});

//////////////////////////////////////////////////
// 📊 GET STATS
//////////////////////////////////////////////////

app.get("/api/stats", checkAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

    const data = await Stat.find()
      .sort({ date: -1 })
      .limit(100);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "DB error" });
  }
});

//////////////////////////////////////////////////
// HEALTH CHECK (RAILWAY IMPORTANT)
//////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.json({
    status: "Quanty API Online",
    time: new Date()
  });
});

//////////////////////////////////////////////////
// 🚀 START SERVER (RAILWAY READY)
//////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Quanty API running on port", PORT);
});