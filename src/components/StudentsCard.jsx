import React, { useEffect, useState } from "react";
import "./StudentsCard.css"; // new CSS for card layout
import AddCandidate from "../components/AddCandidate";

const StudentsCard = () => {
  const [students, setStudents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [updateData, setUpdateData] = useState({ emails: "", time_slot: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Format datetime in IST with AM/PM
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

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

const handleUpdate = async () => {
  if (!updateData.emails || !updateData.time_slot) {
    alert("Emails and Time Slot required");
    return;
  }

  const emailsArray = updateData.emails
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  try {
    const res = await fetch("http://localhost:5000/api/admin/timeslot", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emails: emailsArray,
        time_slot: updateData.time_slot,
      }),
    });

    if (!res.ok) throw new Error();

    alert("Time slot updated for all candidates ✅");
    fetchStudents();
    setUpdateData({ emails: "", time_slot: "" });
  } catch (err) {
    alert("Failed to update time slot ❌");
    console.error(err);
  }
};


  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/${email}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      alert("Candidate deleted ✅");
      fetchStudents();
    } catch (err) {
      alert("Failed to delete candidate ❌");
      console.error(err);
    }
  };

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentStudents = students.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="students-card-page">
      <div className="card-actions">
        <button className="add-btn" onClick={() => setShowAdd(true)}>
          + Add Candidate
        </button>
<button className="export-btn" onClick={() => exportToExcel(students, formatISTDateTime, "StudentsList.xlsx")}>
  Export Table
</button>
        <div className="update-timeslot-inline">
           <span>Want to update the time slot?</span>
         <textarea
  name="emails"
  placeholder="Enter emails (comma separated)"
  value={updateData.emails}
  onChange={handleUpdateChange}
  rows={2}
/>

          <input
            type="datetime-local"
            name="time_slot"
            value={updateData.time_slot}
            onChange={handleUpdateChange}
          />
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-overlay">
          <div className="glass-box">
            <AddCandidate
              onSuccess={() => {
                fetchStudents();
                setShowAdd(false);
                setCurrentPage(Math.ceil((students.length + 1) / ITEMS_PER_PAGE));
              }}
              onClose={() => setShowAdd(false)}
            />
          </div>
        </div>
      )}

      <h2 className="page-title">Students Management</h2>

      <div className="cards-container">
        {currentStudents.map((student) => (
          <div className="student-card" key={student.c_id}>
            <h3>{student.c_first_name} {student.c_last_name}</h3>
            <p><strong>Email:</strong> {student.c_email}</p>
            <p><strong>Contact:</strong> {student.c_contact_number}</p>
            <p><strong>DOB:</strong> {student.c_dob ? new Date(student.c_dob).toLocaleDateString("en-GB").replaceAll("/", "-") : "N/A"}</p>
            <p><strong>Sex:</strong> {student.c_sex}</p>
            <p><strong>College:</strong> {student.c_college_name}</p>
            <p><strong>Branch:</strong> {student.c_branch}</p>
            <p><strong>Passing Year:</strong> {student.c_passing_year}</p>
            <p><strong>CGPA:</strong> {student.c_cgpa}</p>
            <p><strong>State:</strong> {student.c_state}</p>
            <p><strong>Job Title:</strong> {student.c_job_title || "N/A"}</p>
            <p><strong>Experience:</strong> {student.c_experience}</p>
            <p><strong>Skills:</strong> {student.c_skills || "N/A"}</p>
            <p><strong>Time Slot:</strong> {formatISTDateTime(student.time_slot)}</p>
            <button className="delete-btn" onClick={() => handleDelete(student.c_email)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>◀ Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next ▶</button>
      </div>
    </div>
  );
};

export default StudentsCard;
