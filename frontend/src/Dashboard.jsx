import { useEffect, useState } from "react";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
       const res = await fetch("https://quanty-ultra.onrender.com/api/stats", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token")
  }
});

if (!res.ok) {
  console.log("AUTH ERROR", res.status);

  // option bonus 🔥
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return;
}

if (!res.ok) {
  console.log("AUTH ERROR", res.status);

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
  return;
}

const data = await res.json();
setStats(data);
      } catch {}
    };

    fetchStats();
    const i = setInterval(fetchStats, 2000); // 🔴 live refresh
    return () => clearInterval(i);
  }, []);


 // 🔐 Sécurité : toujours un tableau
const safeStats = Array.isArray(stats) ? stats : [];

const today = new Date().toDateString();

// 📊 VISITES AUJOURD’HUI
const visitsToday = safeStats.filter(
  (s) =>
    new Date(s.date).toDateString() === today &&
    s.type === "visit"
).length;

// 📊 TOTAL VISITES
const totalVisits = safeStats.filter(
  (s) => s.type === "visit"
).length;

// 🔴 UTILISATEURS EN DIRECT (15 sec)
const liveUsers = safeStats.filter(
  (s) =>
    s.type === "heartbeat" &&
    Date.now() - new Date(s.date).getTime() < 15000
).length;

// ⏱ TEMPS MOYEN
const leaves = safeStats.filter((s) => s.type === "leave");

const avgTime =
  leaves.reduce((a, b) => a + (b.duration || 0), 0) /
  (leaves.length || 1);

// 🇲🇬 UTILISATEURS MADAGASCAR
const madagascarUsers = safeStats.filter(
  (s) => s.country === "MG"
).length;

// 🔐 LOGOUT
const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};
const perf = safeStats.filter((s) => s.type === "performance");

const lcpData = perf.filter((s) => s.metric === "LCP");
const clsData = perf.filter((s) => s.metric === "CLS");
const fidData = perf.filter((s) => s.metric === "FID");

const avgLCP =
  lcpData.reduce((a, b) => a + (b.value || 0), 0) /
  (lcpData.length || 1);

const avgCLS =
  clsData.reduce((a, b) => a + (b.value || 0), 0) /
  (clsData.length || 1);

const avgFID =
  fidData.reduce((a, b) => a + (b.value || 0), 0) /
  (fidData.length || 1);
  const network = safeStats.filter((s) => s.type === "network");

const avgTTFB =
  network.reduce((a, b) => a + (b.ttfb || 0), 0) /
  (network.length || 1);

const avgLoad =
  network.reduce((a, b) => a + (b.load || 0), 0) /
  (network.length || 1);
