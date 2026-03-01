import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsRes, categoriesRes, budgetsRes, subscriptionsRes] = await Promise.all([
        api.transactions.getAll({ limit: 100 }),
        api.categories.getAll(),
        api.budgets.getAll(),
        api.subscriptions.getAll(),
      ]);

      // Transform transactions to match frontend format
      const formattedTransactions = transactionsRes.transactions.map(t => ({
        id: t._id,
        date: t.date.split("T")[0],
        description: t.description,
        amount: t.amount,
        category: t.category?.name || "Other",
        categoryId: t.category?._id,
        type: t.type,
        icon: t.category?.icon || "📁",
        color: t.category?.color || "#6c5ce7",
      }));

      setTransactions(formattedTransactions);
      setCategories(categoriesRes);
      setBudgets(budgetsRes);
      setSubscriptions(subscriptionsRes);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply dark mode class to body
  useEffect(() => {
    localStorage.setItem("smartspend_darkmode", JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("smartspend_settings", JSON.stringify(settings));
  }, [settings]);

  // Add a transaction
  const addTransaction = async (transaction) => {
    try {
      const result = await api.transactions.create(transaction);
      const newTx = {
        id: result.transaction._id,
        date: result.transaction.date.split("T")[0],
        description: result.transaction.description,
        amount: result.transaction.amount,
        category: result.transaction.category?.name || "Other",
        categoryId: result.transaction.category?._id,
        type: result.transaction.type,
        icon: result.transaction.category?.icon || "📁",
        color: result.transaction.category?.color || "#6c5ce7",
      };
      setTransactions([newTx, ...transactions]);
      return newTx;
    } catch (err) {
      console.error("Error adding transaction:", err);
      throw err;
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id) => {
    try {
      await api.transactions.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw err;
    }
  };

  // Update a transaction
  const updateTransaction = async (id, updates) => {
    try {
      const result = await api.transactions.update(id, updates);
      setTransactions(transactions.map(t => 
        t.id === id ? { 
          ...t, 
          ...updates,
          category: result.transaction.category?.name || t.category 
        } : t
      ));
    } catch (err) {
      console.error("Error updating transaction:", err);
      throw err;
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchData();
  };

  // Clear all data (logout)
  const clearAllData = () => {
    setTransactions([]);
    setCategories([]);
    setBudgets([]);
    setSubscriptions([]);
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = "Date,Description,Amount,Category,Type\n";
    const rows = transactions.map(t => 
      `${t.date},"${t.description}",${t.amount},${t.category},${t.type}`
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

  // Calculate totals (expenses only)
  const getTotalSpent = () => transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const getTotalIncome = () => transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const getSpendingByCategory = () => {
    const byCategory = {};
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });
    return byCategory;
  };

  // Subscription management
  const addSubscription = async (subscription) => {
    try {
      const result = await api.subscriptions.create(subscription);
      setSubscriptions([result, ...subscriptions]);
      return result;
    } catch (err) {
      console.error("Error adding subscription:", err);
      throw err;
    }
  };

  const updateSubscription = async (id, updates) => {
    try {
      const result = await api.subscriptions.update(id, updates);
      setSubscriptions(subscriptions.map(s => 
        (s._id === id || s.id === id) ? { ...s, ...result } : s
      ));
      return result;
    } catch (err) {
      console.error("Error updating subscription:", err);
      throw err;
    }
  };

  const deleteSubscription = async (id) => {
    try {
      await api.subscriptions.delete(id);
      setSubscriptions(subscriptions.filter(s => s._id !== id && s.id !== id));
    } catch (err) {
      console.error("Error deleting subscription:", err);
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{
      transactions,
      categories,
      budgets,
      subscriptions,
      loading,
      error,
      settings,
      setSettings,
      darkMode,
      setDarkMode,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      refreshData,
      clearAllData,
      exportToCSV,
      getTotalSpent,
      getTotalIncome,
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
