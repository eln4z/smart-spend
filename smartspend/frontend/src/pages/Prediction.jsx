import { useState, useEffect } from "react";
import AlertsPanel from "../components/AlertsPanel";

// Default subscriptions list
const defaultSubscriptions = [
  { id: 1, name: "Netflix", amount: 12.99, billingDay: 1, active: true },
  { id: 2, name: "Spotify", amount: 10.99, billingDay: 15, active: true },
  { id: 3, name: "Amazon Prime", amount: 8.99, billingDay: 5, active: true },
  { id: 4, name: "Disney+", amount: 7.99, billingDay: 10, active: false },
  { id: 5, name: "Gym Membership", amount: 29.99, billingDay: 1, active: true },
];

export default function Prediction() {
  // Load starting balance from user profile (monthly budget)
  const [startingBalance, setStartingBalance] = useState(() => {
    const savedUser = localStorage.getItem("smartspend_user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.monthlyBudget || 1500;
    }
    return 1500;
  });
  const [weeklySpend, setWeeklySpend] = useState(300);
  
  // Load subscriptions from localStorage or use defaults
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem("smartspend_subscriptions");
    return saved ? JSON.parse(saved) : defaultSubscriptions;
  });
  
  // New subscription form
  const [newSub, setNewSub] = useState({ name: "", amount: "", billingDay: 1 });
  const [showAddForm, setShowAddForm] = useState(false);

  // Save subscriptions to localStorage when they change
  useEffect(() => {
    localStorage.setItem("smartspend_subscriptions", JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Listen for changes to user profile in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem("smartspend_user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.monthlyBudget) {
          setStartingBalance(user.monthlyBudget);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Calculate total monthly subscriptions
  const activeSubscriptions = subscriptions.filter(s => s.active);
  const totalSubscriptions = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
  
  // Calculate upcoming subscriptions this month
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const upcomingThisMonth = activeSubscriptions.filter(s => s.billingDay > currentDay);
  const paidThisMonth = activeSubscriptions.filter(s => s.billingDay <= currentDay);
  const upcomingTotal = upcomingThisMonth.reduce((sum, s) => sum + s.amount, 0);
  const paidTotal = paidThisMonth.reduce((sum, s) => sum + s.amount, 0);

  const weeksLeft = Math.ceil((daysInMonth - currentDay) / 7);
  const projectedBalance = startingBalance - (weeklySpend * weeksLeft) - upcomingTotal;

  // Generate alerts based on subscriptions
  const generateAlerts = () => {
    const alerts = [];
    
    // Check for upcoming subscriptions in next 3 days
    upcomingThisMonth.forEach(sub => {
      const daysUntil = sub.billingDay - currentDay;
      if (daysUntil <= 3 && daysUntil > 0) {
        alerts.push({
          type: "warning",
          title: "Upcoming Subscription",
          message: `${sub.name} (£${sub.amount.toFixed(2)}) will be charged in ${daysUntil} day${daysUntil > 1 ? 's' : ''} on the ${sub.billingDay}${getOrdinal(sub.billingDay)}.`
        });
      }
    });
    
    // Low balance warning
    if (projectedBalance < 100) {
      alerts.push({
        type: "danger",
        title: "Low Balance Warning",
        message: "Your projected end-of-month balance is below £100. Consider reducing spending."
      });
    }
    
    // High subscription cost warning
    if (totalSubscriptions > startingBalance * 0.15) {
      alerts.push({
        type: "warning",
        title: "High Subscription Costs",
        message: `Your subscriptions total £${totalSubscriptions.toFixed(2)}/month (${((totalSubscriptions / startingBalance) * 100).toFixed(0)}% of budget). Review if all are needed.`
      });
    }
    
    // Add info about paid subscriptions
    if (paidThisMonth.length > 0) {
      alerts.push({
        type: "info",
        title: "Subscriptions Paid",
        message: `${paidThisMonth.length} subscription${paidThisMonth.length > 1 ? 's' : ''} already charged this month (£${paidTotal.toFixed(2)} total).`
      });
    }
    
    return alerts;
  };
  
  // Helper for ordinal suffixes
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Add new subscription
  const handleAddSubscription = () => {
    if (newSub.name && newSub.amount) {
      setSubscriptions([
        ...subscriptions,
        {
          id: Date.now(),
          name: newSub.name,
          amount: parseFloat(newSub.amount),
          billingDay: parseInt(newSub.billingDay),
          active: true
        }
      ]);
      setNewSub({ name: "", amount: "", billingDay: 1 });
      setShowAddForm(false);
    }
  };

  // Toggle subscription active state
  const toggleSubscription = (id) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  // Delete subscription
  const deleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const alerts = generateAlerts();

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Prediction & Alerts</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Estimate your end-of-month balance and manage subscriptions</p>

      {/* Balance Prediction Card */}
      <div className="card" style={{ background: projectedBalance < 100 ? "#fff5f5" : "#f0fff4", marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>🔮 End-of-Month Balance Estimate</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 700, color: projectedBalance < 100 ? "#e74c3c" : "#2ecc71" }}>
              £{projectedBalance.toFixed(0)}
            </div>
            <div style={{ color: "#888", marginTop: 8 }}>Projected balance on {daysInMonth} {today.toLocaleString('default', { month: 'short' })}</div>
          </div>
          {projectedBalance < 100 && (
            <div style={{ flex: 1, padding: 20, background: "white", borderRadius: 12 }}>
              <p style={{ lineHeight: 1.8, color: "#e74c3c", margin: 0 }}>
                ⚠️ This is below the safe threshold. Consider cutting back on non-essential spending.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscriptions Manager */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📱 Monthly Subscriptions</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ 
              background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
              color: "white",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600
            }}>
              £{totalSubscriptions.toFixed(2)}/month
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: showAddForm ? "#e74c3c" : "#2ecc71",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              {showAddForm ? "Cancel" : "+ Add"}
            </button>
          </div>
        </div>

        {/* Add subscription form */}
        {showAddForm && (
          <div style={{ 
            background: "#f8f9fa", 
            padding: 16, 
            borderRadius: 12, 
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr auto",
            gap: 12,
            alignItems: "end"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#666" }}>Name</label>
              <input
                type="text"
                placeholder="e.g., Netflix"
                value={newSub.name}
                onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#666" }}>Amount (£)</label>
              <input
                type="number"
                placeholder="12.99"
                value={newSub.amount}
                onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#666" }}>Billing Day</label>
              <select
                value={newSub.billingDay}
                onChange={(e) => setNewSub({ ...newSub, billingDay: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ddd" }}
              >
                {[...Array(28)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}{getOrdinal(i + 1)}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddSubscription}
              style={{
                background: "#6c5ce7",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Add
            </button>
          </div>
        )}

        {/* Subscription list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {subscriptions.map(sub => {
            const isPaid = sub.billingDay <= currentDay && sub.active;
            const daysUntil = sub.billingDay - currentDay;
            
            return (
              <div 
                key={sub.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 10,
                  background: !sub.active ? "#f8f9fa" : isPaid ? "rgba(46, 204, 113, 0.08)" : "rgba(108, 92, 231, 0.08)",
                  border: `1px solid ${!sub.active ? "#e9ecef" : isPaid ? "rgba(46, 204, 113, 0.2)" : "rgba(108, 92, 231, 0.2)"}`,
                  opacity: sub.active ? 1 : 0.6
                }}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleSubscription(sub.id)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${sub.active ? "#2ecc71" : "#ccc"}`,
                    background: sub.active ? "#2ecc71" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14
                  }}
                >
                  {sub.active && "✓"}
                </button>
                
                {/* Name & Date */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 600, 
                    textDecoration: sub.active ? "none" : "line-through",
                    color: sub.active ? "inherit" : "#888"
                  }}>
                    {sub.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Bills on the {sub.billingDay}{getOrdinal(sub.billingDay)} of each month
                  </div>
                </div>
                
                {/* Status */}
                {sub.active && (
                  <div style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: isPaid ? "#2ecc71" : daysUntil <= 3 ? "#f1c40f" : "#6c5ce7",
                    color: "white"
                  }}>
                    {isPaid ? "✓ Paid" : daysUntil <= 3 ? `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : `${sub.billingDay}${getOrdinal(sub.billingDay)}`}
                  </div>
                )}
                
                {/* Amount */}
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: 15,
                  color: sub.active ? "#2c3e50" : "#888",
                  minWidth: 60,
                  textAlign: "right"
                }}>
                  £{sub.amount.toFixed(2)}
                </div>
                
                {/* Delete */}
                <button
                  onClick={() => deleteSubscription(sub.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#e74c3c",
                    fontSize: 16,
                    padding: 4
                  }}
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div style={{ 
          marginTop: 16, 
          paddingTop: 16, 
          borderTop: "1px solid #eee",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Already Paid</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2ecc71" }}>£{paidTotal.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Upcoming</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#6c5ce7" }}>£{upcomingTotal.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Monthly Total</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2c3e50" }}>£{totalSubscriptions.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>⚙️ Adjust Your Inputs</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
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
        </div>
      </div>

      {/* Alerts Feed with Explanations */}
      <AlertsPanel alerts={alerts} title="🔔 Alerts Feed" />
    </div>
  );
}
