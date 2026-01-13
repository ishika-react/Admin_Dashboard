import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header"; 
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import StudentsTable from "./pages/StudentsTable";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResultsTable from "./pages/ResultsTable";
import AuthPage from "./pages/AuthPage";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";
import AdminNotes from "./components/AdminNotes";
import StudentsCard from "./components/StudentsCard";
import ResultsCard from "./components/ResultsCard";

function App() {
  return (
    <Router>
      <div
        className="app-container"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Header */}
        <Header />

        {/* Main area */}
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />
          <div style={{ padding: "20px", flex: 1 }}>
            <Routes>
              {/* Default route → Auth */}
             <Route path="/" element={<Navigate to="/login" />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />

              <Route path="/candidates" element={<StudentsTable />} />
              <Route path="/results" element={<ResultsTable />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/students-card" element={<StudentsCard />} />
                     <Route path="/results-card" element={<ResultsCard />} />
              <Route path="/admin-notes" element={<AdminNotes />} />


              {/* Add more routes here if needed */}
            </Routes>
          </div>
        </div>

        {/* Footer */}
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
