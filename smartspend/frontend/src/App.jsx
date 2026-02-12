import { Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Breakdown from "./pages/Breakdown";
import Prediction from "./pages/Prediction";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SmartTips from "./pages/SmartTips";

export default function App() {
  return (
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
  );
}
