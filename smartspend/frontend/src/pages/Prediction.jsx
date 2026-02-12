import { useState } from "react";

export default function Prediction() {
  const [startingBalance, setStartingBalance] = useState(1500);
  const [weeklySpend, setWeeklySpend] = useState(300);
  const [recurringCosts, setRecurringCosts] = useState(450);

  const weeksLeft = 2;
  const projectedBalance = startingBalance - (weeklySpend * weeksLeft) - recurringCosts;

  const alerts = [
    { type: "danger", title: "Low Balance Warning", message: "Your projected end-of-month balance is below £100. Consider reducing spending." },
    { type: "warning", title: "High Food Spending", message: "You've spent 25% more on food this week compared to your average." },
    { type: "warning", title: "Upcoming Bill", message: "Your Netflix subscription (£12.99) will be charged in 3 days." },
    { type: "info", title: "Spending Spike", message: "You spent £87.50 at Tesco yesterday, which is higher than usual." }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Prediction & Alerts</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Estimate your end-of-month balance and view spending alerts</p>

      {/* Balance Prediction Card */}
      <div className="card" style={{ background: projectedBalance < 100 ? "#fff5f5" : "#f0fff4", marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>🔮 End-of-Month Balance Estimate</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 700, color: projectedBalance < 100 ? "#e74c3c" : "#2ecc71" }}>
              £{projectedBalance.toFixed(0)}
            </div>
            <div style={{ color: "#888", marginTop: 8 }}>Projected balance on 28 Feb</div>
          </div>
          <div style={{ flex: 1, padding: 20, background: "white", borderRadius: 12 }}>
            <p style={{ lineHeight: 1.8 }}>
              Based on your <strong>starting balance of £{startingBalance}</strong>, 
              average <strong>weekly spending of £{weeklySpend}</strong>, 
              and <strong>recurring costs of £{recurringCosts}</strong>, 
              you're expected to have <strong>£{projectedBalance.toFixed(0)}</strong> left 
              at the end of the month.
              {projectedBalance < 100 && (
                <span style={{ color: "#e74c3c", display: "block", marginTop: 8 }}>
                  ⚠️ This is below the safe threshold. Consider cutting back on non-essential spending.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>⚙️ Adjust Your Inputs</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#555" }}>Starting Balance (£)</label>
            <input 
              type="number" 
              value={startingBalance} 
              onChange={(e) => setStartingBalance(Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#555" }}>Avg Weekly Spend (£)</label>
            <input 
              type="number" 
              value={weeklySpend} 
              onChange={(e) => setWeeklySpend(Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#555" }}>Recurring Costs (£)</label>
            <input 
              type="number" 
              value={recurringCosts} 
              onChange={(e) => setRecurringCosts(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>🔔 Alerts Feed</h3>
        {alerts.map((alert, i) => (
          <div key={i} className={`alert-item ${alert.type}`} style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {alert.type === "danger" && "🚨 "}
              {alert.type === "warning" && "⚠️ "}
              {alert.type === "info" && "ℹ️ "}
              {alert.title}
            </div>
            <div style={{ color: "#666" }}>{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
