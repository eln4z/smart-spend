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

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
        }}
      >
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

  // Check if user needs onboarding (no monthly income set and not completed onboarding)
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <div style={{ fontSize: 18 }}>Loading SmartSpend...</div>
        </div>
      </div>
    );
  }

  // Check if new user needs onboarding
  const needsOnboarding = isAuthenticated && user && !user.monthlyIncome && !localStorage.getItem("smartspend_onboarding_complete");

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={needsOnboarding ? "/onboarding" : "/"} replace /> : <Login />}
      />
      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            <Onboarding />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DataProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/breakdown" element={<Breakdown />} />
                  <Route path="/prediction" element={<Prediction />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/smarttips" element={<SmartTips />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
