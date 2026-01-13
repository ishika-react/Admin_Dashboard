import React, { useEffect, useState } from "react"; 
import "./StudentsTable.css";
import ResultFilter from "../components/ResultFilter";
import { exportResultsToExcel } from "../utils/exportResult";


const ResultsTable = () => {
  const [results, setResults] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editCorrect, setEditCorrect] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedQA, setExpandedQA] = useState(null);
  const totalPass = results.filter(r => r.c_status === "Pass").length;
  const totalFail = results.filter(r => r.c_status === "Fail").length;
  const rowsPerPage = 7; // 7 rows per page

  // Toggle Q&A collapse
  const toggleQA = (r_id) => {
    setExpandedQA(expandedQA === r_id ? null : r_id);
  };

  // Format datetime in IST
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

  // Fetch all results
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

  // Pagination logic
  const totalPages = Math.ceil(results.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = results.slice(indexOfFirstRow, indexOfLastRow);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // Handle inline edit
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
    <div className="table-contain">
      <h2 className="table-header">Results</h2>

  <button
    className="dev-btn"
    onClick={() =>
      exportResultsToExcel(results, formatISTDateTime, "Results_Table.xlsx")
    }
  >
    ⬇ Export Results
  </button>


      {/* <ResultFilter status={statusFilter} setStatus={setStatusFilter} /> */}

      <table className="students-table">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Total Correct Answers</th>
            <th>Total Questions</th>
            <th>Percentage</th>
            <th>Status</th>
            <th>Test Date</th>
            <th>Action</th>
            <th>Q&A</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row) => (
            <React.Fragment key={row.r_id}>
              <tr>
                {/* <td>{row.r_id}</td> */}
                <td>{row.c_first_name}</td>
                <td>{row.c_last_name}</td>
                <td>{row.c_email}</td>
                <td>
                  {editRow === row.r_id ? (
                    <input type="number" value={editCorrect} onChange={handleInputChange} />
                  ) : (
                    row.c_total_correct_answers
                  )}
                </td>
                <td>{row.c_total_questions}</td>
                <td>
                  {row.c_percentage != null
                    ? Number(row.c_percentage).toFixed(2)
                    : "0.00"}
                </td>
                <td
                  className={
                    row.c_status === "Pass"
                      ? "status accepted"
                      : row.c_status === "Fail"
                      ? "status rejected"
                      : "status"
                  }
                >
                  {row.c_status}
                </td>
                <td>{formatISTDateTime(row.test_date)}</td>
                <td>
                  {editRow === row.r_id ? (
                    <button onClick={() => handleSave(row)}>Save</button>
                  ) : (
                    <button onClick={() => handleEditClick(row)}>Edit</button>
                  )}
                </td>
                <td>
                  <button onClick={() => toggleQA(row.r_id)}>
                    {expandedQA === row.r_id ? "Hide Q&A" : "Show Q&A"}
                  </button>
                </td>
              </tr>

              {/* Collapsible Q&A row */}
              {expandedQA === row.r_id && (
                <tr className="qa-row">
                  <td colSpan={11}>
                    <ul className="qa-list">
                      {row.qa && row.qa.length > 0 ? (
                        row.qa.map((q) => (
                          <li key={q.qa_id}>
                            <b>Q:</b> {q.question} <br />
                            <b>A:</b> {q.candidate_answer} <br />
                            <b>Correct:</b> {q.correct_answer} <br />
                            <b>Status:</b> {q.is_correct ? "✔️" : "❌"}
                          </li>
                        ))
                      ) : (
                        <i>No Q&A available</i>
                      )}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}


        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={goToPrev} disabled={currentPage === 1}>
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button onClick={goToNext} disabled={currentPage === totalPages}>
          Next
        </button>
           <tr className="totals-row">
    <td colSpan={6} style={{ textAlign: "right", fontWeight: "bold", color: "black"}}>Totals:</td>
    <td className="status accepted">Pass: {totalPass}</td>
    <td className="status rejected">Fail: {totalFail}</td>
    <td colSpan={2}></td>
  </tr> 
      </div>
    </div>
  );
};

export default ResultsTable;
