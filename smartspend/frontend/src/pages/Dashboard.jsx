import Card from "../components/Card";

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <Card title="Total Spent" value="£1,240" />
        <Card title="Projected Balance" value="£320" />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <Card title="Alerts (Top 3)">
          <ul>
            <li>Food spending high this week</li>
            <li>Netflix subscription due soon</li>
            <li>Projected balance low</li>
          </ul>
        </Card>
      </div>

      <Card title="Spending by Category (Chart Placeholder)">
        <div style={{ height: "200px", background: "#ddd" }} />
      </Card>

      <Card title="Biggest Expenses">
        <ul>
          <li>Rent – £650</li>
          <li>Groceries – £180</li>
          <li>Transport – £95</li>
        </ul>
      </Card>
    </div>
  );
}
