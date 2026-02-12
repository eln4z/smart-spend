import { useState } from "react";
import { useData } from "../context/DataContext";
import Card from "../components/Card";

const tips = [
  {
    id: 1,
    emoji: "📘",
    title: "How to Create a Simple Student Budget",
    content: `Budgeting doesn't need to be complicated.

**Start with 3 steps:**
1. List your monthly income (loan, part-time job, support)
2. List fixed expenses (rent, subscriptions, travel)
3. Track flexible spending (food, entertainment, shopping)

**A good rule:**
• Essentials: ~50–60%
• Flexible spending: ~20–30%
• Savings/emergency: at least 10%

*The goal is awareness, not perfection.*`
  },
  {
    id: 2,
    emoji: "💳",
    title: "Why Small Purchases Add Up",
    content: `£4 coffee × 5 days × 4 weeks = **£80/month**

Small daily spending feels harmless, but it adds up quickly.

**Smart tip:**
Before buying something small, ask yourself:
*"Would I still buy this if I saw the monthly total?"*

Track your small purchases in SmartSpend to see the real impact!`
  },
  {
    id: 3,
    emoji: "🔔",
    title: "How to Avoid Overspending",
    content: `Overspending usually happens because of:
• Impulse buying
• Forgotten subscriptions
• No spending limit awareness

**Simple solutions:**
1. Set a weekly spending limit
2. Review subscriptions monthly
3. Check your balance before big purchases

Use SmartSpend's prediction feature to stay ahead!`
  },
  {
    id: 4,
    emoji: "📊",
    title: "What Is a Spending Category?",
    content: `Categories help you see patterns.

**Instead of:**
30 random transactions

**You see:**
• Food: £210
• Transport: £85
• Subscriptions: £42

*Categories turn confusion into clarity.*

Go to the Categories page to customise yours!`
  },
  {
    id: 5,
    emoji: "🔮",
    title: "Why Predicting Your Balance Matters",
    content: `If you know your predicted end-of-month balance, you:
• ✓ Reduce stress
• ✓ Avoid surprise overdrafts
• ✓ Make smarter decisions

**Prediction = awareness of future risk.**

Check the Prediction page to see where you'll be at month end!`
  },
  {
    id: 6,
    emoji: "💡",
    title: "The 50/30/20 Rule Explained",
    content: `A simple framework for budgeting:

**50% Needs**
Rent, utilities, groceries, transport, insurance

**30% Wants**
Entertainment, dining out, hobbies, shopping

**20% Savings**
Emergency fund, investments, debt repayment

For a £1,500 monthly budget:
• £750 for needs
• £450 for wants
• £300 for savings`
  },
  {
    id: 7,
    emoji: "🎯",
    title: "Setting Financial Goals",
    content: `Goals give your money purpose.

**Short-term (1-6 months):**
• Build £500 emergency fund
• Pay off a small debt

**Medium-term (6-12 months):**
• Save for a holiday
• Buy a new laptop

**Long-term (1+ years):**
• Graduate debt-free
• Build 3-month expense buffer

*Write down your goals and track progress!*`
  },
  {
    id: 8,
    emoji: "🛡️",
    title: "Building an Emergency Fund",
    content: `An emergency fund protects you from:
• Unexpected bills
• Job loss
• Car/bike repairs
• Medical expenses

**How to start:**
1. Start small - even £25/month
2. Keep it separate from spending money
3. Aim for £500 first, then 3 months expenses

*Don't touch it unless it's a real emergency!*`
  }
];

export default function SmartTips() {
  const { darkMode } = useData();
  const [expandedTip, setExpandedTip] = useState(null);

  const toggleTip = (id) => {
    setExpandedTip(expandedTip === id ? null : id);
  };

  // Simple markdown-like formatting
  const formatContent = (text) => {
    return text
      .split('\n')
      .map((line) => {
        // Bold text
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic text
        line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Bullet points
        if (line.trim().startsWith('•')) {
          return `<div style="padding-left: 16px; margin: 4px 0;">${line}</div>`;
        }
        // Numbered items
        if (line.trim().match(/^\d\./)) {
          return `<div style="padding-left: 16px; margin: 4px 0;">${line}</div>`;
        }
        return line ? `<div style="margin: 8px 0;">${line}</div>` : '<br/>';
      })
      .join('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: 32
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 8
        }}>
          💡 SmartTips
        </h1>
        <p style={{
          color: darkMode ? "#aaa" : "#666",
          fontSize: 16,
          maxWidth: 500,
          margin: "0 auto"
        }}>
          Simple, beginner-friendly guides to help you manage your money better
        </p>
      </div>

      {/* Tips Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 20
      }}>
        {tips.map((tip) => (
          <Card key={tip.id}>
            <div 
              onClick={() => toggleTip(tip.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Tip Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: expandedTip === tip.id ? 16 : 0
              }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0
                }}>
                  {tip.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: darkMode ? "#fff" : "#333",
                    margin: 0,
                    lineHeight: 1.3
                  }}>
                    {tip.title}
                  </h3>
                  <span style={{
                    fontSize: 12,
                    color: "#6c5ce7",
                    fontWeight: 500
                  }}>
                    {expandedTip === tip.id ? "Click to collapse" : "Click to read"}
                  </span>
                </div>
                <div style={{
                  fontSize: 20,
                  color: darkMode ? "#888" : "#aaa",
                  transform: expandedTip === tip.id ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.3s ease"
                }}>
                  ▼
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTip === tip.id && (
                <div style={{
                  padding: "16px",
                  background: darkMode 
                    ? "rgba(108, 92, 231, 0.1)" 
                    : "rgba(108, 92, 231, 0.05)",
                  borderRadius: 12,
                  marginTop: 8
                }}>
                  <div 
                    style={{
                      color: darkMode ? "#ddd" : "#444",
                      fontSize: 14,
                      lineHeight: 1.6
                    }}
                    dangerouslySetInnerHTML={{ __html: formatContent(tip.content) }}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card>
        <div style={{
          textAlign: "center",
          padding: "20px 0"
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: darkMode ? "#fff" : "#333",
            marginBottom: 8
          }}>
            Have more questions?
          </h3>
          <p style={{
            color: darkMode ? "#aaa" : "#666",
            fontSize: 14,
            marginBottom: 16
          }}>
            Chat with our Money Assistant for personalised advice!
          </p>
          <p style={{
            color: "#6c5ce7",
            fontSize: 14,
            fontWeight: 500
          }}>
            Look for the 💬 button in the bottom right corner
          </p>
        </div>
      </Card>
    </div>
  );
}
