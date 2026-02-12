import { useState } from "react";

// Alert explanations database - Why it happened & How to improve
const alertExplanations = {
  lowBalance: {
    why: "Your spending rate this month is higher than your income allows, causing your projected balance to drop below safe levels.",
    howToFix: [
      "Review and cut non-essential subscriptions",
      "Set a daily spending limit of £15-20",
      "Postpone large purchases until next month",
      "Look for cheaper alternatives for regular expenses"
    ]
  },
  highSpending: {
    why: "Your total spending has exceeded £1,000, which may indicate overspending or unexpected expenses.",
    howToFix: [
      "Review your largest transactions for patterns",
      "Set spending alerts for each category",
      "Try the 24-hour rule before big purchases",
      "Consider meal prepping to reduce food costs"
    ]
  },
  highCategorySpending: {
    why: "One category is taking up a larger share of your budget than recommended.",
    howToFix: [
      "Set a specific budget cap for this category",
      "Track each purchase in real-time",
      "Find free or cheaper alternatives",
      "Use the 50/30/20 rule as a guide"
    ]
  },
  upcomingBill: {
    why: "You have a recurring payment due soon. Making sure you have funds ready prevents overdrafts.",
    howToFix: [
      "Set aside money for bills at the start of the month",
      "Consider if you still need this subscription",
      "Look for student or promotional discounts",
      "Bundle services where possible"
    ]
  },
  spendingSpike: {
    why: "A single large transaction was detected that's significantly higher than your usual spending.",
    howToFix: [
      "Check if this was a one-time or recurring expense",
      "Plan for large purchases in advance",
      "Consider if similar items could be bought cheaper",
      "Budget for occasional large expenses monthly"
    ]
  },
  overBudget: {
    why: "You've spent more than your planned budget allows for this time in the month.",
    howToFix: [
      "Pause all non-essential spending for a few days",
      "Use cash-only for the rest of the month",
      "Cancel or postpone any upcoming purchases",
      "Review what pushed you over budget"
    ]
  },
  manyTransactions: {
    why: "Multiple small purchases add up quickly and are harder to track mentally.",
    howToFix: [
      "Consolidate shopping into fewer trips",
      "Review if small purchases are necessary",
      "Set a 'coffee budget' or 'treat budget'",
      "Use a spending tracker daily"
    ]
  },
  default: {
    why: "This alert is helping you stay aware of your financial activity.",
    howToFix: [
      "Review your spending weekly",
      "Set clear financial goals",
      "Track progress regularly",
      "Celebrate small wins"
    ]
  }
};

// Determine explanation type based on alert content
function getExplanationType(alert) {
  const message = (alert.message + " " + (alert.title || "")).toLowerCase();
  
  if (message.includes("low balance") || message.includes("projected") || message.includes("below £100")) {
    return "lowBalance";
  }
  if (message.includes("over £1,000") || message.includes("high spending") || message.includes("exceeds")) {
    return "highSpending";
  }
  if (message.includes("food") || message.includes("entertainment") || message.includes("category")) {
    return "highCategorySpending";
  }
  if (message.includes("bill") || message.includes("subscription") || message.includes("charged")) {
    return "upcomingBill";
  }
  if (message.includes("spike") || message.includes("higher than usual") || message.includes("large")) {
    return "spendingSpike";
  }
  if (message.includes("over budget") || message.includes("exceeded")) {
    return "overBudget";
  }
  if (message.includes("transaction")) {
    return "manyTransactions";
  }
  return "default";
}

// Single Alert Item with expandable explanation
function AlertItem({ alert, index }) {
  const [expanded, setExpanded] = useState(false);
  
  const explanationType = getExplanationType(alert);
  const explanation = alertExplanations[explanationType];
  
  const getTypeStyles = (type) => {
    switch (type) {
      case "danger":
        return {
          bg: "linear-gradient(135deg, rgba(231, 76, 60, 0.08) 0%, rgba(231, 76, 60, 0.03) 100%)",
          border: "rgba(231, 76, 60, 0.3)",
          accent: "#e74c3c",
          icon: "🚨"
        };
      case "warning":
        return {
          bg: "linear-gradient(135deg, rgba(241, 196, 15, 0.08) 0%, rgba(241, 196, 15, 0.03) 100%)",
          border: "rgba(241, 196, 15, 0.3)",
          accent: "#f1c40f",
          icon: "⚠️"
        };
      case "info":
      default:
        return {
          bg: "linear-gradient(135deg, rgba(52, 152, 219, 0.08) 0%, rgba(52, 152, 219, 0.03) 100%)",
          border: "rgba(52, 152, 219, 0.3)",
          accent: "#3498db",
          icon: "ℹ️"
        };
    }
  };
  
  const styles = getTypeStyles(alert.type);
  
  return (
    <div 
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: index === 0 ? 0 : 12,
        marginTop: index === 0 ? 0 : 12,
        transition: "all 0.2s ease"
      }}
    >
      {/* Alert Header */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          gap: 12,
          cursor: "pointer"
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: 20 }}>{styles.icon}</span>
        <div style={{ flex: 1 }}>
          {alert.title && (
            <div style={{ fontWeight: 600, marginBottom: 4, color: styles.accent }}>
              {alert.title}
            </div>
          )}
          <div style={{ color: "inherit", lineHeight: 1.5 }}>
            {alert.message}
          </div>
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#888",
            padding: 4,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          ▼
        </button>
      </div>
      
      {/* Expanded Explanation */}
      {expanded && (
        <div 
          style={{ 
            marginTop: 16, 
            paddingTop: 16, 
            borderTop: `1px solid ${styles.border}`,
            animation: "fadeIn 0.2s ease"
          }}
        >
          {/* Why This Happened */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 8 
            }}>
              <span style={{ fontSize: 16 }}>🔍</span>
              <span style={{ fontWeight: 600, color: styles.accent }}>Why this happened</span>
            </div>
            <p style={{ 
              margin: 0, 
              paddingLeft: 24, 
              color: "#666", 
              lineHeight: 1.6,
              fontSize: 14
            }}>
              {explanation.why}
            </p>
          </div>
          
          {/* How To Improve */}
          <div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 8 
            }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ fontWeight: 600, color: "#2ecc71" }}>How to improve it</span>
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: 40, 
              color: "#666",
              lineHeight: 1.8,
              fontSize: 14
            }}>
              {explanation.howToFix.map((tip, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Action */}
          <div style={{ 
            marginTop: 16, 
            display: "flex", 
            gap: 12,
            flexWrap: "wrap"
          }}>
            <a 
              href="/smarttips"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                color: "white",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              📚 Learn More Tips
            </a>
            <a 
              href="/categories"
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(108, 92, 231, 0.1)",
                color: "#6c5ce7",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              📊 View Categories
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Main AlertsPanel Component
export default function AlertsPanel({ alerts, title = "🔔 Alerts", showHeader = true }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card">
        {showHeader && <h3 style={{ marginBottom: 16 }}>{title}</h3>}
        <div style={{ 
          textAlign: "center", 
          padding: 24, 
          color: "#888" 
        }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>✨</span>
          No alerts right now. You're doing great!
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      {showHeader && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: 16 
        }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span style={{ 
            fontSize: 12, 
            color: "#888",
            fontStyle: "italic"
          }}>
            Click alerts to see explanations
          </span>
        </div>
      )}
      
      <div>
        {alerts.map((alert, i) => (
          <AlertItem key={i} alert={alert} index={i} />
        ))}
      </div>
    </div>
  );
}
