import { useState, useEffect } from "react";
import { useData } from "../context/DataContext";

export default function Categories() {
  const { transactions: globalTransactions, categories: apiCategories, loading, updateTransaction } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  
  // Create local state with editedCategory field
  const [localTransactions, setLocalTransactions] = useState([]);

  // Use API categories or fall back to defaults
  const categories = apiCategories.length > 0 
    ? apiCategories.map(c => c.name) 
    : ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Subscriptions", "Other"];

  // Sync local state with global transactions
  useEffect(() => {
    setLocalTransactions(
      globalTransactions.map(t => ({
        ...t,
        suggestedCategory: t.category,
        editedCategory: ""
      }))
    );
  }, [globalTransactions]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <p style={{ color: "#888" }}>Loading categories...</p>
        </div>
      </div>
    );
  }

  const handleCategoryChange = (id, newCategory) => {
    setLocalTransactions(localTransactions.map(t => 
      t.id === id ? { ...t, editedCategory: newCategory } : t
    ));
  };

  const handleReset = () => {
    setLocalTransactions(
      globalTransactions.map(t => ({
        ...t,
        suggestedCategory: t.category,
        editedCategory: ""
      }))
    );
  };

  const handleSave = () => {
    // Update all transactions that have changes
    let changeCount = 0;
    localTransactions.forEach(t => {
      if (t.editedCategory && t.editedCategory !== t.suggestedCategory) {
        updateTransaction(t.id, { category: t.editedCategory });
        changeCount++;
      }
    });
    
    if (changeCount > 0) {
      alert(`✅ Saved ${changeCount} category change${changeCount > 1 ? 's' : ''}! Charts will update automatically.`);
    } else {
      alert("No changes to save.");
    }
  };

  const filteredTransactions = localTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || 
      (t.editedCategory || t.suggestedCategory) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const hasChanges = localTransactions.some(t => t.editedCategory && t.editedCategory !== t.suggestedCategory);
  const changeCount = localTransactions.filter(t => t.editedCategory && t.editedCategory !== t.suggestedCategory).length;

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
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: "auto", padding: "10px 16px" }}
          >
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
        <div style={{ color: hasChanges ? "#f39c12" : "#888" }}>
          {hasChanges 
            ? `✏️ You have ${changeCount} unsaved change${changeCount > 1 ? 's' : ''}` 
            : `✅ All categories are up to date`
          }
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            className="btn" 
            style={{ background: "#eee", color: "#555", opacity: hasChanges ? 1 : 0.5 }}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset Changes
          </button>
          <button 
            className="btn"
            style={{ opacity: hasChanges ? 1 : 0.5 }}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            💾 Save & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
