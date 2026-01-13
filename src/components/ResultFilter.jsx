import React from "react";
import "./ResultFilter.css";

const ResultFilter = ({ status, setStatus }) => {
  return (
    <div className="result-filter">
      <label htmlFor="statusFilter">Filter by Status:</label>

      <select
        id="statusFilter"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="ALL">All</option>
        <option value="Accepted">Accepted</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>
  );
};

export default ResultFilter;
