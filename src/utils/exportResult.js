// src/utils/exportTable.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export Results Table to Excel
 * @param {Array} data - results array
 * @param {Function} formatDateTime - optional date formatter
 * @param {String} fileName - excel file name
 */
export const exportResultsToExcel = (
  data,
  formatDateTime = (d) => d,
  fileName = "Results.xlsx"
) => {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  const formattedData = data.map((r) => ({
    "First Name": r.c_first_name,
    "Last Name": r.c_last_name,
    "Email": r.c_email,
    "Total Correct": r.c_total_correct_answers,
    "Total Questions": r.c_total_questions,
    "Percentage": r.c_percentage != null ? Number(r.c_percentage).toFixed(2) : "0.00",
    "Status": r.c_status,
    "Test Date": formatDateTime(r.test_date),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob(
    [excelBuffer],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  );

  saveAs(blob, fileName);
};
