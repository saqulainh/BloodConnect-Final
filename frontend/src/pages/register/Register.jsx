import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        aadhaar: "",
        role: "Donor",
        password: "",
        confirmPassword: "",
        file: null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            const selected = files[0];
            if (selected && selected.size > 150 * 1024) {
                alert("File size must be under 150KB ❌");
                e.target.value = "";
                return;
            }
            setFormData({ ...formData, file: selected });
        } else if (name === "aadhaar") {
            setFormData({ ...formData, aadhaar: value.replace(/\D/g, "").slice(0, 12) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match ❌");
            return;
        }
        if (formData.aadhaar.length !== 12) {
            alert("Please enter a valid 12-digit Aadhaar number ❌");
            return;
        }

        alert("Registration Successful ✅");
        navigate("/login");
    };

    return (
        <div className="register-container">

            {/* Floating Blood Drops */}
            <div className="blood-drop drop1"></div>
            <div className="blood-drop drop2"></div>
            <div className="blood-drop drop3"></div>

            <div className="register-wrapper">

                {/* LEFT SIDE */}
                <div className="register-left">
                    <img
                        src="/hospital-illustration.png"
                        alt="Hospital"
                        className="hospital-img"
                    />
                    <h2>Join the Blood Donor Community</h2>
                    <p>Register today and help save lives across the country.</p>
                </div>

                {/* RIGHT SIDE */}
                <div className="register-right">

                    <img
                        src="/blood-logo.png"
                        alt="Blood Logo"
                        className="watermark-logo"
                    />

                    <div className="register-card">
                        <h1>Create Account</h1>
                        <p className="subtitle">Fill in your details below</p>

                        <form onSubmit={handleSubmit}>

                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Full Aadhaar Number</label>
                                <input
                                    type="text"
                                    name="aadhaar"
                                    placeholder="Enter 12-digit Aadhaar number"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    maxLength="12"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Upload Aadhaar Card <span className="file-note">(Max 150KB — image or PDF)</span></label>
                                <input
                                    type="file"
                                    name="file"
                                    accept="image/*,.pdf"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Role</label>
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="Donor">Donor</option>
                                    <option value="Receiver">Receiver</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </span>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Confirm Password</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="toggle-password"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                    >
                                        {showConfirm ? "Hide" : "Show"}
                                    </span>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mismatch-error">Passwords do not match</p>
                                )}
                            </div>

                            <button type="submit" className="register-btn">
                                Sign Up
                            </button>

                            <p className="login-text">
                                Already have an account?{" "}
                                <span onClick={() => navigate("/login")}>Login</span>
                            </p>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
