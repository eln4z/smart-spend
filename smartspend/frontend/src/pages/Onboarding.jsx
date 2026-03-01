import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    currency: "GBP",
    avatar: "bunny1",
    // Initial budgets
    budgets: {
      "Food & Dining": 400,
      "Transportation": 150,
      "Shopping": 200,
      "Entertainment": 100,
      "Bills & Utilities": 300,
    },
  });

  const currencies = [
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
  ];

  // Avatar options matching the files in public/avatars
  const avatarOptions = [
    { id: "bunny1", name: "Cute Bunny 1", file: "Cute bunny budgeting 1.jpg" },
    { id: "bunny2", name: "Cute Bunny 2", file: "Cute bunny budgeting 2.jpg" },
    { id: "girl1", name: "Budget Girl 1", file: "Cute budgeting adventures girl 1.jpg" },
    { id: "girl2", name: "Budget Girl 2", file: "Cute budgeting adventures girl 2.jpg" },
    { id: "piggy", name: "Piggy Bank", file: "Piggy Bank Nerd.jpg" },
    { id: "student", name: "Student", file: "Budgeting Student with Phone.jpg" },
    { id: "cat", name: "Money Cat", file: "Money Cat Graduate.jpg" },
    { id: "confused", name: "Confused Student", file: "Confused Student with Bills.jpg" },
    { id: "robot", name: "Budget Robot", file: "Budget Robot Assistant.jpg" },
    { id: "stack", name: "Study Stack", file: "Study & Savings Stack.jpg" },
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update user profile
      await api.user.updateProfile({
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        currency: formData.currency,
        avatar: formData.avatar,
      });

      // Mark onboarding as complete
      localStorage.setItem("smartspend_onboarding_complete", "true");

      updateUser({
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        currency: formData.currency,
        avatar: formData.avatar,
      });

      navigate("/");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "2px solid #e9ecef",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 40,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 20px 60px rgba(108, 92, 231, 0.3)",
        }}
      >
        {/* Progress */}
        <div style={{ marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  background:
                    s <= step
                      ? "linear-gradient(135deg, #6c5ce7, #a29bfe)"
                      : "#e9ecef",
                  color: s <= step ? "white" : "#888",
                }}
              >
                {s < step ? "✓" : s}
              </div>
            ))}
          </div>
          <div
            style={{
              height: 4,
              background: "#e9ecef",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((step - 1) / 3) * 100}%`,
                height: "100%",
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>👋</div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 10,
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome, {user?.name?.split(" ")[0]}!
            </h1>
            <p style={{ color: "#666", marginBottom: 30, lineHeight: 1.6 }}>
              Let's set up your SmartSpend account to help you track your
              finances and reach your savings goals.
            </p>
            <div
              style={{
                background: "rgba(108, 92, 231, 0.05)",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <p style={{ margin: 0, color: "#555", fontSize: 14 }}>
                This will only take about <strong>2 minutes</strong> ⏱️
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Financial Info */}
        {step === 2 && (
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 8,
                color: "#333",
              }}
            >
              💰 Your Income
            </h2>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Help us personalize your budget recommendations.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                Monthly Income (after tax)
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    width: 100,
                    cursor: "pointer",
                  }}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyIncome: e.target.value })
                  }
                  placeholder="e.g., 3500"
                  style={inputStyle}
                />
              </div>
            </div>

            <div
              style={{
                background: "rgba(46, 204, 113, 0.1)",
                border: "1px solid rgba(46, 204, 113, 0.2)",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, color: "#27ae60" }}>
                💡 <strong>Tip:</strong> Include your regular salary, freelance
                income, or any other consistent monthly earnings.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Choose Avatar */}
        {step === 3 && (
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 8,
                color: "#333",
              }}
            >
              👤 Choose Your Avatar
            </h2>
            <p style={{ color: "#666", marginBottom: 24 }}>
              Pick a profile picture that represents you.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                  style={{
                    background:
                      formData.avatar === avatar.id
                        ? "linear-gradient(135deg, #6c5ce7, #a29bfe)"
                        : "#f8f9fa",
                    border:
                      formData.avatar === avatar.id
                        ? "3px solid #6c5ce7"
                        : "3px solid transparent",
                    borderRadius: 16,
                    padding: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    src={`/avatars/${encodeURIComponent(avatar.file)}`}
                    alt={avatar.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg, #6c5ce7, #a29bfe);display:flex;align-items:center;justify-content:center;font-size:32px;">👤</div>`;
                    }}
                  />
                  <div style={{ fontSize: 11, marginTop: 6, color: formData.avatar === avatar.id ? "#fff" : "#666" }}>
                    {avatar.name}
                  </div>
                </button>
              ))}
            </div>

            <div
              style={{
                background: "rgba(108, 92, 231, 0.05)",
                borderRadius: 10,
                padding: 16,
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                You can change this later in your profile settings.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 10,
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              You're All Set!
            </h2>
            <p style={{ color: "#666", marginBottom: 30, lineHeight: 1.6 }}>
              Your SmartSpend account is ready. Start tracking your expenses and
              achieve your financial goals!
            </p>

            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <h3
                style={{ margin: "0 0 16px 0", fontSize: 16, color: "#333" }}
              >
                What you can do now:
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  textAlign: "left",
                }}
              >
                {[
                  "📊 View your spending dashboard",
                  "➕ Add your first transaction",
                  "🎯 Set budget goals",
                  "💡 Get personalized savings tips",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      background: "white",
                      borderRadius: 10,
                      color: "#555",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 30,
          }}
        >
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1,
                padding: 14,
                background: "#f8f9fa",
                color: "#666",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: 14,
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(108, 92, 231, 0.3)",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: 14,
                background: isLoading
                  ? "#a29bfe"
                  : "linear-gradient(135deg, #2ecc71, #27ae60)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)",
              }}
            >
              {isLoading ? "Setting up..." : "Get Started! 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
