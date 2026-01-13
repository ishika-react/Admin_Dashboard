import { MdDashboard } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  // 🔵 FRONTEND-ONLY LOGOUT
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    // 🔴 CLEAR FRONTEND DATA ONLY
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    alert("Logged out successfully ✅");

    navigate("/login");
  };

  // 🔴 FULL SIGNOUT (BACKEND + FRONTEND) — UNCHANGED
  const handleSignOut = async () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (!confirmLogout) return;

    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout API failed:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    alert("Signed out successfully ✅");

    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <MdDashboard size={30} />
        <h2>Admin Dashboard</h2>
      </div>

      <div className="header-right">
            <span className="admin-greeting">Hi, Admin</span>
        {/* 🔵 LOGOUT BUTTON */}
         <button className="logout-btn" onClick={handleLogout}>
    <FiLogOut size={16} />
    <span>Logout</span>
  </button>

  {/* <button className="logout-btn" onClick={handleSignOut}>
    <FiLogOut size={16} />
    <span>Signout</span>
  </button> */}
      </div>
    </header>
  );
};

export default Header;
