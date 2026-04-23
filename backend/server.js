const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

//////////////////////////////////////////////////
// 🔐 SECURITY / MIDDLEWARE
//////////////////////////////////////////////////

app.use(cors({
  origin: ["https://quanty-ultra.vercel.app"]
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
  url: String,
  duration: { type: Number, default: 0 },
  country: { type: String, default: "MG" },
  userAgent: String,
  timestamp: String,
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
console.log("📊 DATA REÇUE :", req.body);
app.post("/api/track", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "DB not connected" });
    }

   const stat = new Stat({
  type: req.body.type,
  url: req.body.url,
  duration: req.body.duration,
  country: req.body.country || "MG",
  userAgent: req.body.userAgent,
  timestamp: req.body.timestamp
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
      .limit(100);

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