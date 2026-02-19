import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Droplets, Loader2, RotateCcw } from "lucide-react";
import gsap from "gsap";
import { verifyOtp, resendOtp } from "../../services/api";

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const cardRef = useRef(null);

    // Email passed via navigation state or query param
    const email =
        location.state?.email ||
        new URLSearchParams(location.search).get("email") ||
        "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
        inputRefs.current[0]?.focus();
    }, []);

    // Resend countdown
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length < 6) { setError("Please enter all 6 digits"); return; }
        setError(""); setLoading(true);
        try {
            await verifyOtp({ email, otp: otpString });
            setSuccess("Email verified! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1200);
        } catch (err) {
            setError(err.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setResending(true); setError(""); setSuccess("");
        try {
            await resendOtp({ email });
            setSuccess("OTP resent! Check your email.");
            setCountdown(60);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || "Failed to resend OTP.");
        } finally {
            setResending(false);
        }
    };

    const boxStyle = (filled) => ({
        width: 48, height: 56, border: `2px solid ${filled ? "#e53935" : "#e8e8e8"}`,
        borderRadius: 12, fontSize: 22, fontWeight: 800, textAlign: "center",
        color: "#111", background: filled ? "#fff5f5" : "#fafafa",
        outline: "none", transition: "border 0.2s, background 0.2s",
        caretColor: "#e53935",
    });

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

                {/* Card */}
                <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", padding: "36px 32px" }}>
                    {/* Icon */}
                    <div style={{ width: 56, height: 56, background: "#fff5f5", border: "2px solid #fdd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                        <span style={{ fontSize: 24 }}>📧</span>
                    </div>

                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 6px", textAlign: "center" }}>Verify Your Email</h1>
                    <p style={{ color: "#888", fontSize: 13, margin: "0 0 6px", textAlign: "center" }}>
                        We sent a 6-digit code to
                    </p>
                    <p style={{ color: "#e53935", fontSize: 14, fontWeight: 700, margin: "0 0 24px", textAlign: "center" }}>
                        {email || "your email"}
                    </p>

                    {/* Alerts */}
                    {error && (
                        <div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#e53935", fontSize: 13, fontWeight: 600 }}>
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: "#f0fff4", border: "1px solid #b2f5c8", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#22863a", fontSize: 13, fontWeight: 600 }}>
                            ✅ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* OTP boxes */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }} onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                                    onBlur={(e) => (e.target.style.borderColor = digit ? "#e53935" : "#e8e8e8")}
                                    style={boxStyle(!!digit)}
                                />
                            ))}
                        </div>

                        <button type="submit" disabled={loading}
                            style={{ width: "100%", padding: "14px", background: loading ? "#f08080" : "#e53935", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(229,57,53,0.3)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#b71c1c"; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#e53935"; }}
                        >
                            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Verifying...</> : "Verify Email"}
                        </button>
                    </form>

                    {/* Resend */}
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px" }}>Didn't receive the code?</p>
                        <button onClick={handleResend} disabled={countdown > 0 || resending}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: countdown > 0 ? "#bbb" : "#e53935", fontWeight: 700, fontSize: 13, cursor: countdown > 0 ? "not-allowed" : "pointer" }}>
                            <RotateCcw size={13} />
                            {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
