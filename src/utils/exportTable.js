// src/utils/exportTable.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Exports an array of objects to Excel
 * @param {Array} data - Array of student objects
 * @param {Function} formatDateTime - Function to format date/time (optional)
 * @param {string} fileName - Name of the exported file
 */
export const exportToExcel = (data, formatDateTime = (d) => d, fileName = "Data.xlsx") => {
  // Prepare data
  const exportData = data.map((student) => ({
    ID: student.c_id,
    Name: `${student.c_first_name} ${student.c_last_name}`,
    Email: student.c_email,
    Contact: student.c_contact_number,
    DOB: student.c_dob ? new Date(student.c_dob).toLocaleDateString("en-GB") : "N/A",
    Sex: student.c_sex,
    College: student.c_college_name,
    Branch: student.c_branch,
    PassingYear: student.c_passing_year,
    CGPA: student.c_cgpa,
    State: student.c_state,
    JobTitle: student.c_job_title || "N/A",
    Experience: student.c_experience,
    Skills: student.c_skills || "N/A",
    TimeSlot: formatDateTime(student.time_slot),
  }));

  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate buffer and save
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName);
};
