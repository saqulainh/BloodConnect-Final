import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function getPasswordStrength(password) {
    if (!password) return { label: "", level: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", level: 1 };
    if (score === 2) return { label: "Fair", level: 2 };
    if (score === 3) return { label: "Good", level: 3 };
    return { label: "Strong", level: 4 };
}

function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: "",
        email: "",
        dobYear: "",
        dobMonth: "",
        dobDay: "",
        donorId: "",
        firstName: "",
        lastName: "",
        zipCode: "",
        username: "",
        password: "",
        repeatPassword: "",
    });

    const [showBenefits, setShowBenefits] = useState(false);
    const [showWhyEmail, setShowWhyEmail] = useState(false);
    const [showDobHelp, setShowDobHelp] = useState(false);
    const [showDonorHelp, setShowDonorHelp] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const strength = getPasswordStrength(form.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.dobYear || !form.dobMonth || !form.dobDay) {
            setError("Please select your full date of birth.");
            return;
        }
        if (form.password !== form.repeatPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        try {
            const dob = `${form.dobYear}-${String(MONTHS.indexOf(form.dobMonth) + 1).padStart(2, "0")}-${String(form.dobDay).padStart(2, "0")}`;
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, dob }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Signup failed. Please try again.");
                return;
            }
            navigate("/login");
        } catch (err) {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">

                {/* Red Header Banner */}
                <div className="signup-header">
                    <h2 className="signup-title">Create My Account</h2>
                </div>

                <div className="signup-body">
                    {/* Account Benefits Toggle */}
                    <button
                        type="button"
                        className="toggle-link"
                        onClick={() => setShowBenefits(!showBenefits)}
                    >
                        {showBenefits ? "▲" : "+"} See Account Benefits
                    </button>
                    {showBenefits && (
                        <div className="info-panel">
                            <p>Create an account to easily schedule future appointments, manage existing appointments, see your blood type, view results of your mini-physical, and track donation history.</p>
                            <ul>
                                <li>📅 Schedule &amp; manage appointments</li>
                                <li>🩸 View your blood type</li>
                                <li>🏥 Mini-physical results</li>
                                <li>📋 Track donation history</li>
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="signup-form">

                        {/* Phone Number */}
                        <div className="field-block">
                            <label htmlFor="phone">
                                Phone Number <span className="req">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="Enter your 10-digit phone number"
                                value={form.phone}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                    }))
                                }
                                required
                            />
                        </div>

                        {/* Email (optional) */}
                        <div className="field-block">
                            <div className="field-label-row">
                                <label htmlFor="email">
                                    Email Address <span className="optional">(optional)</span>
                                </label>
                                <button type="button" className="inline-link" onClick={() => setShowWhyEmail(!showWhyEmail)}>
                                    + Why We Need to Know
                                </button>
                            </div>
                            {showWhyEmail && (
                                <p className="info-panel small">We use your email to send appointment confirmations, donation reminders, and important health updates.</p>
                            )}
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Date of Birth */}
                        <div className="field-block">
                            <div className="field-label-row">
                                <label>Date of Birth <span className="req">*</span></label>
                                <button type="button" className="inline-link" onClick={() => setShowDobHelp(!showDobHelp)}>
                                    + Why We Need to Know
                                </button>
                            </div>
                            {showDobHelp && (
                                <p className="info-panel small">Your date of birth can be found on your government-issued ID, passport, or birth certificate.</p>
                            )}
                            <div className="dob-row">
                                <div className="select-wrapper">
                                    <select name="dobYear" value={form.dobYear} onChange={handleChange} required>
                                        <option value="">Year</option>
                                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <span className="select-arrow">▾</span>
                                </div>
                                <div className="select-wrapper">
                                    <select name="dobMonth" value={form.dobMonth} onChange={handleChange} required>
                                        <option value="">Month</option>
                                        {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <span className="select-arrow">▾</span>
                                </div>
                                <div className="select-wrapper day-select">
                                    <select name="dobDay" value={form.dobDay} onChange={handleChange} required>
                                        <option value="">Day</option>
                                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <span className="select-arrow">▾</span>
                                </div>
                            </div>
                        </div>

                        {/* Donor ID */}
                        <div className="field-block">
                            <div className="field-label-row">
                                <label htmlFor="donorId">Donor ID (optional)</label>
                                <button type="button" className="inline-link" onClick={() => setShowDonorHelp(!showDonorHelp)}>
                                    Where do I find this?
                                </button>
                            </div>
                            {showDonorHelp && (
                                <p className="info-panel small">Your Donor ID is printed on your donor card or previous donation receipt.</p>
                            )}
                            <input
                                type="text"
                                id="donorId"
                                name="donorId"
                                placeholder="123ABC0"
                                value={form.donorId}
                                onChange={handleChange}
                            />
                        </div>

                        <hr className="divider" />

                        {/* First Name */}
                        <div className="field-block">
                            <label htmlFor="firstName">First Name <span className="req">*</span></label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div className="field-block">
                            <label htmlFor="lastName">Last Name <span className="req">*</span></label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* ZIP Code */}
                        <div className="field-block zip-field">
                            <label htmlFor="zipCode">ZIP Code <span className="req">*</span></label>
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={form.zipCode}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        zipCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                                    }))
                                }
                                required
                            />
                        </div>

                        <hr className="divider" />

                        {/* Username */}
                        <div className="field-block">
                            <label htmlFor="username">Username <span className="req">*</span></label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="field-block">
                            <label htmlFor="password">Password <span className="req">*</span></label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            {form.password && (
                                <div className="strength-row">
                                    <span className="strength-label-text">Strength:</span>
                                    <div className="strength-bar">
                                        {[1, 2, 3, 4].map((lvl) => (
                                            <div
                                                key={lvl}
                                                className={`strength-seg ${strength.level >= lvl ? `s-${strength.label.toLowerCase()}` : ""}`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`strength-word s-${strength.label.toLowerCase()}`}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Repeat Password */}
                        <div className="field-block">
                            <label htmlFor="repeatPassword">Repeat Password <span className="req">*</span></label>
                            <input
                                type="password"
                                id="repeatPassword"
                                name="repeatPassword"
                                value={form.repeatPassword}
                                onChange={handleChange}
                                required
                            />
                            {form.repeatPassword && form.password !== form.repeatPassword && (
                                <p className="field-error">Passwords do not match.</p>
                            )}
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <p className="req-note">*Required fields</p>

                        <button type="submit" className="signup-btn" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="signin-link">
                        Already Have An Account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
