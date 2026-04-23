import { useState, useEffect } from "react";
import axios from "axios";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  // ✨ PARTICULES
  useEffect(() => {
    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00d4ff";

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch {
      alert("ACCESS DENIED");
    }
  };

  return (
    <div style={styles.wrapper}>
      <canvas id="particles" style={styles.canvas}></canvas>

      <div style={styles.container}>
        <h1 style={styles.title}>QUANTY ULTRA</h1>
        <p style={styles.subtitle}>NEURAL ACCESS SYSTEM</p>

        <div style={styles.tile}>
          <input
            style={styles.input}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <div style={styles.passwordBox}>
            <input
              style={styles.input}
              type={show ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <span style={styles.eye} onClick={() => setShow(!show)}>
              {show ? "🙈" : "👁️"}
            </span>
          </div>

          <button style={styles.button} onClick={login}>
            ENTER SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    width: "100%",
    background: "#05070d",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial",
  },

  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },

  container: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
  },

  title: {
    color: "#00d4ff",
    letterSpacing: "6px",
    textShadow: "0 0 20px #00d4ff",
  },

  subtitle: {
    color: "#d4af37",
    marginBottom: "30px",
    letterSpacing: "2px",
  },

  tile: {
    width: "320px",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(0, 212, 255, 0.08)",
    backdropFilter: "blur(25px)",
    border: "1px solid rgba(0,212,255,0.3)",
    boxShadow: "0 0 40px rgba(0,212,255,0.2)",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  },

  passwordBox: {
    position: "relative",
  },

  eye: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "10px",
    border: "none",
    background: "#00d4ff",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
};