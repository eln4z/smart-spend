import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{ background: "#e8f4fc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {children}
      </div>
    </div>
  );
}
