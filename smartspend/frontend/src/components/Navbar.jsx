import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkStyle = {
    marginRight: "20px",
    textDecoration: "none",
    fontWeight: "500"
  };

  return (
    <div style={{
      background: "#cdd6e8",
      padding: "20px",
      display: "flex",
      justifyContent: "center"
    }}>
      <NavLink to="/" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/breakdown" style={linkStyle}>Breakdown</NavLink>
      <NavLink to="/prediction" style={linkStyle}>Prediction</NavLink>
      <NavLink to="/categories" style={linkStyle}>Categories</NavLink>
    </div>
  );
}
