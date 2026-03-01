import { Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { useData } from "../context/DataContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function Breakdown() {
  const { transactions, loading, getTotalSpent, getSpendingByCategory } = useData();
  
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ color: "#888" }}>Loading your breakdown...</p>
        </div>
      </div>
    );
  }
  
  const totalSpent = getTotalSpent();
  const spendingByCategory = getSpendingByCategory();
  
  const categoryNames = Object.keys(spendingByCategory);
  const categoryAmounts = Object.values(spendingByCategory);

  const pieData = {
    labels: categoryNames,
    datasets: [{
      data: categoryAmounts,
      backgroundColor: ["#e74c3c", "#3498db", "#9b59b6", "#2ecc71", "#f39c12", "#95a5a6", "#1abc9c"],
      borderWidth: 0
    }]
  };

  // Group transactions by week for trend chart
  const getWeeklySpending = () => {
    const weeks = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const weekNum = Math.ceil(date.getDate() / 7);
      const key = `Week ${weekNum}`;
      weeks[key] = (weeks[key] || 0) + t.amount;
    });
    return weeks;
  };
  
  const weeklySpending = getWeeklySpending();

  const lineData = {
    labels: Object.keys(weeklySpending).length > 0 ? Object.keys(weeklySpending) : ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [{
      label: "Spending (£)",
      data: Object.keys(weeklySpending).length > 0 ? Object.values(weeklySpending) : [0, 0, 0, 0],
      borderColor: "#6c5ce7",
      backgroundColor: "rgba(108, 92, 231, 0.1)",
      fill: true,
      tension: 0.4
    }]
  };

  // Build categories array with percentages
  const categories = categoryNames.map(name => ({
    name,
    total: spendingByCategory[name],
    percent: totalSpent > 0 ? ((spendingByCategory[name] / totalSpent) * 100) : 0
  })).sort((a, b) => b.total - a.total);

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
        {categories.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th style={{ textAlign: "right" }}>% of Spending</th>
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
                      {cat.percent.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#888" }}>No transactions yet. Add some in Settings!</p>
        )}
      </div>
    </div>
  );
}
