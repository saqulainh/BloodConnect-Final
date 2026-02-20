import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, RotateCcw, ArrowRight, Check, Droplets, ShieldCheck } from "lucide-react";
import { verifyOtp, resendOtp } from "../services/api";

export default function OtpVerifyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [shake, setShake] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Focus first box on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (idx, val) => {
        // Accept only digits
        const digit = val.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[idx] = digit;
        setOtp(next);
        setError("");
        // Auto-advance
        if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
        // Auto-submit when all 6 filled
        if (digit && idx === 5) {
            const fullOtp = [...next].join("");
            if (fullOtp.length === 6) submit(fullOtp);
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace") {
            if (otp[idx]) {
                const next = [...otp]; next[idx] = ""; setOtp(next);
            } else if (idx > 0) {
                const next = [...otp]; next[idx - 1] = ""; setOtp(next);
                inputRefs.current[idx - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
        if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const arr = pasted.split("");
            setOtp(arr);
            inputRefs.current[5]?.focus();
            submit(pasted);
        }
        e.preventDefault();
    };

    const submit = async (code) => {
        if (!email) { setError("No email found. Please register again."); return; }
        setLoading(true);
        setError("");
        try {
            const data = await verifyOtp({ email, otp: code || otp.join("") });
            setSuccess("Account verified! Redirecting…");
            setTimeout(() => navigate("/dashboard"), 1200);
        } catch (err) {
            setShake(true);
            setError(err.message || "Invalid OTP. Please try again.");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setTimeout(() => setShake(false), 700);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResending(true);
        setError("");
        try {
            await resendOtp({ email });
            setCountdown(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || "Failed to resend OTP.");
        } finally {
            setResending(false);
        }
    };

    const filled = otp.filter(Boolean).length;

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fff5f5 0%,#fff 60%)", fontFamily: "'Inter','Segoe UI',sans-serif", padding: 24 }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 28, boxShadow: "0 12px 50px rgba(0,0,0,0.08)", overflow: "hidden" }}>

                {/* Header */}
                <div style={{ background: "linear-gradient(135deg,#e53935,#b71c1c)", padding: "36px 36px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, background: "rgba(0,0,0,0.08)", borderRadius: "50%" }} />
                    <div style={{ position: "relative" }}>
                        <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <ShieldCheck size={28} color="#fff" />
                        </div>
                        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Verify Your Email</h1>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13.5, margin: 0 }}>We've sent a 6-digit code to</p>
                        <p style={{ color: "#fff", fontSize: 14, fontWeight: 800, margin: "4px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <Mail size={14} /> {email || "your email"}
                        </p>
                    </div>
                </div>

                <div style={{ padding: "32px 36px" }}>

                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
                        <Droplets size={16} color="#e53935" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#e53935", letterSpacing: "0.02em" }}>BloodConnect</span>
                    </div>

                    {/* OTP Boxes */}
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, animation: shake ? "shake 0.5s ease" : "none" }}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text" inputMode="numeric"
                                value={digit} maxLength={1}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                style={{
                                    width: 46, height: 54, textAlign: "center", fontSize: 22, fontWeight: 900,
                                    border: digit ? "2px solid #e53935" : "1.5px solid #e8e8e8",
                                    borderRadius: 12, outline: "none", background: digit ? "#fff5f5" : "#fafafa",
                                    color: "#e53935", fontFamily: "monospace", cursor: "text",
                                    transition: "all 0.15s", caretColor: "transparent"
                                }}
                                onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(229,57,53,0.15)"}
                                onBlur={e => e.target.style.boxShadow = "none"}
                            />
                        ))}
                    </div>

                    {/* Progress indicator */}
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 6 }}>
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ width: 28, height: 3, borderRadius: 3, background: i < filled ? "#e53935" : "#f0f0f0", transition: "background 0.2s" }} />
                            ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{filled}/6 digits entered</p>
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <div style={{ background: "#fff5f5", border: "1.5px solid #fdd", borderRadius: 10, padding: "11px 14px", marginBottom: 18, color: "#e53935", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                            ⚠️ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: "#f0fff4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "11px 14px", marginBottom: 18, color: "#15803d", fontSize: 13, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <Check size={15} strokeWidth={3} /> {success}
                        </div>
                    )}

                    {/* Manual verify button */}
                    <button
                        onClick={() => submit(otp.join(""))}
                        disabled={loading || filled < 6}
                        style={{
                            width: "100%", padding: "14px",
                            background: filled < 6 || loading ? "#f5f5f5" : "linear-gradient(135deg,#e53935,#b71c1c)",
                            color: filled < 6 || loading ? "#ccc" : "#fff",
                            fontWeight: 800, fontSize: 15, border: "none", borderRadius: 12,
                            cursor: filled < 6 || loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.2s", boxShadow: filled === 6 && !loading ? "0 5px 18px rgba(229,57,53,0.3)" : "none"
                        }}>
                        {loading
                            ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: filled < 6 ? "#ccc" : "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Verifying...</>
                            : <>Verify Account <ArrowRight size={17} /></>
                        }
                    </button>

                    {/* Resend */}
                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <p style={{ fontSize: 13.5, color: "#aaa", margin: "0 0 10px" }}>Didn't receive the code?</p>
                        <button onClick={handleResend} disabled={!canResend || resending}
                            style={{ background: "none", border: "none", cursor: canResend ? "pointer" : "default", fontSize: 13.5, fontWeight: 800, color: canResend ? "#e53935" : "#bbb", display: "flex", alignItems: "center", gap: 6, margin: "0 auto", padding: 0, transition: "color 0.2s" }}>
                            <RotateCcw size={14} style={{ animation: resending ? "spin 1s linear infinite" : "none" }} />
                            {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
                        </button>
                    </div>

                    <div style={{ borderTop: "1px solid #f5f5f5", marginTop: 24, paddingTop: 18, textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>
                            Wrong email?{" "}
                            <span onClick={() => navigate("/register")} style={{ color: "#e53935", fontWeight: 800, cursor: "pointer" }}>
                                Register again
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%       { transform: translateX(-8px); }
                    40%       { transform: translateX(8px); }
                    60%       { transform: translateX(-6px); }
                    80%       { transform: translateX(6px); }
                }
            `}</style>
        </div>
    );
}
