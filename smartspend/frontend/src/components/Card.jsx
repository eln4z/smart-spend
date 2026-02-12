export default function Card({ title, value, children }) {
  return (
    <div style={{
      background: "#d8d0ea",
      padding: "20px",
      borderRadius: "8px",
      flex: 1
    }}>
      <h3>{title}</h3>
      {value && <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>}
      {children}
    </div>
  );
}
