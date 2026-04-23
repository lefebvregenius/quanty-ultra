const express = require("express");
const fs = require("fs");
const cors = require("cors");
const geoip = require("geoip-lite");

const app = express();
app.use(express.json());
app.use(cors());

const DB = "./db.json";

// créer fichier si inexistant
if (!fs.existsSync(DB)) {
  fs.writeFileSync(DB, JSON.stringify([]));
}

// 🔥 TRACK VISITOR
app.post("/track", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB));

  const ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const geo = geoip.lookup(ip);

  const entry = {
    date: new Date(),
    country: geo?.country || "Unknown",
    ...req.body
  };

  data.push(entry);

  fs.writeFileSync(DB, JSON.stringify(data, null, 2));

  res.send({ status: "ok" });
});

// 📊 GET STATS
app.get("/stats", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB));
  res.send(data);
});

app.listen(5000, () =>
  console.log("🚀 Quanty Analytics running on port 5000")
);