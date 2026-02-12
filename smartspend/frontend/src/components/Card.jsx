import { useData } from "../context/DataContext";

export default function Card({ children, style = {} }) {
  const { darkMode } = useData();
  
  return (
    <div style={{
      background: darkMode 
        ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" 
        : "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      boxShadow: darkMode 
        ? "0 4px 20px rgba(0,0,0,0.3)" 
        : "0 4px 20px rgba(108, 92, 231, 0.08)",
      border: darkMode 
        ? "1px solid rgba(108, 92, 231, 0.2)" 
        : "1px solid rgba(108, 92, 231, 0.1)",
      transition: "all 0.3s ease",
      ...style
    }}>
      {children}
    </div>
  );
}
