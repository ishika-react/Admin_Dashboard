import React, { useEffect, useState } from "react"; 
import "./AdminNotes.css";

const AdminNotes = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [note, setNote] = useState("");
  const [notesList, setNotesList] = useState([]);

  // 🔹 Fetch candidates (runs once)
  useEffect(() => {
    fetch("http://localhost:5000/api/admin")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);

        // Auto-select first candidate if available
        if (data.length > 0) {
          setSelectedCandidate(data[0].c_id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Fetch notes when selectedCandidate changes
  useEffect(() => {
    if (!selectedCandidate) {
      setNotesList([]);
      setCandidateEmail("");
      return;
    }

    fetch(`http://localhost:5000/api/admin/notes/${selectedCandidate}`)
      .then((res) => res.json())
      .then((data) => {
        setNotesList(data);
        if (data.length > 0) {
          setCandidateEmail(data[0].c_email);
        } else {
          // If no notes yet, still show candidate email
          const candidate = candidates.find((c) => c.c_id === selectedCandidate);
          setCandidateEmail(candidate ? candidate.c_email : "");
        }
      })
      .catch((err) => console.error(err));
  }, [selectedCandidate, candidates]);

  // 🔹 Save note + refresh notes
  const saveNote = async () => {
    if (!note.trim() || !selectedCandidate) return;

    try {
      await fetch("http://localhost:5000/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: selectedCandidate,
          note,
          admin_name: "Admin",
        }),
      });

      setNote(""); // clear input

      // Reload notes from DB
      const res = await fetch(
        `http://localhost:5000/api/admin/notes/${selectedCandidate}`
      );
      const data = await res.json();
      setNotesList(data);
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // 🔹 Delete note
  const deleteNote = async (note_id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/notes/${note_id}`, {
        method: "DELETE",
      });

      // Remove deleted note from state
      setNotesList((prev) => prev.filter((note) => note.note_id !== note_id));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div className="admin-notes-page">
      <h2>📝 Admin Notes</h2>

      <div className="note-form">
        <select
          value={selectedCandidate}
          onChange={(e) => setSelectedCandidate(e.target.value)}
        >
          <option value="">Select Candidate</option>
          {candidates.map((c) => (
            <option key={c.c_id} value={c.c_id}>
              {c.c_first_name} {c.c_last_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Candidate Email"
          value={candidateEmail}
          disabled
        />

        <textarea
          placeholder="Write admin reference notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button onClick={saveNote}>Save Note</button>
      </div>

      <div className="notes-history">
        <h4>Previous Notes</h4>

        {notesList.length === 0 && (
          <p style={{ opacity: 0.6 }}>No notes yet</p>
        )}

        {notesList.map((n) =>
          n.note ? (
            <div key={n.note_id} className="note-item">
              <p>{n.note}</p>
              <span>
                {n.admin_name} • {new Date(n.created_at).toLocaleString()}
              </span>
              <button
                className="delete-note-btn"
                onClick={() => deleteNote(n.note_id)}
              >
                Delete
              </button>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default AdminNotes;
