import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ADMIN PANEL</h2>
      </div>

      <div className="sidebar-section">
        <p className="section-title"><Link to="/login">Authentication & Authorization</Link></p>
        <hr className="custom-line" />
      </div>

      <div className="sidebar-section">
        <p className="section-title">Test Details</p>
        <ul>
          <li><Link to="/candidates">Candidates</Link></li>
          <li><Link to="/results">Q/A Results</Link></li>
        </ul>
      </div>
      <div className="sidebar-section">
        <p className="section-title">Analytics</p>
          <hr className="custom-line" />
        <ul>
          <li><Link to="/analytics">Chart & Table</Link></li>
        <li>    <Link to="/students-card">Students Card</Link>  </li>
         <li>    <Link to="/results-card">Results Card</Link>  </li>
        
        </ul>
      </div>



       <div className="sidebar-section">
        <p className="section-title">Ideas</p>
          <hr className="custom-line" />
        <ul>
          <li><Link to="/admin-notes">Note</Link></li>
        
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
