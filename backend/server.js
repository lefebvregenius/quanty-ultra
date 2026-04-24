const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

//////////////////////////////////////////////////
// 🔐 SECURITY / MIDDLEWARE
//////////////////////////////////////////////////
app.use(cors({
  origin: "*"
}));

app.use(express.json());

//////////////////////////////////////////////////
// 🚀 HEALTH CHECK (IMPORTANT RENDER)
//////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.json({
    status: "Quanty API Online 🚀",
    time: new Date()
  });
});

//////////////////////////////////////////////////
// 🔥 MONGODB CONNECTION SAFE
//////////////////////////////////////////////////

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.log("❌ MongoDB ERROR:", err.message));

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
  type: { type: String, default: "visit" },

  // 🔥 GENERAL
  url: String,
  userAgent: String,
  country: { type: String, default: "MG" },

  // ⏱ TIME
  duration: { type: Number, default: 0 },

  // ⚡ PERFORMANCE
  metric: String,
  value: Number,

  // 🌐 NETWORK
  ttfb: Number,
  load: Number,

  // 🕓 TIME
  timestamp: Number,
  date: { type: Date, default: Date.now }
});

const Stat = mongoose.model("Stat", StatSchema);

//////////////////////////////////////////////////
// 🔐 SIMPLE AUTH (PRODUCTION READY BASE)
//////////////////////////////////////////////////

const TOKEN = process.env.API_TOKEN || "quanty_ultra_token";

const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${TOKEN}`) {
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

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

//////////////////////////////////////////////////
// 📊 COLLECT DATA
//////////////////////////////////////////////////

app.post("/api/track", async (req, res) => {
  try {
    console.log("📊 DATA REÇUE :", req.body);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

const stat = new Stat({
  type: req.body.type,

  url: req.body.url,
  userAgent: req.body.userAgent,
  country: req.body.country || "MG",

  duration: req.body.duration || 0,

  // ⚡ PERFORMANCE
  metric: req.body.metric,
  value: req.body.value,

  // 🌐 NETWORK
  ttfb: req.body.ttfb,
  load: req.body.load,

  timestamp: req.body.timestamp || Date.now()
});

    await stat.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

//////////////////////////////////////////////////
// 📊 STATS (PROTECTED)
//////////////////////////////////////////////////

app.get("/api/stats", checkAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

    const data = await Stat.find()
      .sort({ date: -1 })
      .limit(500);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

//////////////////////////////////////////////////
// 🚀 START SERVER (RENDER SAFE)
//////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Quanty API running on port", PORT);
});