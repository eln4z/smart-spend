import { useState } from "react";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([
    { id: 1, description: "Tesco Superstore", amount: 87.50, suggestedCategory: "Food", editedCategory: "" },
    { id: 2, description: "Uber Trip", amount: 12.50, suggestedCategory: "Transport", editedCategory: "" },
    { id: 3, description: "Netflix", amount: 12.99, suggestedCategory: "Entertainment", editedCategory: "" },
    { id: 4, description: "Amazon Prime", amount: 8.99, suggestedCategory: "Subscriptions", editedCategory: "" },
    { id: 5, description: "Costa Coffee", amount: 4.50, suggestedCategory: "Food", editedCategory: "" },
    { id: 6, description: "TfL Oyster", amount: 35.00, suggestedCategory: "Transport", editedCategory: "" },
    { id: 7, description: "Deliveroo", amount: 18.99, suggestedCategory: "Food", editedCategory: "" },
    { id: 8, description: "Spotify", amount: 10.99, suggestedCategory: "Entertainment", editedCategory: "" }
  ]);

  const categories = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Subscriptions", "Other"];

  const handleCategoryChange = (id, newCategory) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, editedCategory: newCategory } : t
    ));
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasChanges = transactions.some(t => t.editedCategory && t.editedCategory !== t.suggestedCategory);

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Category Editor</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Review and edit automatically categorised transactions</p>

      {/* Search/Filter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="🔍 Search transactions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select style={{ width: "auto", padding: "10px 16px" }}>
            <option>All Categories</option>
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>📝 Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Suggested Category</th>
              <th>Your Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>{t.description}</td>
                <td style={{ textAlign: "right" }}>£{t.amount.toFixed(2)}</td>
                <td>
                  <span style={{ 
                    background: "#e8f4fc", 
                    padding: "4px 12px", 
                    borderRadius: 12, 
                    fontSize: 13,
                    color: "#3498db"
                  }}>
                    {t.suggestedCategory}
                  </span>
                </td>
                <td>
                  <select 
                    value={t.editedCategory || t.suggestedCategory}
                    onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                    style={{ 
                      width: "auto", 
                      padding: "6px 12px",
                      background: t.editedCategory && t.editedCategory !== t.suggestedCategory ? "#fff5eb" : "white",
                      borderColor: t.editedCategory && t.editedCategory !== t.suggestedCategory ? "#f39c12" : "#ddd"
                    }}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Actions */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#888" }}>
          {hasChanges 
            ? `✏️ You have unsaved changes` 
            : `✅ All categories are up to date`
          }
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            className="btn" 
            style={{ background: "#eee", color: "#555" }}
            onClick={() => setTransactions(transactions.map(t => ({ ...t, editedCategory: "" })))}
          >
            Reset Changes
          </button>
          <button className="btn">
            💾 Save & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
