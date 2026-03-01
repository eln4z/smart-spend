import { useState, useRef } from "react";
import { useData } from "../context/DataContext";

export default function Settings() {
  const { transactions, categories: apiCategories, loading, clearAllData, resetToDefault, importTransactions, exportToCSV, addTransaction, darkMode, setDarkMode } = useData();
  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importText, setImportText] = useState("");
  
  // Use API categories or fall back to defaults
  const categories = apiCategories?.length > 0 
    ? apiCategories.map(c => c.name) 
    : ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Subscriptions", "Other"];

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: categories[0] || "Food"
  });

  const [settings, setSettings] = useState({
    currency: "GBP",
    monthlyBudget: 1500,
    alertThreshold: 100,
    weekStartDay: "Monday",
    darkMode: false,
    emailAlerts: true,
    weeklyReport: true,
    overspendingAlerts: true,
    lowBalanceAlerts: true,
    upcomingBillAlerts: true
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleExport = () => {
    exportToCSV();
    alert("Transactions exported to CSV!");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete ALL transactions? This cannot be undone.")) {
      clearAllData();
      alert("All data has been cleared.");
    }
  };

  const handleResetDefault = () => {
    if (window.confirm("Reset to sample data? This will replace your current transactions.")) {
      resetToDefault();
      alert("Data reset to defaults.");
    }
  };

  const handleImportCSV = () => {
    if (importText.trim()) {
      const count = importTransactions(importText);
      alert(`Successfully imported ${count} transactions!`);
      setImportText("");
      setShowImportModal(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleAddTransaction = async () => {
    if (newTransaction.description && newTransaction.amount) {
      // Find the category object to get its ID
      const categoryObj = apiCategories?.find(c => c.name === newTransaction.category);
      
      await addTransaction({
        date: newTransaction.date,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        categoryId: categoryObj?._id,
        type: 'expense'
      });
      alert("Transaction added!");
      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        category: categories[0] || "Food"
      });
      setShowAddModal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <p style={{ color: "#888" }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Settings</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Customize your SmartSpend experience</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* General Settings */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>⚙️ General Settings</h3>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Currency</label>
            <select 
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
            >
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Monthly Budget (£)</label>
            <input 
              type="number" 
              value={settings.monthlyBudget}
              onChange={(e) => handleChange("monthlyBudget", Number(e.target.value))}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Low Balance Alert Threshold (£)</label>
            <input 
              type="number" 
              value={settings.alertThreshold}
              onChange={(e) => handleChange("alertThreshold", Number(e.target.value))}
            />
            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Get alerted when projected balance falls below this amount</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Week Starts On</label>
            <select 
              value={settings.weekStartDay}
              onChange={(e) => handleChange("weekStartDay", e.target.value)}
            >
              <option value="Monday">Monday</option>
              <option value="Sunday">Sunday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #eee" }}>
            <div>
              <div style={{ fontWeight: 500 }}>Dark Mode</div>
              <div style={{ color: "#888", fontSize: 13 }}>Use dark theme for the app</div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: 50, height: 28 }}>
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0, left: 0, right: 0, bottom: 0,
                background: darkMode ? "#6c5ce7" : "#ccc",
                borderRadius: 28,
                transition: "0.3s"
              }}>
                <span style={{
                  position: "absolute",
                  height: 22,
                  width: 22,
                  left: darkMode ? 25 : 3,
                  bottom: 3,
                  background: "white",
                  borderRadius: "50%",
                  transition: "0.3s"
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>🔔 Notification Settings</h3>

          {[
            { key: "emailAlerts", title: "Email Alerts", desc: "Receive alerts via email" },
            { key: "weeklyReport", title: "Weekly Report", desc: "Get a weekly spending summary" },
            { key: "overspendingAlerts", title: "Overspending Alerts", desc: "Alert when spending exceeds average" },
            { key: "lowBalanceAlerts", title: "Low Balance Alerts", desc: "Alert when balance is projected low" },
            { key: "upcomingBillAlerts", title: "Upcoming Bill Alerts", desc: "Remind about upcoming subscriptions" }
          ].map(item => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #eee" }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: "#888", fontSize: 13 }}>{item.desc}</div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: 50, height: 28 }}>
                <input 
                  type="checkbox" 
                  checked={settings[item.key]}
                  onChange={(e) => handleChange(item.key, e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: settings[item.key] ? "#6c5ce7" : "#ccc",
                  borderRadius: 28,
                  transition: "0.3s"
                }}>
                  <span style={{
                    position: "absolute",
                    height: 22,
                    width: 22,
                    left: settings[item.key] ? 25 : 3,
                    bottom: 3,
                    background: "white",
                    borderRadius: "50%",
                    transition: "0.3s"
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 20 }}>📁 Data Management</h3>
        <p style={{ marginBottom: 16, color: "#666" }}>
          You currently have <strong>{transactions.length}</strong> transactions stored.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button className="btn" style={{ background: "#3498db" }} onClick={handleExport}>
            📥 Export Data (CSV)
          </button>
          <button className="btn" style={{ background: "#2ecc71" }} onClick={() => setShowImportModal(true)}>
            📤 Import Transactions
          </button>
          <button className="btn" style={{ background: "#f39c12" }} onClick={handleResetDefault}>
            🔄 Reset to Sample Data
          </button>
          <button className="btn" style={{ background: "#e74c3c" }} onClick={handleClearAll}>
            🗑️ Clear All Data
          </button>
        </div>
        <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
          Your data is stored locally in your browser. Export regularly to keep a backup.
        </p>
      </div>

      {/* Quick Add Transaction */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 20 }}>➕ Quick Add Transaction</h3>
        <button className="btn" onClick={() => setShowAddModal(true)}>
          Add New Transaction
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "white", padding: 32, borderRadius: 12, width: 500, maxWidth: "90%" }}>
            <h3 style={{ marginBottom: 20 }}>📤 Import Transactions</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Upload CSV File</label>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ marginBottom: 16 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Or Paste CSV Data</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Date,Description,Amount,Category
2026-02-10,Tesco,45.00,Food
2026-02-09,Uber,12.50,Transport"
                style={{
                  width: "100%",
                  height: 150,
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontFamily: "monospace",
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                className="btn" 
                style={{ background: "#eee", color: "#555" }}
                onClick={() => { setShowImportModal(false); setImportText(""); }}
              >
                Cancel
              </button>
              <button className="btn" onClick={handleImportCSV}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
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
            <h3 style={{ marginBottom: 20 }}>➕ Add Transaction</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Date</label>
              <input 
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
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
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
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
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
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
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8
                }}
              >
                {categories.map(cat => (
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
              <button className="btn" onClick={handleAddTransaction}>
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button className="btn" style={{ background: "#eee", color: "#555" }}>
          Cancel
        </button>
        <button className="btn" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}