import { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useData } from "../context/DataContext";

ChartJS.register(ArcElement, Tooltip, Legend);

// Get user's first name from localStorage
const getUserFirstName = () => {
  const saved = localStorage.getItem("smartspend_user");
  if (saved) {
    const user = JSON.parse(saved);
    return user.name?.split(" ")[0] || "there";
  }
  return "there";
};

export default function Dashboard() {
  const { transactions, getTotalSpent, getSpendingByCategory, deleteTransaction, addTransaction } = useData();
  
  // Get user's first name from localStorage
  const userName = getUserFirstName();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: "Food"
  });

  const categoryOptions = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Subscriptions", "Other"];
  
  const totalSpent = getTotalSpent();
  const spendingByCategory = getSpendingByCategory();
  
  const categories = Object.keys(spendingByCategory);
  const amounts = Object.values(spendingByCategory);
  
  const chartData = {
    labels: categories,
    datasets: [{
      data: amounts,
      backgroundColor: ["#e74c3c", "#3498db", "#9b59b6", "#2ecc71", "#f39c12", "#1abc9c", "#95a5a6"],
      borderWidth: 0
    }]
  };

  const alerts = [
    { type: "warning", message: `Total spending this month: £${totalSpent.toFixed(2)}` },
    { type: "info", message: `You have ${transactions.length} transactions recorded` },
    totalSpent > 1000 && { type: "danger", message: "Spending is over £1,000 this month" }
  ].filter(Boolean);

  // Get 5 most recent transactions
  const recentExpenses = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleDelete = (id) => {
    if (window.confirm("Delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      addTransaction({
        date: newExpense.date,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category
      });
      setNewExpense({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        category: "Food"
      });
      setShowAddModal(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Hi {userName}! 👋</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Here is your spending overview for February 2026</p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">Total Spent</div>
          <div className="card-value">£{totalSpent.toFixed(2)}</div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>{transactions.length} transactions</div>
        </div>
        <div className="card">
          <div className="card-header">Categories</div>
          <div className="card-value">{categories.length}</div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>Spending categories</div>
        </div>
        <div className="card">
          <div className="card-header">Avg. Transaction</div>
          <div className="card-value">£{transactions.length > 0 ? (totalSpent / transactions.length).toFixed(2) : "0.00"}</div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>Per transaction</div>
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
            {categories.length > 0 ? (
              <Pie data={chartData} options={{ plugins: { legend: { position: "bottom" } } }} />
            ) : (
              <p style={{ textAlign: "center", color: "#888" }}>No transactions yet</p>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>💸 Recent Expenses</h3>
            <button 
              className="btn"
              onClick={() => setShowAddModal(true)}
              style={{ padding: "8px 16px", fontSize: 14 }}
            >
              ➕ Add Expense
            </button>
          </div>
          {recentExpenses.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontSize: 13, color: "#888" }}>{exp.date}</td>
                    <td>{exp.description}</td>
                    <td><span style={{ 
                      background: "#f0f0f0", 
                      padding: "4px 10px", 
                      borderRadius: 12, 
                      fontSize: 13 
                    }}>{exp.category}</span></td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>£{exp.amount.toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(exp.id)}
                        style={{
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: 12
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#888" }}>No transactions yet. Click "Add Expense" to get started!</p>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "white", padding: 32, borderRadius: 12, width: 400, maxWidth: "90%" }}>
            <h3 style={{ marginBottom: 20 }}>➕ Add New Expense</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Date</label>
              <input 
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Description</label>
              <input 
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="e.g., Tesco Groceries"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Amount (£)</label>
              <input 
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                className="btn" 
                style={{ background: "#eee", color: "#555" }}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="btn" onClick={handleAddExpense}>
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
