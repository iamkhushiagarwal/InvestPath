import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ComparatorPage from "./pages/ComparatorPage";
import HomePage from "./pages/HomePage";
import PlannerPage from "./pages/PlannerPage";
import GlossaryPage from "./pages/GlossaryPage";
import WatchlistPage from "./pages/WatchlistPage";
export default function App() {
  const navStyle = {
    padding: "16px 40px",
    background: "#FFFFFF",
    borderBottom: "1px solid #E4E8F5",
    display: "flex",
    gap: 24,
    alignItems: "center",
  };

  const linkStyle = {
    color: "#0E1F4B",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
  };

  return (
    <BrowserRouter>
      <div style={navStyle}>
        <span style={{ fontWeight: 700, color: "#4C5FEF", fontSize: 18, marginRight: 12 }}>
          InvestPath
        </span>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/compare" style={linkStyle}>Compare</Link>
        <Link to="/planner" style={linkStyle}>AI Planner</Link>
        <Link to="/glossary" style={linkStyle}>Glossary</Link>
        <Link to="/watchlist" style={linkStyle}>Watchlist</Link>
      </div>


      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compare" element={<ComparatorPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </BrowserRouter>
  );
}