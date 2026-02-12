import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkStyle = ({ isActive }) => ({
    marginRight: 28,
    textDecoration: "none",
    fontWeight: isActive ? 600 : 500,
    color: isActive ? "#6c5ce7" : "#555",
    fontSize: 15,
    padding: "8px 0",
    borderBottom: isActive ? "2px solid #6c5ce7" : "2px solid transparent"
  });

  return (
    <div style={{
      background: "white",
      padding: "0 40px",
      display: "flex",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <span style={{ 
        fontWeight: 700, 
        fontSize: 24, 
        marginRight: 60,
        color: "#6c5ce7",
        padding: "20px 0"
      }}>
        💰 SmartSpend
      </span>
      <nav style={{ display: "flex" }}>
        <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/breakdown" style={linkStyle}>Breakdown</NavLink>
        <NavLink to="/prediction" style={linkStyle}>Prediction</NavLink>
        <NavLink to="/categories" style={linkStyle}>Categories</NavLink>
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: "#888", fontSize: 14 }}>February 2026</span>
        <button style={{
          background: "#f0f0f0",
          border: "none",
          padding: "8px 16px",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14
        }}>⚙️ Settings</button>
      </div>
    </div>
  );
}
