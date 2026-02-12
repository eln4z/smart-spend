import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

const defaultTransactions = [
  { id: 1, date: "2026-02-10", description: "Tesco Superstore", amount: 87.50, category: "Food" },
  { id: 2, date: "2026-02-09", description: "Uber Trip", amount: 12.50, category: "Transport" },
  { id: 3, date: "2026-02-08", description: "Netflix", amount: 12.99, category: "Entertainment" },
  { id: 4, date: "2026-02-07", description: "Amazon Prime", amount: 8.99, category: "Subscriptions" },
  { id: 5, date: "2026-02-06", description: "Costa Coffee", amount: 4.50, category: "Food" },
  { id: 6, date: "2026-02-05", description: "TfL Oyster", amount: 35.00, category: "Transport" },
  { id: 7, date: "2026-02-04", description: "Deliveroo", amount: 18.99, category: "Food" },
  { id: 8, date: "2026-02-03", description: "Spotify", amount: 10.99, category: "Entertainment" },
  { id: 9, date: "2026-02-01", description: "Rent Payment", amount: 650.00, category: "Bills" },
  { id: 10, date: "2026-02-02", description: "Electric Bill", amount: 45.00, category: "Bills" }
];

const defaultCategories = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Subscriptions", "Other"];

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("smartspend_transactions");
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("smartspend_categories");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("smartspend_settings");
    return saved ? JSON.parse(saved) : {
      currency: "GBP",
      monthlyBudget: 1500,
      alertThreshold: 100,
      startingBalance: 1500
    };
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("smartspend_darkmode");
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to body
  useEffect(() => {
    localStorage.setItem("smartspend_darkmode", JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("smartspend_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("smartspend_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("smartspend_settings", JSON.stringify(settings));
  }, [settings]);

  // Add a transaction
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now()
    };
    setTransactions([newTransaction, ...transactions]);
  };

  // Delete a transaction
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Update a transaction
  const updateTransaction = (id, updates) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Clear all data
  const clearAllData = () => {
    setTransactions([]);
    localStorage.removeItem("smartspend_transactions");
  };

  // Reset to default data
  const resetToDefault = () => {
    setTransactions(defaultTransactions);
  };

  // Import transactions from CSV text
  const importTransactions = (csvText) => {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const newTransactions = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (values.length >= 3) {
        const transaction = {
          id: Date.now() + i,
          date: values[headers.indexOf("date")] || new Date().toISOString().split("T")[0],
          description: values[headers.indexOf("description")] || values[0],
          amount: parseFloat(values[headers.indexOf("amount")]) || parseFloat(values[1]) || 0,
          category: values[headers.indexOf("category")] || values[2] || "Other"
        };
        newTransactions.push(transaction);
      }
    }
    
    setTransactions([...newTransactions, ...transactions]);
    return newTransactions.length;
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = "Date,Description,Amount,Category\n";
    const rows = transactions.map(t => 
      `${t.date},"${t.description}",${t.amount},${t.category}`
    ).join("\n");
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartspend_transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const getTotalSpent = () => transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const getSpendingByCategory = () => {
    const byCategory = {};
    transactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return byCategory;
  };

  return (
    <DataContext.Provider value={{
      transactions,
      categories,
      settings,
      setSettings,
      darkMode,
      setDarkMode,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      clearAllData,
      resetToDefault,
      importTransactions,
      exportToCSV,
      getTotalSpent,
      getSpendingByCategory
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