// 📈 GRAPH DATA
const graphData = safeStats
  .filter((s) => s.type === "visit")
  .slice(-25);

  return (
    <div style={styles.wrapper}>
      <div style={styles.blurBg}></div>

      <div style={styles.header}>
        <h1 style={styles.title}>QUANTY CORE</h1>

        <button onClick={logout} style={styles.logout}>
          Déconnexion
        </button>
      </div>

      <div style={styles.grid}>
        <Tile large>
          <img src="/profile2.png" style={styles.profile} />
          <h2 style={styles.name}>RANDRIAMANANTENA L.N.J Andrianina</h2>
        </Tile>

        <Tile title="TIME">{time.toLocaleTimeString()}</Tile>

        <Tile title="LIVE USERS 🔴">{liveUsers}</Tile>

        <Tile title="SYSTEM">ONLINE</Tile>

        <Tile title="VISITS TODAY">{visitsToday}</Tile>

        <Tile title="TOTAL VISITS">{totalVisits}</Tile>

        <Tile title="AVG TIME">
          {Math.floor(avgTime / 1000)} sec
        </Tile>

        <Tile title="MADAGASCAR">{madagascarUsers}</Tile>

        <Tile title="LIVE TRAFFIC">
          <Graph data={graphData} />
        </Tile>
        <Tile title="PERFORMANCE ⚡">
  <p>LCP: {Math.floor(avgLCP)} ms</p>
  <p>CLS: {avgCLS.toFixed(3)}</p>
  <p>FID: {Math.floor(avgFID)} ms</p>
</Tile>
<Tile title="NETWORK 🌐">
  <p>TTFB: {Math.floor(avgTTFB)} ms</p>
  <p>Load: {Math.floor(avgLoad)} ms</p>
</Tile>

        {/* 🧮 AJOUT */}
        <Tile title="CALCULATOR">
          <Calculator />
        </Tile>

        {/* 📅 AJOUT */}
        <Tile title="CALENDAR">
          <Calendar />
        </Tile>
        <Tile full>
  <div style={styles.aboutFull}>
    <h2 style={styles.aboutTitle}>ABOUT QUANTY ULTRA</h2>

    <p>
      Quanty Ultra est une plateforme de monitoring intelligent
      développée par Gralwebs Solution. Elle permet de suivre en
      temps réel les performances des sites web, les visiteurs et
      les anomalies système.
    </p>

    <p>
      Conçu avec une vision futuriste, Quanty Ultra intègre des
      fonctionnalités avancées d’analyse et prépare l’intégration
      d’une intelligence artificielle autonome.
    </p>

    <p style={styles.signature}>
      © Gralwebs 2026 — RANDRIAMANANTENA Lalanirina José Andrianina
    </p>
  </div>
</Tile>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// TILE
//////////////////////////////////////////////////
function Tile({ title, children, large, full }) {
  return (
    <div
      style={{
        ...styles.tile,
        gridColumn: full
          ? "1 / -1"   // 🔥 prend toute la largeur
          : large
          ? "span 2"
          : "span 1",
        gridRow: large ? "span 2" : "span 1",
        alignSelf: "start"
      }}
    >
      {title && <h3 style={styles.label}>{title}</h3>}
      {children}
    </div>
  );
}

//////////////////////////////////////////////////
// GRAPH
//////////////////////////////////////////////////

function Graph({ data }) {
  return (
    <div style={styles.graph}>
      {data.map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.bar,
            height: 20 + Math.random() * 80,
            animation: `grow 0.5s ease ${i * 0.05}s forwards`
          }}
        />
      ))}
    </div>
  );
}

//////////////////////////////////////////////////
// 🧮 CALCULATOR
//////////////////////////////////////////////////

function Calculator() {
  const [display, setDisplay] = useState("0");

  const press = (val) => {
    if (val === "C") return setDisplay("0");

    if (val === "=") {
      try {
        const result = Function("return " + display)();
        setDisplay(result.toString());
      } catch {
        setDisplay("Error");
      }
      return;
    }

    setDisplay(display === "0" ? val : display + val);
  };

  const buttons = [
    ["C", "+/-", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="]
  ];

  return (
    <div style={styles.calcPro}>
      {/* DISPLAY */}
      <div style={styles.displayPro}>{display}</div>

      {/* BUTTONS */}
      <div style={styles.buttonsPro}>
        {buttons.flat().map((b, i) => (
          <button
            key={i}
            onClick={() => press(b)}
            style={{
              ...styles.btnPro,
              ...(b === "0" && styles.zeroBtn),
              ...(isOperator(b) && styles.operatorBtn),
              ...(b === "=" && styles.equalBtn)
            }}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

function isOperator(val) {
  return ["+", "-", "*", "/", "%"].includes(val);
}

//////////////////////////////////////////////////
// 📅 CALENDAR
//////////////////////////////////////////////////
function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ajustement pour commencer lundi
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  const days = [];

  // Cases vides début
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={"empty" + i}></div>);
  }

  // Jours du mois
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    days.push(
      <div
        key={i}
        style={{
          ...styles.day,
          ...(isToday && styles.today)
        }}
      >
        {i}
      </div>
    );
  }

  return (
    <div style={styles.calendarPro}>
      {/* HEADER */}
      <div style={styles.calendarHeader}>
        <button onClick={prevMonth} style={styles.navBtn}>◀</button>

        <h3 style={styles.monthTitle}>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric"
          })}
        </h3>

        <button onClick={nextMonth} style={styles.navBtn}>▶</button>
      </div>

      {/* JOURS */}
      <div style={styles.daysLabel}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div style={styles.gridDays}>{days}</div>
    </div>
  );
}

