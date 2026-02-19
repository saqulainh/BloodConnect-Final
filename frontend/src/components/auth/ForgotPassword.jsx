import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Droplets, Loader2, Mail } from "lucide-react";
import gsap from "gsap";
import { forgotPassword } from "../../services/api";

export default function ForgotPassword() {
    const cardRef = useRef(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            await forgotPassword({ email });
            setSent(true);
        } catch (err) {
            setError(err.message || "Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "12px 14px", border: "1.5px solid #e8e8e8",
        borderRadius: 10, fontSize: 14, background: "#fafafa", outline: "none",
        boxSizing: "border-box", transition: "border 0.2s",
    };

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

                    {sent ? (
                        /* Success state */
                        <div style={{ textAlign: "center" }}>
                            <div style={{ width: 64, height: 64, background: "#fff5f5", border: "2px solid #fdd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                <Mail size={28} color="#e53935" />
                            </div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 10px" }}>Check Your Email</h1>
                            <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
                                We've sent a password reset OTP to<br />
                                <strong style={{ color: "#111" }}>{email}</strong>
                            </p>
                            <Link to="/reset-password"
                                style={{ display: "block", width: "100%", padding: "13px", background: "#e53935", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: "pointer", textDecoration: "none", textAlign: "center", boxShadow: "0 4px 14px rgba(229,57,53,0.3)" }}>
                                Enter Reset Code →
                            </Link>
                            <p style={{ marginTop: 16, fontSize: 13, color: "#888" }}>
                                <Link to="/login" style={{ color: "#e53935", fontWeight: 700, textDecoration: "none" }}>← Back to Login</Link>
                            </p>
                        </div>
                    ) : (
                        /* Form state */
                        <>
                            <div style={{ width: 56, height: 56, background: "#fff5f5", border: "2px solid #fdd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                <span style={{ fontSize: 24 }}>🔐</span>
                            </div>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 6px", textAlign: "center" }}>Forgot Password?</h1>
                            <p style={{ color: "#888", fontSize: 13, margin: "0 0 24px", textAlign: "center" }}>
                                Enter your email and we'll send you a reset code.
                            </p>

                            {error && (
                                <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#e53935", fontSize: 13, fontWeight: 600 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 6 }}>Email Address</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
                                        required />
                                </div>

                                <button type="submit" disabled={loading}
                                    style={{ width: "100%", padding: "14px", background: loading ? "#f08080" : "#e53935", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(229,57,53,0.3)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#b71c1c"; }}
                                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#e53935"; }}
                                >
                                    {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending...</> : "Send Reset Code"}
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
