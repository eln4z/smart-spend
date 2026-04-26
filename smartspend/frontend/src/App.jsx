import { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Breakdown from "./pages/Breakdown";
import Prediction from "./pages/Prediction";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SmartTips from "./pages/SmartTips";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

// Error Boundary — catches any render crash and shows a message instead of blank page
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column", gap: 16,
          background: "#f8f9fa", textAlign: "center", padding: 32
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ color: "#e74c3c" }}>Something went wrong</h2>
          <p style={{ color: "#666", maxWidth: 400 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ padding: "10px 24px", background: "#6c5ce7", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
      }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <div style={{ fontSize: 18 }}>Loading SmartSpend...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const needsOnboarding = user && !user.monthlyIncome && !localStorage.getItem("smartspend_onboarding_complete");
  if (needsOnboarding && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// App content with auth check
const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
      }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <div style={{ fontSize: 18 }}>Loading SmartSpend...</div>
        </div>
      </div>
    );
  }

  const needsOnboarding = isAuthenticated && user && !user.monthlyIncome && !localStorage.getItem("smartspend_onboarding_complete");

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace /> : <Login />}
      />
      <Route
        path="/onboarding"
        element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DataProvider>
              <Layout>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/breakdown" element={<Breakdown />} />
                    <Route path="/prediction" element={<Prediction />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/smarttips" element={<SmartTips />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </ErrorBoundary>
              </Layout>
            </DataProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
