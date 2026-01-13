const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");




const app = express();

app.use(cors());
app.use(express.json());

// =========================
// DATABASE CONNECTION
// =========================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "NewPassword@123",
  database: "admindash",
});

const dbPromise = db.promise();

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token missing" });
  }

  jwt.verify(token, "SECRET_KEY_123", (err, user) => {
    if (err) {
      return res.status(403).json({ msg: "Invalid token" });
    }
    req.user = user; // contains id, email
    next();
  });
};


// =========================
// AUTH ROUTES (Signup / Login)
// =========================

// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error" });

      if (result.length > 0) {
        return res.status(400).json({ msg: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ msg: "Signup failed" });
          res.status(201).json({ msg: "Signup successful" });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "All fields required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ msg: "DB error" });
    if (result.length === 0) return res.status(401).json({ msg: "Invalid credentials" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, "SECRET_KEY_123", { expiresIn: "1d" });
    res.json({ token, username: user.username });
  });
});

app.delete("/api/auth/logout", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    "DELETE FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to delete user" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: "User not found" });
      }

      res.json({ msg: "User deleted and signed out successfully" });
    }
  );
});
// =========================
// EXISTING ADMIN / CANDIDATE ROUTES
// =========================

// Get all students/admins
app.get("/api/admin", (req, res) => {
  const sql = "SELECT * FROM admin ORDER BY c_first_name";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add candidates
app.post("/api/admin", (req, res) => {
  const {
    c_id, c_first_name, c_last_name, c_email, c_contact_number,
    c_dob, c_sex, c_college_name, c_branch, c_passing_year,
    c_cgpa, c_state, c_job_title,  c_experience,
    c_experience_details, c_skills, time_slot
  } = req.body;

  const sql = `
    INSERT INTO admin (
      c_id, c_first_name, c_last_name, c_email, c_contact_number,
      c_dob, c_sex, c_college_name, c_branch, c_passing_year,
      c_cgpa, c_state, c_job_title, c_experience,
      c_experience_details, c_skills, time_slot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    c_id, c_first_name, c_last_name, c_email, c_contact_number,
    c_dob, c_sex, c_college_name, c_branch, c_passing_year,
    c_cgpa, c_state, c_job_title, c_experience,
    c_experience_details, c_skills, time_slot
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to add candidate" });
    res.status(201).json({ message: "Candidate added successfully" });
  });
});

// Update candidate time slot
app.put("/api/admin/timeslot", async (req, res) => {
  try {
    const { emails, time_slot } = req.body;

    console.log("Incoming data:", req.body);

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "Emails array required" });
    }

    if (!time_slot) {
      return res.status(400).json({ message: "Time slot required" });
    }

    for (const email of emails) {
      await db.promise().query(
        "UPDATE admin SET time_slot = ? WHERE c_email = ?",
        [time_slot, email]
      );
    }

    res.json({ message: "Time slots updated successfully" });
  } catch (err) {
    console.error("❌ Time slot update error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




// Delete candidate
app.delete("/api/admin/:email", (req, res) => {
  const { email } = req.params;
  const sql = "DELETE FROM admin WHERE c_email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Candidate deleted successfully" });
  });
});


app.get("/api/results", async (req, res) => {
  try {
    // 1️⃣ Fetch all results
    const [rows] = await dbPromise.query("SELECT * FROM results ORDER BY test_date DESC");

    // 2️⃣ Fetch all Q&A
    const [qaRows] = await dbPromise.query("SELECT * FROM candidate_qa");

    // 3️⃣ Map Q&A into each result
    const results = rows.map(r => {
      const c_percentage = r.c_total_questions > 0
        ? (r.c_total_correct_answers / r.c_total_questions * 100)
        : 0;

      const c_status = r.c_total_questions > 0 && (r.c_total_correct_answers / r.c_total_questions * 100) >= 50
        ? 'Pass'
        : 'Fail';

      // Filter Q&A for this candidate
      const qa = qaRows.filter(q => q.r_id === r.r_id);

      return { ...r, c_percentage, c_status, qa };
    });

    res.json(results);

  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).send("Error fetching results");
  }
});



// PUT /api/results/:r_id
app.put("/api/results/:r_id", async (req, res) => {
  const { r_id } = req.params;
  const { c_total_correct_answers } = req.body;

  try {
    await dbPromise.query(
      "UPDATE results SET c_total_correct_answers = ? WHERE r_id = ?",
      [c_total_correct_answers, r_id]
    );

    const [updatedRows] = await dbPromise.query(`
      SELECT r_id, c_id, c_first_name, c_last_name, c_email,
             c_total_correct_answers, c_total_questions, test_date
      FROM results WHERE r_id = ?
    `, [r_id]);

    const updated = updatedRows[0];
    updated.c_percentage = updated.c_total_questions > 0 ? (updated.c_total_correct_answers / updated.c_total_questions * 100).toFixed(2) : 0;
    updated.c_status = updated.c_total_questions > 0 && (updated.c_total_correct_answers / updated.c_total_questions * 100) >= 50 ? 'Pass' : 'Fail';

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating result" });
  }
});

app.get("/api/admin/candidates", (req, res) => {
  const sql = `
    SELECT c_id, c_first_name, c_last_name, c_email
    FROM admin
    ORDER BY c_first_name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch candidates" });
    }

    res.json(results);
  });
});

app.get("/api/admin/notes/:candidateId", (req, res) => {
  const { candidateId } = req.params;

  const sql = `
    SELECT 
      n.id AS note_id,
      n.note,
      n.admin_name,
      n.created_at,
      a.c_email
    FROM admin_notes n
    JOIN admin a ON a.c_id = n.candidate_id
    WHERE n.candidate_id = ?
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [candidateId], (err, rows) => {
    if (err) {
      console.error("FETCH NOTES ERROR:", err);
      return res.status(500).json({ error: "Failed to fetch notes" });
    }

    res.json(rows);
  });
});




app.post("/api/admin/notes", (req, res) => {
  const { candidate_id, note, admin_name } = req.body;

  if (!candidate_id || !note) {
    return res.status(400).json({ error: "Candidate ID and note required" });
  }

  const sql = `
    INSERT INTO admin_notes (candidate_id, note, admin_name)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [candidate_id, note, admin_name], (err, result) => {
    if (err) {
      console.error("Save note error:", err);
      return res.status(500).json({ error: "Failed to save note" });
    }

    res.status(201).json({
      message: "Note saved successfully",
      note_id: result.insertId
    });
  });
});



app.delete("/api/admin/notes/:note_id", (req, res) => {
  const { note_id } = req.params;

  const sql = "DELETE FROM admin_notes WHERE id = ?";

  db.query(sql, [note_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete note" });
    }

    res.json({ message: "Note deleted" });
  });
});


// =========================
// START SERVER
// =========================
app.listen(5000, () => console.log("Server running on port 5000"));