//////////////////////////////////////////////////
// STYLES (JUSTE AMÉLIORÉS)
//////////////////////////////////////////////////

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#000101",
    padding: "40px",
    fontFamily: "'Playfair Display', serif"
  },

  blurBg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backdropFilter: "blur(100px)",
    zIndex: 0
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
    zIndex: 2,
    position: "relative"
  },

  title: {
    color: "#996767",
    fontSize: "34px",
    textShadow:
      "1px 1px 0 #fff, 2px 2px 0 #ccc, 3px 3px 10px rgba(0,0,0,0.5)"
  },

  logout: {
    background: "#200e0e",
    color: "#cb4d24",
    padding: "10px",
    borderRadius: "10px"
  },

  grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
  gap: "20px",
  alignItems: "start" // 🔥 empêche l’étirement vertical
},

  tile: {
    background: "rgba(57, 0, 85, 0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "20px",
    animation: "fadeUp 0.5s ease"
  },

  label: {
    color: "#aaa",
    textShadow:
      "1px 1px 0 #fff, 2px 2px 5px rgba(0,0,0,0.5)"
  },

  profile: {
    width: "100%",
    borderRadius: "15px"
  },

  name: {
    textAlign: "center"
  },

  graph: {
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
    height: "100px"
  },

  bar: {
    width: "6px",
    background: "#cb4d24"
  },

  calc: {
    background: "#111",
    padding: "10px",
    borderRadius: "10px"
  },

  display: { color: "#fff", marginBottom: "10px" },

  buttons: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "5px"
  },

  btn: {
    padding: "10px",
    background: "#333",
    color: "#fff",
    border: "none"
  },

  calendarPro: {
  width: "100%",
  background: "linear-gradient(135deg, #1a0f2e, #3a1c71)",
  borderRadius: "15px",
  padding: "15px",
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  animation: "fadeUp 0.6s ease"
},

calendarHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px"
},

monthTitle: {
  fontSize: "14px",
  textTransform: "capitalize",
  letterSpacing: "1px"
},

navBtn: {
  background: "rgba(255,255,255,0.1)",
  border: "none",
  color: "#fff",
  padding: "5px 10px",
  borderRadius: "8px",
  cursor: "pointer"
},

daysLabel: {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  textAlign: "center",
  fontSize: "10px",
  opacity: 0.7,
  marginBottom: "5px"
},

gridDays: {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: "5px"
},

day: {
  aspectRatio: "1 / 1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  fontSize: "11px",
  background: "rgba(255,255,255,0.05)",
  transition: "0.3s"
},

today: {
  background: "#ff4d6d",
  color: "#fff",
  fontWeight: "bold",
  boxShadow: "0 0 10px #ff4d6d"
},
calcPro: {
  width: "100%",
  height: "100%",
  maxHeight: "300px", // 🔥 limite hauteur
  background: "linear-gradient(145deg, #1c1c1c, #2a2a2a)",
  borderRadius: "15px",
  padding: "10px",
  boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
},

displayPro: {
  color: "#fff",
  fontSize: "22px",
  textAlign: "right",
  padding: "10px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.05)",
  marginBottom: "10px"
},

buttonsPro: {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: "6px",
  flex: 1
},

btnPro: {
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  background: "#333",
  color: "#fff",
  cursor: "pointer"
},

operatorBtn: {
  background: "#ff9f0a"
},

equalBtn: {
  background: "#34c759"
},

zeroBtn: {
  gridColumn: "span 2"
},
footer: {
  marginTop: "40px",
  textAlign: "center",
  color: "#aaa",
  fontSize: "12px",
  opacity: 0.7
},
about: {
  fontSize: "12px",
  color: "#839191",
  lineHeight: "1.5"
}
};

