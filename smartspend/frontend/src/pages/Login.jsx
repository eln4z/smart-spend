import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, error, clearError } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.email || !formData.password) {
      setFormError("Please fill in all required fields");
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setFormError("Please enter your name");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setFormError("Password must be at least 6 characters");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate("/");
      } else {
        await register(formData.name, formData.email, formData.password);
        // New users go to onboarding
        navigate("/onboarding");
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormError("");
    clearError();
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 40,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(108, 92, 231, 0.3)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img
            src="/logo.png"
            alt="SmartSpend Logo"
            style={{
              width: 150,
              height: 150,
              objectFit: "contain",
              marginBottom: 10,
            }}
          />
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            SmartSpend
          </h1>
          <p style={{ color: "#666", marginTop: 8 }}>
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Error Message */}
        {(formError || error) && (
          <div
            style={{
              background: "rgba(231, 76, 60, 0.1)",
              border: "1px solid rgba(231, 76, 60, 0.3)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              color: "#e74c3c",
              fontSize: 14,
            }}
          >
            {formError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "2px solid #e9ecef",
                  fontSize: 16,
                  transition: "border-color 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6c5ce7")}
                onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
                color: "#333",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: "2px solid #e9ecef",
                fontSize: 16,
                transition: "border-color 0.2s",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6c5ce7")}
              onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 500,
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: "2px solid #e9ecef",
                fontSize: 16,
                transition: "border-color 0.2s",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6c5ce7")}
              onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "2px solid #e9ecef",
                  fontSize: 16,
                  transition: "border-color 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6c5ce7")}
                onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              background: isLoading
                ? "#a29bfe"
                : "linear-gradient(135deg, #6c5ce7, #a29bfe)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 15px rgba(108, 92, 231, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(108, 92, 231, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(108, 92, 231, 0.3)";
            }}
          >
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ color: "#666" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={toggleMode}
            style={{
              background: "none",
              border: "none",
              color: "#6c5ce7",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* Demo Account Info */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "rgba(108, 92, 231, 0.05)",
            borderRadius: 10,
            border: "1px solid rgba(108, 92, 231, 0.1)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#666",
              textAlign: "center",
            }}
          >
            <strong>Demo Account:</strong>
            <br />
            demo@smartspend.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
