import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const chartData = {
    labels: ["Food", "Transport", "Entertainment", "Bills", "Shopping"],
    datasets: [{
      data: [320, 180, 150, 450, 140],
      backgroundColor: ["#e74c3c", "#3498db", "#9b59b6", "#2ecc71", "#f39c12"],
      borderWidth: 0
    }]
  };

  const alerts = [
    { type: "warning", message: "Food spending is 25% higher than last week" },
    { type: "info", message: "Netflix subscription due in 3 days (£12.99)" },
    { type: "danger", message: "Projected balance is below £100" }
  ];

  const expenses = [
    { name: "Rent", amount: 650, category: "Bills" },
    { name: "Groceries - Tesco", amount: 87.50, category: "Food" },
    { name: "Train Pass", amount: 95, category: "Transport" },
    { name: "Amazon Order", amount: 45.99, category: "Shopping" },
    { name: "Uber Eats", amount: 32.80, category: "Food" }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Your spending overview for February 2026</p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">Total Spent</div>
          <div className="card-value">£1,240</div>
          <div style={{ color: "#e74c3c", fontSize: 14, marginTop: 8 }}>↑ 12% from last month</div>
        </div>
        <div className="card">
          <div className="card-header">Current Balance</div>
          <div className="card-value">£485</div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>Updated today</div>
        </div>
        <div className="card">
          <div className="card-header">Projected End Balance</div>
          <div className="card-value" style={{ color: "#e74c3c" }}>£85</div>
          <div style={{ color: "#e74c3c", fontSize: 14, marginTop: 8 }}>⚠️ Below safe threshold</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>🔔 Alerts</h3>
        {alerts.map((alert, i) => (
          <div key={i} className={`alert-item ${alert.type}`}>
            {alert.type === "warning" && "⚠️ "}
            {alert.type === "info" && "ℹ️ "}
            {alert.type === "danger" && "🚨 "}
            {alert.message}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Spending by Category</h3>
          <div style={{ maxWidth: 280, margin: "0 auto" }}>
            <Pie data={chartData} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>

        {/* Biggest Expenses */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>💸 Recent Expenses</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, i) => (
                <tr key={i}>
                  <td>{exp.name}</td>
                  <td><span style={{ 
                    background: "#f0f0f0", 
                    padding: "4px 10px", 
                    borderRadius: 12, 
                    fontSize: 13 
                  }}>{exp.category}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>£{exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
