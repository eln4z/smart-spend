import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{ background: "#e6eef6", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "auto", padding: "30px" }}>
        {children}
      </div>
    </div>
  );
}
