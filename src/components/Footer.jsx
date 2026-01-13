import { MdDashboard } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-left">
        <p>&copy; 2026 My Admin Dashboard</p>
      </div>
      <div className="footer-right">
        <button className="footer-btn">
          <MdDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button className="footer-btn">
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
