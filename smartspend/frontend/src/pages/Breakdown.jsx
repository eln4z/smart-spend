import { Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function Breakdown() {
  const pieData = {
    labels: ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Other"],
    datasets: [{
      data: [320, 180, 150, 450, 140, 60],
      backgroundColor: ["#e74c3c", "#3498db", "#9b59b6", "#2ecc71", "#f39c12", "#95a5a6"],
      borderWidth: 0
    }]
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      label: "Spending (£)",
      data: [280, 350, 290, 380],
      borderColor: "#6c5ce7",
      backgroundColor: "rgba(108, 92, 231, 0.1)",
      fill: true,
      tension: 0.4
    }]
  };

  const categories = [
    { name: "Bills", total: 450, percent: 34.6, trend: "stable" },
    { name: "Food", total: 320, percent: 24.6, trend: "up" },
    { name: "Transport", total: 180, percent: 13.8, trend: "down" },
    { name: "Entertainment", total: 150, percent: 11.5, trend: "up" },
    { name: "Shopping", total: 140, percent: 10.8, trend: "stable" },
    { name: "Other", total: 60, percent: 4.6, trend: "stable" }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Spending Breakdown</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Detailed view of where your money goes</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Category Distribution</h3>
          <div style={{ maxWidth: 300, margin: "0 auto" }}>
            <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📈 Weekly Spending Trend</h3>
          <Line data={lineData} options={{ 
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
          }} />
        </div>
      </div>

      {/* Category Table */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>📋 Category Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th style={{ textAlign: "right" }}>% of Spending</th>
              <th style={{ textAlign: "center" }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{cat.name}</td>
                <td style={{ textAlign: "right" }}>£{cat.total.toFixed(2)}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <div style={{ 
                      width: 60, 
                      height: 8, 
                      background: "#eee", 
                      borderRadius: 4,
                      overflow: "hidden"
                    }}>
                      <div style={{ 
                        width: `${cat.percent}%`, 
                        height: "100%", 
                        background: "#6c5ce7",
                        borderRadius: 4
                      }} />
                    </div>
                    {cat.percent}%
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  {cat.trend === "up" && <span style={{ color: "#e74c3c" }}>↑</span>}
                  {cat.trend === "down" && <span style={{ color: "#2ecc71" }}>↓</span>}
                  {cat.trend === "stable" && <span style={{ color: "#888" }}>→</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
