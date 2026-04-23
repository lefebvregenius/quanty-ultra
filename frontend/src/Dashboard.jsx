import { useEffect, useState, useRef } from "react";

const API_URL = "https://quanty-ultra.onrender.com";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("connecting...");
  const intervalRef = useRef(null);

  //////////////////////////////////////////////////
  // CLOCK
  //////////////////////////////////////////////////
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  //////////////////////////////////////////////////
  // HEALTH CHECK (NEXT LEVEL)
  //////////////////////////////////////////////////
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setStatus(data.status || "online");
      } catch {
        setStatus("offline");
      }
    };

    check();
    const i = setInterval(check, 10000);
    return () => clearInterval(i);
  }, []);

  //////////////////////////////////////////////////
  // FETCH STATS SAFE
  //////////////////////////////////////////////////
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token - please login");
          return;
        }

        const res = await fetch(`${API_URL}/api/stats`, {
          headers: {
            Authorization: "Bearer " + token
          }
        });

        if (!res.ok) {
          setError("API error " + res.status);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setStats(data);
        } else {
          setStats([]);
        }
      } catch (e) {
        setError("Network error");
      }
    };

    fetchStats();

    intervalRef.current = setInterval(fetchStats, 5000);

    return () => clearInterval(intervalRef.current);
  }, []);

  //////////////////////////////////////////////////
  // SAFE CALCULATIONS
  //////////////////////////////////////////////////
  const today = new Date().toDateString();

  const visitsToday = stats.filter(
    s => s?.type === "visit" && new Date(s.date).toDateString() === today
  ).length;

  const totalVisits = stats.filter(s => s?.type === "visit").length;

  const liveUsers = stats.filter(
    s =>
      s?.type === "visit" &&
      Date.now() - new Date(s.date).getTime() < 30000
  ).length;

  const avgTime =
    stats.filter(s => s?.type === "leave").length > 0
      ? stats
          .filter(s => s?.type === "leave")
          .reduce((a, b) => a + (b.duration || 0), 0) /
        stats.filter(s => s?.type === "leave").length
      : 0;

  const madagascarUsers = stats.filter(s => s?.country === "MG").length;

  const graphData = stats
    .filter(s => s?.type === "visit")
    .slice(-25);

  //////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <div style={styles.wrapper}>
      <div style={styles.blurBg}></div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>QUANTY CORE</h1>

        <div style={styles.status}>
          STATUS: {status}
        </div>

        <button onClick={logout} style={styles.logout}>
          Déconnexion
        </button>
      </div>

      {/* ERROR DISPLAY */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* GRID */}
      <div style={styles.grid}>
        <Tile large>
          <img src="/profile2.png" style={styles.profile} />
          <h2 style={styles.name}>ADMIN</h2>
        </Tile>

        <Tile title="TIME">{time.toLocaleTimeString()}</Tile>

        <Tile title="LIVE USERS 🔴">{liveUsers}</Tile>

        <Tile title="SYSTEM">{status}</Tile>

        <Tile title="VISITS TODAY">{visitsToday}</Tile>

        <Tile title="TOTAL VISITS">{totalVisits}</Tile>

        <Tile title="AVG TIME">
          {Math.floor(avgTime / 1000)} sec
        </Tile>

        <Tile title="MADAGASCAR">{madagascarUsers}</Tile>

        <Tile title="LIVE TRAFFIC">
          <Graph data={graphData} />
        </Tile>

        <Tile title="CALCULATOR">
          <Calculator />
        </Tile>

        <Tile title="CALENDAR">
          <Calendar />
        </Tile>

        <Tile full>
          <div style={styles.aboutFull}>
            <h2>ABOUT QUANTY ULTRA</h2>
            <p>Real-time monitoring system connected to Render backend.</p>
            <p>Live analytics + AI-ready architecture.</p>

            <p style={styles.signature}>
              © Gralwebs 2026
            </p>
          </div>
        </Tile>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// TILE (UNCHANGED)
//////////////////////////////////////////////////
function Tile({ title, children, large, full }) {
  return (
    <div
      style={{
        ...styles.tile,
        gridColumn: full ? "1 / -1" : large ? "span 2" : "span 1",
        gridRow: large ? "span 2" : "span 1"
      }}
    >
      {title && <h3 style={styles.label}>{title}</h3>}
      {children}
    </div>
  );
}

//////////////////////////////////////////////////
// GRAPH FIXED (NO RANDOM BUG)
//////////////////////////////////////////////////
function Graph({ data }) {
  return (
    <div style={styles.graph}>
      {data.map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.bar,
            height: 20 + (i * 4) % 80
          }}
        />
      ))}
    </div>
  );
}

//////////////////////////////////////////////////
// KEEP YOUR CALCULATOR + CALENDAR (UNCHANGED)
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// STYLES (FIXED + SAFE)
//////////////////////////////////////////////////
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#000101",
    padding: "40px",
    color: "#fff"
  },

  blurBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(100px)",
    zIndex: 0
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2
  },

  title: {
    color: "#996767",
    fontSize: "34px"
  },

  status: {
    color: "#0f0"
  },

  errorBox: {
    background: "red",
    padding: "10px",
    margin: "10px 0"
  },

  logout: {
    background: "#200e0e",
    color: "#cb4d24",
    padding: "10px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
    gap: "20px"
  },

  tile: {
    background: "rgba(57, 0, 85, 0.6)",
    padding: "20px",
    borderRadius: "20px"
  },

  label: { color: "#aaa" },

  graph: {
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
    height: 100
  },

  bar: {
    width: "6px",
    background: "#cb4d24"
  }
};