import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, Eye, EyeOff, Loader2 } from "lucide-react";
import gsap from "gsap";
import { resetPassword } from "../lib/api";

export default function ResetPassword() {
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match"); return; }
        if (form.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await resetPassword({ email: form.email, otp: form.otp, newPassword: form.newPassword });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.message || "Reset failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "12px 14px", border: "1.5px solid #e8e8e8",
        borderRadius: 10, fontSize: 14, background: "#fafafa", outline: "none",
        boxSizing: "border-box", transition: "border 0.2s",
    };
    const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 };
    const onFocus = (e) => (e.target.style.borderColor = "#e53935");
    const onBlur = (e) => (e.target.style.borderColor = "#e8e8e8");

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
            <div ref={cardRef} style={{ width: "100%", maxWidth: 420 }}>

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
                    <div style={{ width: 36, height: 36, background: "#e53935", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Droplets size={18} color="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 17, color: "#111" }}>Blood Connect</span>
                </div>

                <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", padding: "36px 32px" }}>

                    {success ? (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 8px" }}>Password Reset!</h2>
                            <p style={{ color: "#888", fontSize: 14 }}>Redirecting to login...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: 56, height: 56, background: "#fff5f5", border: "2px solid #fdd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                <span style={{ fontSize: 24 }}>🔑</span>
                            </div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 6px", textAlign: "center" }}>Reset Password</h1>
                            <p style={{ color: "#888", fontSize: 13, margin: "0 0 24px", textAlign: "center" }}>Enter the OTP from your email and your new password.</p>

                            {error && (
                                <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#e53935", fontSize: 13, fontWeight: 600 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="Your registered email" style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                                </div>

                                <div>
                                    <label style={labelStyle}>OTP Code</label>
                                    <input type="text" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                                        placeholder="6-digit code" maxLength={6} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                                </div>

                                <div>
                                    <label style={labelStyle}>New Password</label>
                                    <div style={{ position: "relative" }}>
                                        <input type={showPwd ? "text" : "password"} value={form.newPassword}
                                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                            placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: 44 }} onFocus={onFocus} onBlur={onBlur} required />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Confirm Password</label>
                                    <input type="password" value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder="Repeat new password" style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                                    {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                                        <p style={{ color: "#e53935", fontSize: 12, marginTop: 4 }}>Passwords do not match</p>
                                    )}
                                </div>

                                <button type="submit" disabled={loading}
                                    style={{ width: "100%", padding: "14px", background: loading ? "#f08080" : "#e53935", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(229,57,53,0.3)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}
                                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#b71c1c"; }}
                                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#e53935"; }}
                                >
                                    {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Resetting...</> : "Reset Password"}
                                </button>
                            </form>

                            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
                                <Link to="/login" style={{ color: "#e53935", fontWeight: 700, textDecoration: "none" }}>← Back to Login</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
