import React, { useEffect, useState } from "react";    
import "./StudentsTable.css";
import AddCandidate from "../components/AddCandidate";
import { exportToExcel } from "../utils/exportTable";

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [updateData, setUpdateData] = useState({ emails: "", time_slot: "" });

  /* 🔹 PAGINATION STATE (ADDED) */
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Format datetime in IST with AM/PM
  const formatISTDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date)
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
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

  // Handle update input change
  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  // Update time slot by email
const handleUpdate = async () => {
  if (!updateData.emails || !updateData.time_slot) {
    alert("Emails and Time Slot required");
    return;
  }

  // Split emails by comma or new line
  const emailsArray = updateData.emails
    .split(/[\n,]+/)
    .map(email => email.trim())
    .filter(Boolean);

  if (!emailsArray.length) {
    alert("Please enter at least one valid email");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin/timeslot", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emails: emailsArray,     // 👈 MULTIPLE emails
        time_slot: updateData.time_slot,
      }),
    });

    if (!res.ok) throw new Error();

    alert(`Time slot updated for ${emailsArray.length} candidates ✅`);
    fetchStudents();
    setUpdateData({ emails: "", time_slot: "" });
  } catch (err) {
    alert("Failed to update time slot ❌");
    console.error(err);
  }
};


  // Delete candidate by email
const handleDelete = async (email) => {
  if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

  try {
    const encodedEmail = encodeURIComponent(email);

    const res = await fetch(
      `http://localhost:5000/api/admin/${encodedEmail}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) throw new Error();

    alert("Candidate deleted ✅");
    fetchStudents();
  } catch (err) {
    alert("Failed to delete candidate ❌");
    console.error(err);
  }
};


  /* 🔹 PAGINATION LOGIC (ADDED) */
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentStudents = students.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="table-container">

      {/* Top Actions */}
      <div className="actions">
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
  placeholder="Enter candidate emails (comma or new line separated)"
  value={updateData.emails}
  onChange={handleUpdateChange}
  rows={3}
/>

          <input
            type="datetime-local"
            name="time_slot"
            value={updateData.time_slot}
            onChange={handleUpdateChange}
          />
          <button type="button" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>

      {/* Glassmorphism Modal */}
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
      
      <h2 className="table-header">Students List</h2>

      {/* TABLE */}
      <table className="students-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>DOB</th>
            <th>Sex</th>
            <th>College</th>
            <th>Branch</th>
            <th>Passing Year</th>
            <th>CGPA</th>
            <th>State</th>
            <th>Job Title</th>
            <th>Experience</th>
            <th>Skills</th>
            <th>Time Slot</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentStudents.map(student => (
            <tr key={student.c_id}>
              <td>{student.c_id}</td>
              <td>{student.c_first_name} {student.c_last_name}</td>
              <td>{student.c_email}</td>
              <td>{student.c_contact_number}</td>
              <td>{student.c_dob ? new Date(student.c_dob).toLocaleDateString("en-GB").replaceAll("/", "-") : "N/A"}</td>
              <td>{student.c_sex}</td>
              <td>{student.c_college_name}</td>
              <td>{student.c_branch}</td>
              <td>{student.c_passing_year}</td>
              <td>{student.c_cgpa}</td>
              <td>{student.c_state}</td>
              <td>{student.c_job_title || "N/A"}</td>
              <td>{student.c_experience}</td>
              <td>{student.c_skills || "N/A"}</td>
              <td>{formatISTDateTime(student.time_slot)}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(student.c_email)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 PAGINATION CONTROLS (ADDED) */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          ◀ Prev
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default StudentsTable;
