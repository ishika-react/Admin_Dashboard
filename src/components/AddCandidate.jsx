import React, { useState } from "react";
import "./AddCandidate.css"

const AddCandidate = ({ onSuccess, onClose}) => {
  const [formData, setFormData] = useState({
    c_id: crypto.randomUUID(),
    c_first_name: "",
    c_last_name: "",
    c_email: "",
    c_contact_number: "",
    c_dob: "",
    c_sex: "M",
    c_college_name: "",
    c_branch: "",
    c_passing_year: "",
    c_cgpa: "",
    c_state: "",
    c_job_title: "",
    c_experience: "Fresher",
    c_experience_details: "",
    c_skills: "",
    time_slot: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const validateForm = () => {
  if (!formData.c_first_name.trim()) return "First name is required";
  if (!formData.c_last_name.trim()) return "Last name is required";
  if (!formData.c_email.includes("@")) return "Invalid email address";
  if (formData.c_cgpa < 0 || formData.c_cgpa > 10)
    return "CGPA must be between 0 and 10";
  if (!formData.time_slot) return "Time slot is required";
  return null;
};


const handleSubmit = async (e) => {
  e.preventDefault();

  const error = validateForm();
  if (error) {
    toast.error(error);
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error();

    toast.success("Candidate added successfully ✅");

    onSuccess(); // 🔥 auto refresh table

    setFormData({
 
      c_first_name: "",
      c_last_name: "",
      c_email: "",
      c_contact_number: "",
      c_dob: "",
      c_college_name: "",
      c_branch: "",
      c_passing_year: "",
      c_cgpa: "",
      c_state: "",
      c_job_title: "",
      c_experience_details: "",
      c_skills: "",
      time_slot: "",
    });

  } 
      catch (err) {
    toast.error("Failed to add candidate ❌");
  }
};

const addNote = async () => {
  if (!newNote.trim()) return;

  const res = await fetch("http://localhost:5000/api/admin-notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: candidateId,
      note: newNote,
      admin_name: "Admin",
    }),
  });

  if (res.ok) {
    setNewNote("");
    fetchNotes(); // reload saved notes
  }
};

  return (
    <form onSubmit={handleSubmit}>

        <button className="close-btn" type="button" onClick={onClose}>
  ✕
</button>

      <h2>Add Candidate</h2>

      <input name="c_first_name" placeholder="First Name" onChange={handleChange} required />
      <input name="c_last_name" placeholder="Last Name" onChange={handleChange} required />
      <input name="c_email" placeholder="Email" onChange={handleChange} required />
      <input name="c_contact_number" placeholder="Contact Number" onChange={handleChange} required />
      <input type="date" name="c_dob" onChange={handleChange} />
      
      <select name="c_sex" onChange={handleChange}>
        <option value="M">Male</option>
        <option value="F">Female</option>
        <option value="O">Other</option>
      </select>

      <input name="c_college_name" placeholder="College" onChange={handleChange} required />
      <input name="c_branch" placeholder="Branch" onChange={handleChange} required />
      <input name="c_passing_year" placeholder="Passing Year" onChange={handleChange} required />
      <input name="c_cgpa" placeholder="CGPA" onChange={handleChange} required />
      <input name="c_state" placeholder="State" onChange={handleChange} required />
      <input name="c_job_title" placeholder="Job Title" onChange={handleChange} />
      <input name="c_skills" placeholder="Skills" onChange={handleChange} />

      <select name="c_experience" onChange={handleChange}>
        <option>Fresher</option>
        <option>Intern</option>
        <option>1 year</option>
        <option>2 to 3 years</option>
      </select>

      <input
        type="datetime-local"
        name="time_slot"
        onChange={handleChange}
        required
      />

      <button type="submit">Add Candidate</button>
    </form>
  );
};

export default AddCandidate;
