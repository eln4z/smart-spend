import { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import AlertsPanel from "../components/AlertsPanel";

ChartJS.register(ArcElement, Tooltip, Legend);

// Financial Score Component
function FinancialHealthScore({ transactions, settings }) {
  // Calculate score components
  const calculateScore = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // This month's transactions
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalSpent = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const budget = settings.monthlyBudget || 1500;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    
    // 1. Budget Adherence Score (0-40 points)
    // How well are they staying within budget?
    const budgetRatio = totalSpent / budget;
    const expectedRatio = dayOfMonth / daysInMonth;
    let budgetScore = 40;
    
    if (budgetRatio > 1) {
      // Over budget
      budgetScore = Math.max(0, 40 - ((budgetRatio - 1) * 100));
    } else if (budgetRatio > expectedRatio * 1.2) {
      // Spending faster than expected
      budgetScore = Math.max(10, 40 - ((budgetRatio - expectedRatio) * 60));
    }
    
    // 2. Savings Potential Score (0-30 points)
    // How much room do they have left?
    const remainingBudget = budget - totalSpent;
    const daysLeft = daysInMonth - dayOfMonth;
    const dailyBudgetLeft = daysLeft > 0 ? remainingBudget / daysLeft : 0;
    let savingsScore = 30;
    
    if (remainingBudget < 0) {
      savingsScore = 0;
    } else if (remainingBudget < budget * 0.1) {
      savingsScore = 10;
    } else if (remainingBudget < budget * 0.2) {
      savingsScore = 20;
    }
    
    // 3. Category Balance Score (0-30 points)
    // Is spending distributed or concentrated?
    const categorySpending = {};
    thisMonthTransactions.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    
    const categories = Object.keys(categorySpending);
    let balanceScore = 30;
    
    if (categories.length > 0 && totalSpent > 0) {
      // Check if any single category dominates (>50%)
      const maxCategoryPercent = Math.max(...Object.values(categorySpending)) / totalSpent;
      if (maxCategoryPercent > 0.7) {
        balanceScore = 10;
      } else if (maxCategoryPercent > 0.5) {
        balanceScore = 20;
      }
      
      // Bonus for tracking multiple categories
      if (categories.length >= 4) {
        balanceScore = Math.min(30, balanceScore + 5);
      }
    }
    
    const totalScore = Math.round(budgetScore + savingsScore + balanceScore);
    
    return {
      total: Math.min(100, Math.max(0, totalScore)),
      budgetScore: Math.round(budgetScore),
      savingsScore: Math.round(savingsScore),
      balanceScore: Math.round(balanceScore),
      budgetRatio,
      remainingBudget,
      dailyBudgetLeft,
      daysLeft
    };
  };
  
  const score = calculateScore();
  
  // Determine status
  let status, statusColor, statusBg, advice;
  if (score.total >= 80) {
    status = "Healthy";
    statusColor = "#10b981";
    statusBg = "rgba(16, 185, 129, 0.1)";
    advice = "Excellent financial habits! Keep it up.";
  } else if (score.total >= 60) {
    status = "Moderate";
    statusColor = "#f59e0b";
    statusBg = "rgba(245, 158, 11, 0.1)";
    advice = "Good progress, but watch your spending pace.";
  } else {
    status = "At Risk";
    statusColor = "#ef4444";
    statusBg = "rgba(239, 68, 68, 0.1)";
    advice = "Consider reducing expenses to stay on track.";
  }
  
  // Calculate stroke for circular progress
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score.total / 100) * circumference;
  
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 16 }}>📈 Financial Score</h3>
      
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {/* Circular Score */}
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="rgba(108, 92, 231, 0.1)"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={statusColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: statusColor }}>{score.total}</div>
            <div style={{ fontSize: 11, color: "#888" }}>/ 100</div>
          </div>
        </div>
        
        {/* Status & Details */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 20,
            background: statusBg,
            color: statusColor,
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 8
          }}>
            {status}
          </div>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 12 }}>{advice}</p>
          
          {/* Score Breakdown */}
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#888", marginBottom: 2 }}>Budget</div>
              <div style={{ fontWeight: 600, color: score.budgetScore >= 30 ? "#10b981" : (score.budgetScore >= 20 ? "#f59e0b" : "#ef4444") }}>
                {score.budgetScore}/40
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#888", marginBottom: 2 }}>Savings</div>
              <div style={{ fontWeight: 600, color: score.savingsScore >= 25 ? "#10b981" : (score.savingsScore >= 15 ? "#f59e0b" : "#ef4444") }}>
                {score.savingsScore}/30
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#888", marginBottom: 2 }}>Balance</div>
              <div style={{ fontWeight: 600, color: score.balanceScore >= 25 ? "#10b981" : (score.balanceScore >= 15 ? "#f59e0b" : "#ef4444") }}>
                {score.balanceScore}/30
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div style={{ 
          borderLeft: "1px solid rgba(108, 92, 231, 0.15)", 
          paddingLeft: 24,
          fontSize: 13
        }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: "#888" }}>Daily budget: </span>
            <span style={{ fontWeight: 600 }}>£{score.dailyBudgetLeft.toFixed(2)}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: "#888" }}>Days left: </span>
            <span style={{ fontWeight: 600 }}>{score.daysLeft}</span>
          </div>
          <div>
            <span style={{ color: "#888" }}>Remaining: </span>
            <span style={{ fontWeight: 600, color: score.remainingBudget < 0 ? "#ef4444" : "#10b981" }}>
              £{score.remainingBudget.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Insight of the Week Component
function InsightOfTheWeek({ transactions, settings }) {
  const generateInsights = () => {
    const now = new Date();
    const insights = [];
    
    // Get this week's transactions (last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const thisWeekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    const lastWeekTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    
    const thisWeekTotal = thisWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastWeekTotal = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Category spending this week vs last week
    const thisWeekByCategory = {};
    const lastWeekByCategory = {};
    
    thisWeekTransactions.forEach(t => {
      thisWeekByCategory[t.category] = (thisWeekByCategory[t.category] || 0) + t.amount;
    });
    
    lastWeekTransactions.forEach(t => {
      lastWeekByCategory[t.category] = (lastWeekByCategory[t.category] || 0) + t.amount;
    });
    
    // This month's totals for percentage calculations
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const monthlyTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyByCategory = {};
    thisMonthTransactions.forEach(t => {
      monthlyByCategory[t.category] = (monthlyByCategory[t.category] || 0) + t.amount;
    });
    
    // Generate insights based on data patterns
    
    // 1. Week-over-week spending comparison
    if (lastWeekTotal > 0 && thisWeekTotal > 0) {
      const weekChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      if (weekChange < -20) {
        insights.push({
          emoji: "🎉",
          type: "positive",
          text: `Amazing! Your spending this week is ${Math.abs(weekChange).toFixed(0)}% lower than last week. Keep up the great work!`
        });
      } else if (weekChange > 30) {
        insights.push({
          emoji: "📈",
          type: "warning",
          text: `Your spending this week is ${weekChange.toFixed(0)}% higher than last week. Consider reviewing your recent purchases.`
        });
      }
    }
    
    // 2. Category improvements
    Object.keys(thisWeekByCategory).forEach(category => {
      const thisWeek = thisWeekByCategory[category] || 0;
      const lastWeek = lastWeekByCategory[category] || 0;
      
      if (lastWeek > 0) {
        const change = ((thisWeek - lastWeek) / lastWeek) * 100;
        if (change < -30 && lastWeek > 20) {
          insights.push({
            emoji: "⬇️",
            type: "positive",
            text: `Great improvement! Your ${category.toLowerCase()} spending is ${Math.abs(change).toFixed(0)}% lower than last week.`
          });
        }
      }
    });
    
    // 3. Category percentage of total
    Object.entries(monthlyByCategory).forEach(([category, amount]) => {
      const percentage = (amount / monthlyTotal) * 100;
      if (percentage > 40 && category !== "Bills") {
        insights.push({
          emoji: "📊",
          type: "info",
          text: `${category} now accounts for ${percentage.toFixed(0)}% of your total spending this month.`
        });
      } else if (category === "Subscriptions" && percentage > 15) {
        insights.push({
          emoji: "🔔",
          type: "warning",
          text: `Your subscriptions account for ${percentage.toFixed(0)}% of your spending. Consider reviewing them.`
        });
      }
    });
    
    // 4. Budget pace insight
    const budget = settings.monthlyBudget || 1500;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const expectedSpending = (budget / daysInMonth) * dayOfMonth;
    const spendingPace = monthlyTotal - expectedSpending;
    
    if (spendingPace < -50) {
      insights.push({
        emoji: "💪",
        type: "positive",
        text: `You're £${Math.abs(spendingPace).toFixed(0)} under your expected spending pace. You're on track to save more this month!`
      });
    } else if (spendingPace > 100) {
      insights.push({
        emoji: "⚡",
        type: "warning",
        text: `You're £${spendingPace.toFixed(0)} ahead of your expected spending pace. Consider slowing down.`
      });
    }
    
    // 5. Highest single purchase this week
    if (thisWeekTransactions.length > 0) {
      const highestPurchase = thisWeekTransactions.reduce((max, t) => t.amount > max.amount ? t : max);
      if (highestPurchase.amount > 50) {
        insights.push({
          emoji: "💳",
          type: "info",
          text: `Your largest purchase this week was £${highestPurchase.amount.toFixed(2)} on "${highestPurchase.description}".`
        });
      }
    }
    
    // 6. Transaction frequency insight
    const avgTransactionsPerWeek = transactions.length / 4; // Rough average
    if (thisWeekTransactions.length < avgTransactionsPerWeek * 0.5 && avgTransactionsPerWeek > 3) {
      insights.push({
        emoji: "📉",
        type: "positive",
        text: `Fewer transactions this week! You made ${thisWeekTransactions.length} purchases compared to your usual ${Math.round(avgTransactionsPerWeek)}.`
      });
    }
    
    // 7. Savings potential
    const remainingBudget = budget - monthlyTotal;
    const daysLeft = daysInMonth - dayOfMonth;
    if (remainingBudget > budget * 0.3 && daysLeft < 10) {
      insights.push({
        emoji: "🎯",
        type: "positive",
        text: `With £${remainingBudget.toFixed(0)} left and only ${daysLeft} days remaining, you could save extra this month!`
      });
    }
    
    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        emoji: "💡",
        type: "info",
        text: `You've made ${thisMonthTransactions.length} transactions this month totaling £${monthlyTotal.toFixed(2)}. Keep tracking!`
      });
    }
    
    return insights;
  };
  
  const insights = generateInsights();
  // Pick top 2 most relevant insights
  const displayInsights = insights.slice(0, 2);
  
  const getInsightStyle = (type) => {
    switch(type) {
      case "positive":
        return { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", color: "#10b981" };
      case "warning":
        return { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" };
      default:
        return { bg: "rgba(108, 92, 231, 0.08)", border: "rgba(108, 92, 231, 0.2)", color: "#6c5ce7" };
    }
  };
  
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 16 }}>💡 Insight of the Week</h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {displayInsights.map((insight, idx) => {
          const style = getInsightStyle(insight.type);
          return (
            <div
              key={idx}
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                background: style.bg,
                border: `1px solid ${style.border}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 12
              }}
            >
              <span style={{ fontSize: 20 }}>{insight.emoji}</span>
              <p style={{ 
                margin: 0, 
                fontSize: 14, 
                lineHeight: 1.5,
                color: "inherit"
              }}>
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SmartTips Recommendation Component - Connects learning to data
function SmartTipsRecommendation({ transactions, settings }) {
  // Tip definitions with conditions
  const tipLibrary = [
    {
      id: 1,
      emoji: "📘",
      title: "How to Create a Simple Student Budget",
      summary: "Learn the 3-step approach to budgeting that actually works.",
      conditions: ["newUser", "noBudget"],
      link: "/smarttips"
    },
    {
      id: 2,
      emoji: "💳",
      title: "Why Small Purchases Add Up",
      summary: "See how £4 coffees become £80/month.",
      conditions: ["manySmallPurchases", "highFood"],
      link: "/smarttips"
    },
    {
      id: 3,
      emoji: "🔔",
      title: "How to Avoid Overspending",
      summary: "Simple strategies to stay within your limits.",
      conditions: ["overBudget", "lowPrediction", "highSpending"],
      link: "/smarttips"
    },
    {
      id: 4,
      emoji: "📊",
      title: "What Is a Spending Category?",
      summary: "Turn 30 random transactions into clear insights.",
      conditions: ["fewCategories", "uncategorized"],
      link: "/smarttips"
    },
    {
      id: 5,
      emoji: "🔮",
      title: "Why Predicting Your Balance Matters",
      summary: "Stay ahead of overdrafts and make smarter decisions.",
      conditions: ["lowPrediction", "highSpending"],
      link: "/smarttips"
    },
    {
      id: 6,
      emoji: "💡",
      title: "The 50/30/20 Rule Explained",
      summary: "A simple framework to balance needs, wants, and savings.",
      conditions: ["unbalancedSpending", "highWants"],
      link: "/smarttips"
    },
    {
      id: 7,
      emoji: "🎯",
      title: "Setting Financial Goals",
      summary: "Give your money purpose with short and long-term goals.",
      conditions: ["goodProgress", "savingsPotential"],
      link: "/smarttips"
    },
    {
      id: 8,
      emoji: "🛡️",
      title: "Building an Emergency Fund",
      summary: "Protect yourself from unexpected expenses.",
      conditions: ["goodProgress", "savingsPotential", "lowPrediction"],
      link: "/smarttips"
    }
  ];
  
  // Analyze user data to determine conditions
  const analyzeConditions = () => {
    const conditions = new Set();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // This month's transactions
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalSpent = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const budget = settings.monthlyBudget || 1500;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    
    // Category breakdown
    const categorySpending = {};
    thisMonthTransactions.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    
    // Predicted balance
    const dailyAverage = totalSpent / dayOfMonth;
    const predictedTotal = dailyAverage * daysInMonth;
    const predictedBalance = settings.startingBalance - predictedTotal;
    
    // Budget usage
    const budgetUsage = totalSpent / budget;
    const expectedUsage = dayOfMonth / daysInMonth;
    
    // Check conditions
    
    // New user or few transactions
    if (transactions.length < 5) {
      conditions.add("newUser");
    }
    
    // Low predicted balance
    if (predictedBalance < 100 || predictedBalance < budget * 0.1) {
      conditions.add("lowPrediction");
    }
    
    // Over budget or spending too fast
    if (budgetUsage > 1 || budgetUsage > expectedUsage * 1.3) {
      conditions.add("overBudget");
      conditions.add("highSpending");
    }
    
    // High food spending (>30% of total)
    if (categorySpending["Food"] && categorySpending["Food"] / totalSpent > 0.3) {
      conditions.add("highFood");
    }
    
    // Many small purchases (>10 transactions under £10)
    const smallPurchases = thisMonthTransactions.filter(t => t.amount < 10).length;
    if (smallPurchases > 10) {
      conditions.add("manySmallPurchases");
    }
    
    // High entertainment/wants spending
    const wantsCategories = ["Entertainment", "Shopping", "Subscriptions"];
    const wantsSpending = wantsCategories.reduce((sum, cat) => sum + (categorySpending[cat] || 0), 0);
    if (wantsSpending / totalSpent > 0.4) {
      conditions.add("highWants");
      conditions.add("unbalancedSpending");
    }
    
    // Few categories used
    if (Object.keys(categorySpending).length < 3 && transactions.length > 5) {
      conditions.add("fewCategories");
    }
    
    // Good progress - under budget with savings potential
    if (budgetUsage < expectedUsage * 0.8 && predictedBalance > budget * 0.2) {
      conditions.add("goodProgress");
      conditions.add("savingsPotential");
    }
    
    // High subscriptions (>15% of budget)
    if (categorySpending["Subscriptions"] && categorySpending["Subscriptions"] / budget > 0.15) {
      conditions.add("highSubscriptions");
    }
    
    return {
      conditions,
      stats: {
        totalSpent,
        predictedBalance,
        budgetUsage: budgetUsage * 100,
        topCategory: Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
      }
    };
  };
  
  const { conditions, stats } = analyzeConditions();
  
  // Find matching tips
  const matchingTips = tipLibrary
    .map(tip => {
      const matchCount = tip.conditions.filter(c => conditions.has(c)).length;
      return { ...tip, matchCount, relevance: matchCount / tip.conditions.length };
    })
    .filter(tip => tip.matchCount > 0)
    .sort((a, b) => b.relevance - a.relevance || b.matchCount - a.matchCount);
  
  // Get top recommendation
  const topTip = matchingTips[0];
  
  if (!topTip) return null;
  
  // Generate contextual message based on conditions
  let contextMessage = "";
  if (conditions.has("lowPrediction")) {
    contextMessage = `Your predicted balance is £${stats.predictedBalance.toFixed(0)}. Want help reducing expenses?`;
  } else if (conditions.has("highFood")) {
    contextMessage = `Food is your top spending category. Learn how to save more.`;
  } else if (conditions.has("overBudget")) {
    contextMessage = `You've used ${stats.budgetUsage.toFixed(0)}% of your budget. Here's how to get back on track.`;
  } else if (conditions.has("manySmallPurchases")) {
    contextMessage = "Those small purchases add up! See how much.";
  } else if (conditions.has("goodProgress")) {
    contextMessage = "You're doing great! Ready to level up your finances?";
  } else {
    contextMessage = "Based on your spending patterns, this might help:";
  }
  
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>📚</span>
        <h3 style={{ margin: 0 }}>Recommended for You</h3>
      </div>
      
      <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>
        {contextMessage}
      </p>
      
      <a
        href={topTip.link}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: 16,
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(162, 155, 254, 0.08) 100%)",
          border: "1px solid rgba(108, 92, 231, 0.2)",
          textDecoration: "none",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 92, 231, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0
        }}>
          {topTip.emoji}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: 15, 
            color: "#6c5ce7",
            marginBottom: 4
          }}>
            {topTip.title}
          </div>
          <div style={{ 
            fontSize: 13, 
            color: "#888"
          }}>
            {topTip.summary}
          </div>
        </div>
        
        <div style={{
          color: "#6c5ce7",
          fontSize: 20,
          fontWeight: 500
        }}>
          →
        </div>
      </a>
      
      {matchingTips.length > 1 && (
        <div style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: "1px solid rgba(108, 92, 231, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span style={{ fontSize: 13, color: "#888" }}>
            {matchingTips.length - 1} more tip{matchingTips.length > 2 ? "s" : ""} recommended for you
          </span>
          <a 
            href="/smarttips" 
            style={{ 
              fontSize: 13, 
              color: "#6c5ce7", 
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            View all tips →
          </a>
        </div>
      )}
    </div>
  );
}

// Financial Pattern Detection Component
function FinancialPatternDetection({ transactions }) {
  const detectPatterns = () => {
    if (transactions.length < 5) {
      return []; // Need enough data to detect patterns
    }
    
    const patterns = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Analyze spending by day of week
    const spendingByDay = [0, 0, 0, 0, 0, 0, 0];
    const countByDay = [0, 0, 0, 0, 0, 0, 0];
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const day = date.getDay();
      spendingByDay[day] += t.amount;
      countByDay[day]++;
    });
    
    // Find highest spending day
    const avgByDay = spendingByDay.map((total, i) => countByDay[i] > 0 ? total / countByDay[i] : 0);
    const maxDayIndex = avgByDay.indexOf(Math.max(...avgByDay));
    const overallAvg = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
    
    if (avgByDay[maxDayIndex] > overallAvg * 1.3 && countByDay[maxDayIndex] >= 2) {
      patterns.push({
        icon: "📅",
        pattern: `You tend to spend more on ${dayNames[maxDayIndex]}s`,
        detail: `Average £${avgByDay[maxDayIndex].toFixed(0)} per transaction vs £${overallAvg.toFixed(0)} overall`,
        tip: `Try planning your ${dayNames[maxDayIndex]} activities in advance to avoid impulse spending.`,
        confidence: "high"
      });
    }
    
    // Weekend vs weekday pattern
    const weekendSpend = (spendingByDay[0] + spendingByDay[6]);
    const weekendCount = countByDay[0] + countByDay[6];
    const weekdaySpend = spendingByDay.slice(1, 6).reduce((a, b) => a + b, 0);
    const weekdayCount = countByDay.slice(1, 6).reduce((a, b) => a + b, 0);
    
    if (weekendCount > 0 && weekdayCount > 0) {
      const weekendAvg = weekendSpend / weekendCount;
      const weekdayAvg = weekdaySpend / weekdayCount;
      
      if (weekendAvg > weekdayAvg * 1.5) {
        patterns.push({
          icon: "🎉",
          pattern: "Your weekend spending is significantly higher",
          detail: `Weekend avg: £${weekendAvg.toFixed(0)} vs Weekday avg: £${weekdayAvg.toFixed(0)}`,
          tip: "Set a weekend budget to keep leisure spending in check.",
          confidence: "high"
        });
      }
    }
    
    // Time of month analysis
    const earlyMonth = []; // Days 1-10
    const midMonth = [];   // Days 11-20
    const lateMonth = [];  // Days 21-31
    
    transactions.forEach(t => {
      const day = new Date(t.date).getDate();
      if (day <= 10) earlyMonth.push(t);
      else if (day <= 20) midMonth.push(t);
      else lateMonth.push(t);
    });
    
    const earlyTotal = earlyMonth.reduce((sum, t) => sum + t.amount, 0);
    const midTotal = midMonth.reduce((sum, t) => sum + t.amount, 0);
    const lateTotal = lateMonth.reduce((sum, t) => sum + t.amount, 0);
    const totalSpend = earlyTotal + midTotal + lateTotal;
    
    if (earlyTotal > totalSpend * 0.45 && earlyMonth.length > 3) {
      patterns.push({
        icon: "📆",
        pattern: "You spend more at the start of the month",
        detail: `${((earlyTotal / totalSpend) * 100).toFixed(0)}% of spending happens in the first 10 days`,
        tip: "Try spreading purchases throughout the month to avoid running low later.",
        confidence: "medium"
      });
    } else if (lateTotal > totalSpend * 0.45 && lateMonth.length > 3) {
      patterns.push({
        icon: "📆",
        pattern: "Most of your spending happens late in the month",
        detail: `${((lateTotal / totalSpend) * 100).toFixed(0)}% of spending is after the 20th`,
        tip: "Consider if you're catching up on delayed purchases or if it's a pattern to address.",
        confidence: "medium"
      });
    }
    
    // Subscription pattern detection
    const subscriptionTransactions = transactions.filter(t => 
      t.category === "Subscriptions" || 
      t.description?.toLowerCase().includes("subscription") ||
      t.description?.toLowerCase().includes("netflix") ||
      t.description?.toLowerCase().includes("spotify") ||
      t.description?.toLowerCase().includes("amazon prime") ||
      t.description?.toLowerCase().includes("disney")
    );
    
    if (subscriptionTransactions.length >= 2) {
      const subDays = subscriptionTransactions.map(t => new Date(t.date).getDate());
      const earlySubCount = subDays.filter(d => d <= 7).length;
      
      if (earlySubCount >= subscriptionTransactions.length * 0.6) {
        patterns.push({
          icon: "💳",
          pattern: "Most subscriptions are charged at the start of the month",
          detail: `${earlySubCount} of ${subscriptionTransactions.length} subscriptions charge in the first week`,
          tip: "Ensure you have enough balance at month-start for automatic payments.",
          confidence: "high"
        });
      }
    }
    
    // Small purchase frequency
    const smallPurchases = transactions.filter(t => t.amount < 10);
    const smallPurchaseRatio = smallPurchases.length / transactions.length;
    
    if (smallPurchaseRatio > 0.5 && smallPurchases.length >= 5) {
      const smallTotal = smallPurchases.reduce((sum, t) => sum + t.amount, 0);
      patterns.push({
        icon: "☕",
        pattern: "You make many small purchases under £10",
        detail: `${smallPurchases.length} small purchases totaling £${smallTotal.toFixed(0)}`,
        tip: "Small purchases add up fast. Try a daily spending limit or use cash.",
        confidence: "medium"
      });
    }
    
    // Category-specific timing
    const foodTransactions = transactions.filter(t => t.category === "Food");
    if (foodTransactions.length >= 5) {
      const foodByDay = [0, 0, 0, 0, 0, 0, 0];
      foodTransactions.forEach(t => {
        foodByDay[new Date(t.date).getDay()]++;
      });
      const maxFoodDay = foodByDay.indexOf(Math.max(...foodByDay));
      if (foodByDay[maxFoodDay] >= foodTransactions.length * 0.3) {
        patterns.push({
          icon: "🍔",
          pattern: `You order more food on ${dayNames[maxFoodDay]}s`,
          detail: `${foodByDay[maxFoodDay]} of ${foodTransactions.length} food purchases are on ${dayNames[maxFoodDay]}`,
          tip: `Plan meals ahead for ${dayNames[maxFoodDay]} to reduce takeout temptation.`,
          confidence: "medium"
        });
      }
    }
    
    // Entertainment spending pattern
    const entertainmentTrans = transactions.filter(t => t.category === "Entertainment");
    if (entertainmentTrans.length >= 3) {
      const entByDay = [0, 0, 0, 0, 0, 0, 0];
      entertainmentTrans.forEach(t => {
        entByDay[new Date(t.date).getDay()]++;
      });
      const weekendEnt = entByDay[0] + entByDay[5] + entByDay[6];
      if (weekendEnt >= entertainmentTrans.length * 0.7) {
        patterns.push({
          icon: "🎬",
          pattern: "Most entertainment spending is on weekends",
          detail: `${weekendEnt} of ${entertainmentTrans.length} entertainment purchases are Fri-Sun`,
          tip: "Look for free weekend activities or student discount days.",
          confidence: "high"
        });
      }
    }
    
    // Spending streak detection
    const sortedDates = [...new Set(transactions.map(t => t.date))].sort();
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    if (maxStreak >= 5) {
      patterns.push({
        icon: "🔥",
        pattern: `You had a ${maxStreak}-day spending streak`,
        detail: "You made purchases on consecutive days",
        tip: "Try implementing no-spend days to break the habit.",
        confidence: "medium"
      });
    }
    
    // Large purchase pattern
    const largePurchases = transactions.filter(t => t.amount > 50);
    if (largePurchases.length >= 2) {
      const largeDays = largePurchases.map(t => new Date(t.date).getDay());
      const weekendLarge = largeDays.filter(d => d === 0 || d === 6).length;
      if (weekendLarge >= largePurchases.length * 0.6) {
        patterns.push({
          icon: "💰",
          pattern: "Large purchases tend to happen on weekends",
          detail: `${weekendLarge} of ${largePurchases.length} big purchases (£50+) are on weekends`,
          tip: "Apply the 24-hour rule: wait a day before weekend splurges.",
          confidence: "medium"
        });
      }
    }
    
    return patterns.slice(0, 4); // Show top 4 patterns
  };
  
  const patterns = detectPatterns();
  
  if (patterns.length === 0) {
    return null;
  }
  
  const confidenceColors = {
    high: "#2ecc71",
    medium: "#f1c40f",
    low: "#95a5a6"
  };
  
  return (
    <div className="card" style={{ 
      marginBottom: 24,
      background: "linear-gradient(135deg, rgba(155, 89, 182, 0.05) 0%, rgba(142, 68, 173, 0.05) 100%)",
      border: "1px solid rgba(155, 89, 182, 0.2)"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginBottom: 16 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <h3 style={{ margin: 0 }}>Financial Pattern Detection</h3>
        </div>
        <span style={{
          background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
          color: "white",
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600
        }}>
          AI INSIGHTS
        </span>
      </div>
      
      <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
        Patterns detected from your spending behavior
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {patterns.map((p, i) => (
          <div 
            key={i}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 16,
              border: "1px solid rgba(155, 89, 182, 0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0
              }}>
                {p.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  marginBottom: 4 
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {p.pattern}
                  </span>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: confidenceColors[p.confidence],
                    flexShrink: 0
                  }} title={`${p.confidence} confidence`} />
                </div>
                
                <div style={{ 
                  fontSize: 13, 
                  color: "#888", 
                  marginBottom: 8 
                }}>
                  {p.detail}
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "rgba(155, 89, 182, 0.08)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#8e44ad"
                }}>
                  <span>💡</span>
                  <span>{p.tip}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid rgba(155, 89, 182, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71" }} />
            High confidence
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f1c40f" }} />
            Medium confidence
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#888" }}>
          Based on {transactions.length} transactions
        </span>
      </div>
    </div>
  );
}

// Monthly Reflection Summary Component
function MonthlyReflection({ transactions }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();
  
  // Get month names
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentMonth];
  const lastMonthName = monthNames[currentMonth === 0 ? 11 : currentMonth - 1];
  
  // This month's transactions
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  // Last month's transactions
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });
  
  // Calculate category spending for this month
  const thisMonthByCategory = {};
  thisMonthTransactions.forEach(t => {
    thisMonthByCategory[t.category] = (thisMonthByCategory[t.category] || 0) + t.amount;
  });
  
  // Calculate category spending for last month
  const lastMonthByCategory = {};
  lastMonthTransactions.forEach(t => {
    lastMonthByCategory[t.category] = (lastMonthByCategory[t.category] || 0) + t.amount;
  });
  
  // Find highest spending category this month
  const sortedCategories = Object.entries(thisMonthByCategory)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length === 0) {
    return null; // No data to show
  }
  
  const [topCategory, topAmount] = sortedCategories[0];
  const lastMonthTopAmount = lastMonthByCategory[topCategory] || 0;
  
  // Calculate percentage change
  let percentChange = 0;
  let changeDirection = "same";
  if (lastMonthTopAmount > 0) {
    percentChange = ((topAmount - lastMonthTopAmount) / lastMonthTopAmount) * 100;
    changeDirection = percentChange > 0 ? "higher" : percentChange < 0 ? "lower" : "same";
  }
  
  // Calculate total spending comparison
  const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const lastMonthTotal = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPercentChange = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;
  
  // Generate smart recommendation based on data
  const generateRecommendation = () => {
    const weeklyEquivalent = topAmount / (dayOfMonth / 7);
    const suggestedWeeklyCap = Math.ceil(weeklyEquivalent * 0.8 / 5) * 5; // Round to nearest £5, reduce by 20%
    
    const recommendations = {
      Food: {
        high: `Try meal prepping on Sundays to cut your food spending. A weekly budget of £${suggestedWeeklyCap} could save you £${Math.round(topAmount * 0.2)}/month.`,
        low: `Great job keeping food costs down! Consider batch cooking to maintain this trend.`
      },
      Transport: {
        high: `Look into monthly travel passes or carpooling options. Setting a £${suggestedWeeklyCap}/week limit could help.`,
        low: `You're being smart with transport costs. Keep exploring free alternatives like walking or cycling.`
      },
      Entertainment: {
        high: `Try free entertainment options like parks or streaming. A £${suggestedWeeklyCap}/week budget could work better.`,
        low: `Nice control on entertainment spending! Look for student discounts to stretch it further.`
      },
      Shopping: {
        high: `Apply the 24-hour rule before purchases. Consider setting a monthly cap of £${Math.ceil(topAmount * 0.7 / 10) * 10}.`,
        low: `Smart shopping habits! Keep using wish lists to avoid impulse buys.`
      },
      Subscriptions: {
        high: `Review your subscriptions - cancel unused ones. You could save £${Math.round(topAmount * 0.3)} by trimming 2-3 services.`,
        low: `Good subscription management! Consider annual plans for services you'll keep.`
      },
      default: {
        high: `Consider setting a weekly cap of £${suggestedWeeklyCap} for ${topCategory.toLowerCase()} spending.`,
        low: `You're managing ${topCategory.toLowerCase()} expenses well. Keep tracking to maintain control.`
      }
    };
    
    const categoryRec = recommendations[topCategory] || recommendations.default;
    return changeDirection === "lower" ? categoryRec.low : categoryRec.high;
  };
  
  // Category emoji mapping
  const categoryEmojis = {
    Food: "🍔",
    Transport: "🚗",
    Entertainment: "🎬",
    Shopping: "🛒",
    Bills: "📄",
    Subscriptions: "📱",
    Health: "💊",
    Education: "📚",
    Other: "📦"
  };
  
  const emoji = categoryEmojis[topCategory] || "💰";
  
  // Determine if we should show end-of-month view (after 20th of month)
  const isEndOfMonth = dayOfMonth >= 20;
  
  return (
    <div className="card" style={{ 
      marginBottom: 24,
      background: "linear-gradient(135deg, rgba(46, 204, 113, 0.05) 0%, rgba(52, 152, 219, 0.05) 100%)",
      border: "1px solid rgba(46, 204, 113, 0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <h3 style={{ margin: 0 }}>
          {isEndOfMonth ? `${currentMonthName} Reflection` : `${currentMonthName} So Far`}
        </h3>
        {isEndOfMonth && (
          <span style={{
            marginLeft: "auto",
            background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
            color: "white",
            padding: "4px 10px",
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600
          }}>
            MONTHLY SUMMARY
          </span>
        )}
      </div>
      
      {/* Main Insight */}
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0
          }}>
            {emoji}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 8px 0", fontSize: 15, lineHeight: 1.6 }}>
              Your highest category this month was{" "}
              <strong style={{ color: "#2ecc71" }}>{topCategory}</strong>{" "}
              at <strong>£{topAmount.toFixed(2)}</strong>.
            </p>
            
            {lastMonthTopAmount > 0 ? (
              <p style={{ 
                margin: "0 0 12px 0", 
                fontSize: 14, 
                color: changeDirection === "higher" ? "#e74c3c" : changeDirection === "lower" ? "#2ecc71" : "#888"
              }}>
                {changeDirection === "same" ? (
                  <>That's about the same as {lastMonthName}.</>
                ) : (
                  <>
                    That's{" "}
                    <strong>{Math.abs(percentChange).toFixed(0)}% {changeDirection}</strong>{" "}
                    than {lastMonthName}.
                    {changeDirection === "higher" && " 📈"}
                    {changeDirection === "lower" && " 📉"}
                  </>
                )}
              </p>
            ) : (
              <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#888" }}>
                No data from {lastMonthName} to compare.
              </p>
            )}
            
            {/* Recommendation */}
            <div style={{
              background: "linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(108, 92, 231, 0.03) 100%)",
              border: "1px solid rgba(108, 92, 231, 0.15)",
              borderRadius: 8,
              padding: 12,
              marginTop: 12
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 6, 
                marginBottom: 6,
                color: "#6c5ce7",
                fontWeight: 600,
                fontSize: 13
              }}>
                💡 Recommendation
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#555" }}>
                {generateRecommendation()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12
      }}>
        <div style={{
          background: "white",
          borderRadius: 8,
          padding: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
            Total This Month
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2c3e50" }}>
            £{thisMonthTotal.toFixed(0)}
          </div>
        </div>
        
        <div style={{
          background: "white",
          borderRadius: 8,
          padding: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
            vs {lastMonthName}
          </div>
          <div style={{ 
            fontSize: 18, 
            fontWeight: 700, 
            color: totalPercentChange > 10 ? "#e74c3c" : totalPercentChange < -10 ? "#2ecc71" : "#888"
          }}>
            {totalPercentChange > 0 ? "+" : ""}{totalPercentChange.toFixed(0)}%
          </div>
        </div>
        
        <div style={{
          background: "white",
          borderRadius: 8,
          padding: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
            Categories Used
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2c3e50" }}>
            {sortedCategories.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { transactions, categories, loading, getTotalSpent, getTotalIncome, getSpendingByCategory, deleteTransaction, addTransaction, settings } = useData();
  const { user } = useAuth();
  
  // Get user's first name
  const userName = user?.name?.split(" ")[0] || "there";
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    category: "",
    categoryId: "",
    type: "expense"
  });

  // Get expense categories from API data
  const categoryOptions = categories
    .filter(c => c.type === "expense" || c.type === "both")
    .map(c => ({ id: c._id, name: c.name, icon: c.icon }));
  
  const totalSpent = getTotalSpent();
  const _totalIncome = getTotalIncome ? getTotalIncome() : 0;
  const spendingByCategory = getSpendingByCategory();
  
  const categoryNames = Object.keys(spendingByCategory);
  const amounts = Object.values(spendingByCategory);
  
  const chartData = {
    labels: categoryNames,
    datasets: [{
      data: amounts,
      backgroundColor: ["#e74c3c", "#3498db", "#9b59b6", "#2ecc71", "#f39c12", "#1abc9c", "#95a5a6", "#6c5ce7", "#fd79a8", "#00cec9"],
      borderWidth: 0
    }]
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <p style={{ color: "#666" }}>Loading your data...</p>
        </div>
      </div>
    );
  }

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

  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      // Find the category object to get its ID
      const categoryObj = categories.find(c => c.name === newExpense.category);
      
      await addTransaction({
        date: newExpense.date,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        categoryId: categoryObj?._id,
        type: 'expense'
      });
      setNewExpense({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        category: categoryOptions[0] || "Food"
      });
      setShowAddModal(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Hi {userName}! 👋</h1>
      <p style={{ color: "#888", marginBottom: 32 }}>Here is your spending overview for February 2026</p>

      {/* Financial Score */}
      <FinancialHealthScore transactions={transactions} settings={settings} />

      {/* Financial Pattern Detection - AI Insights */}
      <FinancialPatternDetection transactions={transactions} />

      {/* Monthly Reflection Summary */}
      <MonthlyReflection transactions={transactions} />

      {/* Insight of the Week */}
      <InsightOfTheWeek transactions={transactions} settings={settings} />

      {/* Smart Tips Recommendation - Connects learning to spending data */}
      <SmartTipsRecommendation transactions={transactions} settings={settings} />

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

      {/* Alerts with Explanations */}
      <AlertsPanel alerts={alerts} />

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
