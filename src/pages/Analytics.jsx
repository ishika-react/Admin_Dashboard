import React, { useEffect, useState } from "react"; 
import "./Analytics.css";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
);

const options = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: "#ffffff",
        font: {
          size: 14,
          weight: "bold",
        },
      },
    },
    tooltip: {
      titleColor: "#ffffff",
      bodyColor: "#e5e7eb",
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },

  scales: {
    x: {
      ticks: {
        color: "#0644b0ff",
        font: { size: 20 },
      },
      grid: {
        color: "rgba(194, 219, 225, 0.9)",
      },
    },
    y: {
      ticks: {
        color: "#4f0452ff",
        font: { size: 20 },
      },
      grid: {
        color: "rgba(255,255,255,0.1)",
      },
    },
  },
};

const Analytics = () => {
  const [students, setStudents] = useState([]);
  const [activeGraph, setActiveGraph] = useState("cgpa");
const [adminStudents, setAdminStudents] = useState([]);   // Only admin
const [resultsStudents, setResultsStudents] = useState([]); // Only results

  // =========================
  // FETCH RESULTS DATA
  // =========================
 const fetchData = async () => {
  try {
    const resResults = await fetch("http://localhost:5000/api/results");
    const resultsData = await resResults.json();
    setResultsStudents(resultsData);

    const resAdmin = await fetch("http://localhost:5000/api/admin");
    const adminData = await resAdmin.json();
    setAdminStudents(adminData);
  } catch (err) {
    console.error("Analytics fetch error:", err);
  }
};

useEffect(() => {
  fetchData();
}, []);



  // =========================
  // GRAPH DATA
  // =========================
 // Line charts use only adminStudents
const cgpaChart = {
  labels: adminStudents.map((s) => s.c_first_name),
  datasets: [
    {
      label: "CGPA",
      data: adminStudents.map((s) => s.c_cgpa),
      borderColor: "#6366f1",
      backgroundColor: "#6366f1",
      tension: 0.4,
    },
  ],
};

const experienceChart = {
  labels: adminStudents.map((s) => s.c_first_name),
  datasets: [
    {
      label: "Experience (Years)",
      data: adminStudents.map((s) => s.c_experience),
      borderColor: "#059669",
      backgroundColor: "#059669",
      tension: 0.4,
    },
  ],
};

const jobCounts = {};
adminStudents.forEach((s) => {
  if (s.c_job_title) {
    jobCounts[s.c_job_title] = (jobCounts[s.c_job_title] || 0) + 1;
  }
});

const jobTitleChart = {
  labels: Object.keys(jobCounts),
  datasets: [
    {
      label: "Job Title Count",
      data: Object.values(jobCounts),
      borderColor: "#dc2626",
      backgroundColor: "#dc2626",
      tension: 0.4,
    },
  ],
};

// Pie chart uses resultsStudents for Accepted / Rejected
const statusCounts = { Accepted: 0, Rejected: 0 };
resultsStudents.forEach((s) => {
  if (s.c_status === "Pass") statusCounts.Accepted += 1;
  else statusCounts.Rejected += 1;
});

const statusChart = {
  labels: ["Pass", "Fail"],
  datasets: [
    {
      label: "Status Count",
      data: [statusCounts.Accepted, statusCounts.Rejected],
      backgroundColor: ["#10b981", "#ef4444"],
      borderColor: ["#10b981", "#ef4444"],
      borderWidth: 1,
    },
  ],
};


  const getChartData = () => {
    if (activeGraph === "cgpa") return cgpaChart;
    if (activeGraph === "experience") return experienceChart;
    if (activeGraph === "job") return jobTitleChart;
  };

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">📊 Student Analytics</h2>

      {/* BUTTONS */}
      <div className="analytics-buttons">
        <button
          className={activeGraph === "cgpa" ? "active" : ""}
          onClick={() => setActiveGraph("cgpa")}
        >
          CGPA
        </button>

        {/* <button
          className={activeGraph === "experience" ? "active" : ""}
          onClick={() => setActiveGraph("experience")}
        >
          Experience
        </button> */}

        <button
          className={activeGraph === "job" ? "active" : ""}
          onClick={() => setActiveGraph("job")}
        >
          Job Title
        </button>

        <button
          className={activeGraph === "status" ? "active" : ""}
          onClick={() => setActiveGraph("status")}
        >
          Status
        </button>
      </div>

      {/* CHART */}
      <div className="chart-wrapper" style={{ maxHeight: "400px", overflowY: "auto" }}>
        {activeGraph === "status" ? (
          <Pie data={statusChart} options={options} />
        ) : (
          <Line data={getChartData()} options={options} />
        )}
      </div>
    </div>
  );
};

export default Analytics;
