import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Breakdown from "./pages/Breakdown";
import Prediction from "./pages/Prediction";
import Categories from "./pages/Categories";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/breakdown" element={<Breakdown />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </Layout>
  );
}
