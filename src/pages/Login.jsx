import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import
import "./Login.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // ✅ initialize

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = isSignup
      ? "http://localhost:5000/api/auth/signup"
      : "http://localhost:5000/api/auth/login";

    const bodyData = isSignup
      ? { username, email, password }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || "Something went wrong");
        return;
      }

      if (!isSignup) {
        // ✅ LOGIN SUCCESS
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        setMessage("Login successful ✅");
        console.log("JWT:", data.token);

        // ✅ redirect to candidates page
        navigate("/candidates");
      } else {
        // ✅ SIGNUP SUCCESS
        setMessage("Signup successful 🎉 Please login");
        setIsSignup(false);
      }
    } catch (error) {
      setMessage("Server error ❌");
    }
  };

  return (
    <div className="login-center-wrapper">
      <div className="login-box glass">
        <h3>{isSignup ? "Admin Signup" : "Admin Login"}</h3>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="toggle-text">
          {isSignup ? (
            <>
              Already have an account?
              <span onClick={() => setIsSignup(false)}> Login</span>
            </>
          ) : (
            <>
              Don’t have an account?
              <span onClick={() => setIsSignup(true)}> Sign up</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
