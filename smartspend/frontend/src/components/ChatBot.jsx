import { useState, useRef, useEffect } from "react";
import { useData } from "../context/DataContext";

export default function ChatBot() {
  const { darkMode, transactions, settings } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Calculate user's financial data
  const getFinancialData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // This month's transactions
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Total spent this month
    const totalSpent = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Spending by category
    const categorySpending = {};
    thisMonthTransactions.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    
    // Find highest spending category
    let highestCategory = { name: "None", amount: 0 };
    Object.entries(categorySpending).forEach(([cat, amount]) => {
      if (amount > highestCategory.amount) {
        highestCategory = { name: cat, amount };
      }
    });
    
    // Calculate predicted end of month balance
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const dailyAverage = totalSpent / dayOfMonth;
    const predictedTotal = dailyAverage * daysInMonth;
    const predictedBalance = settings.startingBalance - predictedTotal;
    
    // Budget remaining
    const budgetRemaining = settings.monthlyBudget - totalSpent;
    const budgetPercentUsed = (totalSpent / settings.monthlyBudget) * 100;
    
    // Days left in month
    const daysLeft = daysInMonth - dayOfMonth;
    
    // Daily budget remaining
    const dailyBudgetLeft = daysLeft > 0 ? budgetRemaining / daysLeft : 0;
    
    // Weekly spending (last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastWeekTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    const weeklySpending = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate category weekly averages
    const categoryWeeklyAverages = {};
    const weeksInData = Math.max(1, Math.ceil(dayOfMonth / 7));
    Object.entries(categorySpending).forEach(([cat, amount]) => {
      categoryWeeklyAverages[cat] = amount / weeksInData;
    });
    
    // Alerts
    const alerts = [];
    
    // Over budget alert
    if (budgetPercentUsed > 80) {
      alerts.push({
        type: "budget",
        message: `You've used ${budgetPercentUsed.toFixed(0)}% of your monthly budget.`
      });
    }
    
    // High category spending
    if (highestCategory.amount > settings.monthlyBudget * 0.3) {
      alerts.push({
        type: "category",
        message: `${highestCategory.name} spending is high at £${highestCategory.amount.toFixed(2)} (${((highestCategory.amount / totalSpent) * 100).toFixed(0)}% of total).`
      });
    }
    
    // Predicted negative balance
    if (predictedBalance < 0) {
      alerts.push({
        type: "prediction",
        message: `At this rate, you may overspend by £${Math.abs(predictedBalance).toFixed(2)} this month.`
      });
    }
    
    // Low balance warning
    if (predictedBalance < settings.alertThreshold && predictedBalance > 0) {
      alerts.push({
        type: "lowbalance",
        message: `Predicted balance (£${predictedBalance.toFixed(2)}) is below your alert threshold.`
      });
    }
    
    return {
      totalSpent,
      categorySpending,
      highestCategory,
      predictedBalance,
      budgetRemaining,
      budgetPercentUsed,
      daysLeft,
      dailyBudgetLeft,
      weeklySpending,
      categoryWeeklyAverages,
      alerts,
      monthlyBudget: settings.monthlyBudget,
      transactionCount: thisMonthTransactions.length
    };
  };

  // Context-aware AI response
  const getAIResponse = (question) => {
    const q = question.toLowerCase();
    const data = getFinancialData();
    
    // Warning/Alert questions
    if (q.includes("warning") || q.includes("alert") || q.includes("notification")) {
      if (data.alerts.length === 0) {
        return "✅ **Good news!** You don't have any active warnings right now.\n\nYour spending is on track. Keep it up!";
      }
      
      let response = "⚠️ **Your Active Alerts:**\n\n";
      data.alerts.forEach((alert, i) => {
        response += `${i + 1}. ${alert.message}\n`;
      });
      response += "\n**What you can do:**\n";
      if (data.alerts.some(a => a.type === "category")) {
        response += `• Review your ${data.highestCategory.name} spending\n`;
      }
      if (data.alerts.some(a => a.type === "budget")) {
        response += `• You have ${data.daysLeft} days left - spend max £${data.dailyBudgetLeft.toFixed(2)}/day\n`;
      }
      if (data.alerts.some(a => a.type === "prediction")) {
        response += "• Cut back on non-essential purchases\n";
      }
      return response;
    }
    
    // Spending summary questions
    if (q.includes("spending") || q.includes("spent") || q.includes("how much")) {
      let response = `📊 **Your Spending This Month:**\n\n`;
      response += `**Total spent:** £${data.totalSpent.toFixed(2)}\n`;
      response += `**Budget used:** ${data.budgetPercentUsed.toFixed(0)}% of £${data.monthlyBudget}\n`;
      response += `**Budget remaining:** £${data.budgetRemaining.toFixed(2)}\n\n`;
      
      response += `**By Category:**\n`;
      Object.entries(data.categorySpending)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, amount]) => {
          const percent = ((amount / data.totalSpent) * 100).toFixed(0);
          response += `• ${cat}: £${amount.toFixed(2)} (${percent}%)\n`;
        });
      
      response += `\n💡 Your highest spend is **${data.highestCategory.name}** at £${data.highestCategory.amount.toFixed(2)}`;
      return response;
    }
    
    // Category specific questions
    const categoryKeywords = {
      "food": ["food", "groceries", "eating", "restaurant", "takeaway", "coffee"],
      "transport": ["transport", "travel", "bus", "train", "uber", "taxi"],
      "entertainment": ["entertainment", "fun", "games", "movies", "netflix"],
      "bills": ["bills", "rent", "utilities", "electric", "gas", "water"],
      "shopping": ["shopping", "clothes", "amazon", "online"],
      "subscriptions": ["subscription", "spotify", "membership"]
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => q.includes(kw))) {
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        const spent = data.categorySpending[catName] || 0;
        
        if (spent === 0) {
          return `📁 **${catName} Spending:**\n\nYou haven't recorded any ${catName.toLowerCase()} expenses this month yet.\n\nWant to add one? Go to the Dashboard!`;
        }
        
        const percent = ((spent / data.totalSpent) * 100).toFixed(0);
        const weeklyAvg = data.categoryWeeklyAverages[catName] || 0;
        
        let response = `📁 **${catName} Spending:**\n\n`;
        response += `• This month: £${spent.toFixed(2)}\n`;
        response += `• % of total: ${percent}%\n`;
        response += `• Weekly average: £${weeklyAvg.toFixed(2)}\n\n`;
        
        if (spent > data.monthlyBudget * 0.25) {
          response += `⚠️ This is taking up a big chunk of your budget. Consider ways to reduce ${catName.toLowerCase()} costs.`;
        } else {
          response += `✅ This looks reasonable relative to your overall spending.`;
        }
        
        return response;
      }
    }
    
    // Prediction/forecast questions
    if (q.includes("predict") || q.includes("forecast") || q.includes("end of month") || q.includes("balance")) {
      let response = `🔮 **End-of-Month Prediction:**\n\n`;
      response += `**Predicted balance:** £${data.predictedBalance.toFixed(2)}\n`;
      response += `**Days remaining:** ${data.daysLeft}\n`;
      response += `**Safe daily spend:** £${data.dailyBudgetLeft.toFixed(2)}\n\n`;
      
      if (data.predictedBalance < 0) {
        response += `⚠️ **Warning:** At your current pace, you may overspend by £${Math.abs(data.predictedBalance).toFixed(2)}.\n\n`;
        response += `**To stay on budget:**\n`;
        response += `• Reduce daily spending to £${data.dailyBudgetLeft.toFixed(2)}\n`;
        response += `• Cut back on ${data.highestCategory.name} spending\n`;
        response += `• Avoid non-essential purchases`;
      } else if (data.predictedBalance < 100) {
        response += `⚡ You're cutting it close! Try to be mindful of spending.`;
      } else {
        response += `✅ You're on track! Keep up the good habits.`;
      }
      
      return response;
    }
    
    // Budget questions
    if (q.includes("budget")) {
      let response = `💰 **Your Budget Status:**\n\n`;
      response += `**Monthly budget:** £${data.monthlyBudget.toFixed(2)}\n`;
      response += `**Spent so far:** £${data.totalSpent.toFixed(2)}\n`;
      response += `**Remaining:** £${data.budgetRemaining.toFixed(2)}\n`;
      response += `**Days left:** ${data.daysLeft}\n\n`;
      
      if (data.budgetPercentUsed > 100) {
        response += `🚨 You've exceeded your budget by £${Math.abs(data.budgetRemaining).toFixed(2)}!`;
      } else if (data.budgetPercentUsed > 80) {
        response += `⚠️ You've used ${data.budgetPercentUsed.toFixed(0)}% - be careful with remaining spending.`;
      } else {
        response += `✅ You're at ${data.budgetPercentUsed.toFixed(0)}% - looking good!`;
      }
      
      return response;
    }
    
    // Tips based on user's actual data
    if (q.includes("tip") || q.includes("advice") || q.includes("help") || q.includes("suggest")) {
      let response = `💡 **Personalized Tips Based on Your Data:**\n\n`;
      
      if (data.highestCategory.name === "Food") {
        response += `🍕 **Food is your top expense**\n`;
        response += `• Try meal prepping on Sundays\n`;
        response += `• Limit takeaway to once a week\n`;
        response += `• Use a shopping list to avoid impulse buys\n\n`;
      } else if (data.highestCategory.name === "Entertainment") {
        response += `🎬 **Entertainment is your top expense**\n`;
        response += `• Check for free alternatives\n`;
        response += `• Use student discounts\n`;
        response += `• Set a weekly entertainment budget\n\n`;
      } else if (data.highestCategory.name === "Transport") {
        response += `🚌 **Transport is your top expense**\n`;
        response += `• Consider a weekly/monthly pass\n`;
        response += `• Walk or cycle when possible\n`;
        response += `• Get a student railcard if you haven't\n\n`;
      } else if (data.highestCategory.name === "Bills") {
        response += `🏠 **Bills are your top expense**\n`;
        response += `• Compare utility providers\n`;
        response += `• Use energy-saving habits\n`;
        response += `• Check for council tax discounts\n\n`;
      }
      
      response += `📊 **Your Numbers:**\n`;
      response += `• £${data.dailyBudgetLeft.toFixed(2)} left per day for ${data.daysLeft} days\n`;
      response += `• Highest category: ${data.highestCategory.name} (£${data.highestCategory.amount.toFixed(2)})`;
      
      return response;
    }
    
    // Summary/overview
    if (q.includes("summary") || q.includes("overview") || q.includes("status") || q.includes("how am i doing")) {
      let response = `📈 **Your Financial Summary:**\n\n`;
      response += `**This Month:**\n`;
      response += `• Spent: £${data.totalSpent.toFixed(2)} of £${data.monthlyBudget}\n`;
      response += `• Remaining: £${data.budgetRemaining.toFixed(2)}\n`;
      response += `• Transactions: ${data.transactionCount}\n\n`;
      
      response += `**Top Categories:**\n`;
      Object.entries(data.categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([cat, amount]) => {
          response += `• ${cat}: £${amount.toFixed(2)}\n`;
        });
      
      response += `\n**Prediction:** £${data.predictedBalance.toFixed(2)} by month end`;
      
      if (data.alerts.length > 0) {
        response += `\n\n⚠️ You have ${data.alerts.length} active alert(s). Ask "why did I get a warning?" for details.`;
      }
      
      return response;
    }
    
    // 50/30/20 rule
    if (q.includes("50/30/20") || q.includes("50 30 20")) {
      return "The **50/30/20 rule** is a simple budgeting method:\n\n• **50% Needs** - Rent, utilities, groceries, insurance\n• **30% Wants** - Entertainment, dining out, hobbies\n• **20% Savings** - Emergency fund, investments, debt payoff\n\nFor your £" + data.monthlyBudget.toFixed(0) + " budget:\n- £" + (data.monthlyBudget * 0.5).toFixed(0) + " for needs\n- £" + (data.monthlyBudget * 0.3).toFixed(0) + " for wants\n- £" + (data.monthlyBudget * 0.2).toFixed(0) + " for savings";
    }
    
    // SmartSpend features
    if (q.includes("smartspend") || q.includes("app") || q.includes("feature") || q.includes("how do i use")) {
      return "**SmartSpend features:**\n\n📊 **Dashboard** - Overview of your spending\n📈 **Breakdown** - See spending by category\n🔮 **Prediction** - Forecast end-of-month balance\n📁 **Categories** - Manage expense categories\n💡 **SmartTips** - Financial education articles\n👤 **Profile** - Set your budget & details\n⚙️ **Settings** - Dark mode, import/export data\n\n**Tips:**\n• Add expenses regularly\n• Check the calendar for daily spending\n• Review your predictions weekly\n\nWhat would you like to know more about?";
    }
    
    // Greetings
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.match(/^hi$/)) {
      let greeting = `Hello! 👋 I'm your SmartSpend assistant!\n\n`;
      greeting += `📊 **Quick glance at your finances:**\n`;
      greeting += `• Spent this month: £${data.totalSpent.toFixed(2)}\n`;
      greeting += `• Budget remaining: £${data.budgetRemaining.toFixed(2)}\n`;
      greeting += `• Highest category: ${data.highestCategory.name}\n\n`;
      greeting += `What would you like to know about your spending?`;
      return greeting;
    }
    
    if (q.includes("thank")) {
      return "You're welcome! 😊 Happy to help!\n\nRemember: Good money habits start small. You've already taken a great step by tracking your spending!\n\nAnything else you'd like to know?";
    }
    
    // Default response with user's context
    return `I can help you understand your finances!\n\n**Quick facts:**\n• You've spent £${data.totalSpent.toFixed(2)} this month\n• Your top category is ${data.highestCategory.name}\n• Predicted balance: £${data.predictedBalance.toFixed(2)}\n\n**Try asking:**\n• "Why did I get a warning?"\n• "How much have I spent?"\n• "What's my food spending?"\n• "Give me personalized tips"\n• "What's my budget status?"\n• "Predict my end of month balance"`;
  };

  // Generate initial greeting with user data
  useEffect(() => {
    const data = getFinancialData();
    setMessages([{
      role: "assistant",
      content: `Hi! 👋 I'm your SmartSpend money assistant!\n\n📊 **Your Quick Summary:**\n• Spent: £${data.totalSpent.toFixed(2)} of £${data.monthlyBudget}\n• Top category: ${data.highestCategory.name}\n• ${data.alerts.length > 0 ? `⚠️ ${data.alerts.length} alert(s) active` : "✅ No alerts"}\n\n━━━━━━━━━━━━━━━━━━━━\n\n**📋 What I Can Help With:**\n\n📊 **Spending Analysis**\n"How much have I spent?"\n\n💰 **Budget Tracking**\n"What's my budget status?"\n\n🔮 **Balance Prediction**\n"Predict my end of month balance"\n\n⚠️ **Alerts & Warnings**\n"Why did I get a warning?"\n\n📁 **Category Insights**\n"What's my food spending?"\n\n💡 **Personalized Tips**\n"Give me tips to save money"\n\n━━━━━━━━━━━━━━━━━━━━\n\nTap a topic below or type your question!`
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const response = getAIResponse(input);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(108, 92, 231, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          transition: "all 0.3s ease",
          zIndex: 1000,
          transform: isOpen ? "scale(0.9)" : "scale(1)"
        }}
        title="Chat with Money Assistant"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          width: 380,
          height: 520,
          background: darkMode 
            ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" 
            : "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          borderRadius: 20,
          boxShadow: darkMode 
            ? "0 10px 40px rgba(0,0,0,0.5)" 
            : "0 10px 40px rgba(108, 92, 231, 0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 999,
          border: darkMode 
            ? "1px solid rgba(108, 92, 231, 0.3)" 
            : "1px solid rgba(108, 92, 231, 0.15)"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: 16 }}>
                Money Assistant
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                I know your spending data!
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%"
                }}
              >
                <div style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
                    : darkMode 
                      ? "linear-gradient(135deg, #2a2a4e 0%, #1f1f3a 100%)"
                      : "linear-gradient(135deg, #f0f0f5 0%, #e8e8f0 100%)",
                  color: msg.role === "user" ? "white" : (darkMode ? "#eee" : "#333"),
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" 
                    ? "18px 18px 4px 18px" 
                    : "18px 18px 18px 4px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  boxShadow: msg.role === "user"
                    ? "0 2px 10px rgba(108, 92, 231, 0.3)"
                    : "0 2px 10px rgba(0,0,0,0.05)"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{
                  background: darkMode 
                    ? "linear-gradient(135deg, #2a2a4e 0%, #1f1f3a 100%)"
                    : "linear-gradient(135deg, #f0f0f5 0%, #e8e8f0 100%)",
                  color: darkMode ? "#aaa" : "#666",
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  fontSize: 14
                }}>
                  <span style={{ animation: "pulse 1s infinite" }}>●</span>
                  <span style={{ animation: "pulse 1s infinite 0.2s" }}> ●</span>
                  <span style={{ animation: "pulse 1s infinite 0.4s" }}> ●</span>
                </div>
              </div>
            )}
            
            {/* Quick Suggestion Buttons */}
            {messages.length <= 2 && !isTyping && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8
              }}>
                {[
                  { emoji: "📊", text: "My spending" },
                  { emoji: "💰", text: "Budget status" },
                  { emoji: "🔮", text: "Predict balance" },
                  { emoji: "⚠️", text: "My warnings" },
                  { emoji: "💡", text: "Give me tips" },
                  { emoji: "📈", text: "Full summary" }
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(suggestion.text);
                      setTimeout(() => {
                        const userMessage = { role: "user", content: suggestion.text };
                        setMessages(prev => [...prev, userMessage]);
                        setIsTyping(true);
                        setTimeout(() => {
                          const response = getAIResponse(suggestion.text);
                          setMessages(prev => [...prev, { role: "assistant", content: response }]);
                          setIsTyping(false);
                        }, 600 + Math.random() * 500);
                      }, 100);
                      setInput("");
                    }}
                    style={{
                      background: darkMode 
                        ? "rgba(108, 92, 231, 0.2)" 
                        : "rgba(108, 92, 231, 0.1)",
                      border: "1px solid rgba(108, 92, 231, 0.3)",
                      borderRadius: 20,
                      padding: "8px 14px",
                      fontSize: 13,
                      color: darkMode ? "#a29bfe" : "#6c5ce7",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s ease",
                      fontWeight: 500
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = darkMode 
                        ? "rgba(108, 92, 231, 0.35)" 
                        : "rgba(108, 92, 231, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = darkMode 
                        ? "rgba(108, 92, 231, 0.2)" 
                        : "rgba(108, 92, 231, 0.1)";
                    }}
                  >
                    <span>{suggestion.emoji}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: 16,
            borderTop: darkMode 
              ? "1px solid rgba(108, 92, 231, 0.2)" 
              : "1px solid rgba(108, 92, 231, 0.1)",
            display: "flex",
            gap: 10
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your spending..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: darkMode 
                  ? "1px solid rgba(108, 92, 231, 0.3)" 
                  : "1px solid rgba(108, 92, 231, 0.2)",
                background: darkMode ? "#1a1a2e" : "white",
                color: darkMode ? "#eee" : "#333",
                fontSize: 14,
                outline: "none"
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                border: "none",
                background: input.trim() 
                  ? "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
                  : darkMode ? "#2a2a4e" : "#e0e0e0",
                color: input.trim() ? "white" : (darkMode ? "#666" : "#999"),
                cursor: input.trim() ? "pointer" : "not-allowed",
                fontSize: 16,
                transition: "all 0.2s ease"
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
