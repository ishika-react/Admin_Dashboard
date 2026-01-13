import React, { useEffect, useState } from "react";
import "./ResultsCard.css";

const ResultsCard = () => {
  const [results, setResults] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editCorrect, setEditCorrect] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQA, setExpandedQA] = useState(null);
  const rowsPerPage = 6;

  const totalPass = results.filter(r => r.c_status === "Pass").length;
  const totalFail = results.filter(r => r.c_status === "Fail").length;

  const formatISTDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  };

  const fetchResults = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/results");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const totalPages = Math.ceil(results.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = results.slice(indexOfFirstRow, indexOfLastRow);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const toggleQA = (r_id) => {
    setExpandedQA(expandedQA === r_id ? null : r_id);
  };

  const handleEditClick = (row) => {
    setEditRow(row.r_id);
    setEditCorrect(row.c_total_correct_answers);
  };

  const handleInputChange = (e) => setEditCorrect(e.target.value);

  const handleSave = async (row) => {
    if (editCorrect === "" || isNaN(editCorrect)) {
      alert("Please enter a valid number");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/results/${row.r_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ c_total_correct_answers: Number(editCorrect) }),
      });
      if (!res.ok) throw new Error();
      fetchResults();
      setEditRow(null);
      setEditCorrect("");
    } catch (err) {
      console.error(err);
      alert("Failed to update result");
    }
  };

  return (
    <div className="results-card-page">
      <h2>Results</h2>
        <button
            className="dev-btn"
            onClick={() =>
              exportResultsToExcel(results, formatISTDateTime, "Results_Table.xlsx")
            }
          >
            ⬇ Export Results
          </button>

      <div className="cards-container">
      
        {currentRows.map((row) => (
          <div className="result-card" key={row.r_id}>
            <h3>{row.c_first_name} {row.c_last_name}</h3>
            <p><strong>Email:</strong> {row.c_email}</p>
            <p>
              <strong>Total Correct:</strong>{" "}
              {editRow === row.r_id ? (
                <input type="number" value={editCorrect} onChange={handleInputChange} />
              ) : (
                row.c_total_correct_answers
              )}
            </p>
            <p><strong>Total Questions:</strong> {row.c_total_questions}</p>
            <p><strong>Percentage:</strong> {row.c_percentage ? Number(row.c_percentage).toFixed(2) : "0.00"}</p>
            <p className={row.c_status === "Pass" ? "status pass" : "status fail"}>
              <strong>Status:</strong> {row.c_status}
            </p>
            <p><strong>Test Date:</strong> {formatISTDateTime(row.test_date)}</p>
            <div className="card-actions">
              {editRow === row.r_id ? (
                <button onClick={() => handleSave(row)}>Save</button>
              ) : (
                <button onClick={() => handleEditClick(row)}>Edit</button>
              )}
              <button onClick={() => toggleQA(row.r_id)}>
                {expandedQA === row.r_id ? "Hide Q&A" : "Show Q&A"}
              </button>
            </div>
            {expandedQA === row.r_id && (
              <ul className="qa-list">
                {row.qa && row.qa.length > 0 ? (
                  row.qa.map((q) => (
                    <li key={q.qa_id}>
                      <b>Q:</b> {q.question}<br/>
                      <b>A:</b> {q.candidate_answer}<br/>
                      <b>Correct:</b> {q.correct_answer}<br/>
                      <b>Status:</b> {q.is_correct ? "✔️" : "❌"}
                    </li>
                  ))
                ) : (
                  <i>No Q&A available</i>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={goToPrev} disabled={currentPage === 1}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={goToNext} disabled={currentPage === totalPages}>Next</button>
      </div>

      <div className="totals">
        <span className="status pass">Pass: {totalPass}</span>
        <span className="status fail">Fail: {totalFail}</span>
      </div>
    </div>
  );
};

export default ResultsCard;
