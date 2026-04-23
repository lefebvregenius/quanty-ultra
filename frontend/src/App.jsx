import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./styles.css";

export default function App() {
  const [logged, setLogged] = useState(false);

  return logged ? (
    <Dashboard />
  ) : (
    <Login onLogin={() => setLogged(true)} />
  );
}