import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const AuthPage = () => {
  return (
    <div style={{ flex: 1 }}>
      <Routes>
        {/* Default → Login */}
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Routes>
    </div>
  );
};

export default AuthPage;
