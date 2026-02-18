import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    alert("Login Successful ✅");
    // navigate("/dashboard");
  };

  return (
    <div className="login-container">

      {/* Floating Blood Drops */}
      <div className="blood-drop drop1"></div>
      <div className="blood-drop drop2"></div>
      <div className="blood-drop drop3"></div>

      <div className="login-wrapper">

        {/* LEFT SIDE */}
        <div className="login-left">
          <img
            src="/hospital-illustration.png"
            alt="Hospital"
            className="hospital-img"
          />
          <h2>Save Lives, Donate Blood</h2>
          <p>
            Connect with verified donors instantly and make a life-saving
            difference today.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">

          {/* Watermark */}
          <img
            src="/blood-logo.png"
            alt="Blood Logo"
            className="watermark-logo"
          />

          <div className="login-card">
            <h1>Blood Donor Login</h1>
            <p className="subtitle">
              Secure access to your donor dashboard
            </p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
              </div>

              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />{" "}
                  Remember me
                </label>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button type="submit" className="login-btn">
                Sign In
              </button>

              <p className="signup-text">
                Don't have an account?{" "}
                <Link to="/register">
                  <span>Register Now</span>
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;