import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from "lucide-react";
import { loginUser, isLoggedIn } from "../services/api";

const TYPEWRITER_LINES = [
    "Give Blood,\nSave Lives.",
    "Be a Hero,\nDonate Today.",
    "Your Drop,\nTheir Hope.",
    "Connect.\nDonate. Live.",
];

// ── Typewriter with fade ──────────────────────────────────────────────
function useTypewriter(lines, speed = 75, pause = 2200) {
    const [display, setDisplay] = useState("");
    const [lineIdx, setLineIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const current = lines[lineIdx];
        let timeout;
        if (!deleting && charIdx <= current.length) {
            if (charIdx === 0) setFading(false);
            timeout = setTimeout(() => {
                setDisplay(current.slice(0, charIdx));
                setCharIdx((c) => c + 1);
            }, speed);
        } else if (!deleting && charIdx > current.length) {
            timeout = setTimeout(() => {
                setFading(true);
                setTimeout(() => setDeleting(true), 350);
            }, pause);
        } else if (deleting && charIdx >= 0) {
            timeout = setTimeout(() => {
                setDisplay(current.slice(0, charIdx));
                setCharIdx((c) => c - 1);
            }, speed / 2.5);
        } else {
            setDeleting(false);
            setLineIdx((i) => (i + 1) % lines.length);
        }
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, lineIdx, lines, speed, pause]);

    return { display, fading };
}

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "", aadhaar: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { display: typed, fading } = useTypewriter(TYPEWRITER_LINES);

    useEffect(() => {
        if (isLoggedIn()) navigate("/dashboard");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await loginUser({ email: form.email, password: form.password, aadhaarLast4: form.aadhaar });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inp = {
        width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #eaeaea",
        borderRadius: 8, fontSize: 14, background: "#f7f8fa", outline: "none",
        boxSizing: "border-box", color: "#111", fontFamily: "inherit", transition: "border 0.2s, background 0.2s",
    };
    const onF = (e) => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; };
    const onB = (e) => { e.target.style.borderColor = "#eaeaea"; e.target.style.background = "#f7f8fa"; };
    const iconPos = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" };

    // Parse the typed text — split on \n for two-line display
    const lines = typed.split("\n");

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#fff" }}>

            {/* ── TOP NAV ── */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.02em", color: "#111" }}>
                    BLOOD<span style={{ color: "#e53935" }}>CONNECT</span>
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#111", letterSpacing: "0.05em" }}>MENU</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ width: 22, height: 2, background: "#111", borderRadius: 2 }} />
                        <div style={{ width: 22, height: 2, background: "#111", borderRadius: 2 }} />
                        <div style={{ width: 22, height: 2, background: "#111", borderRadius: 2 }} />
                    </div>
                </div>
            </div>

            {/* ── LEFT PANEL ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 64px 60px", background: "#fff" }}>

                {/* Typewriter headline */}
                <div style={{ marginBottom: 24, minHeight: 120 }}>
                    <h1 style={{ fontSize: "clamp(36px,4.5vw,58px)", fontWeight: 900, lineHeight: 1.1, margin: 0, opacity: fading ? 0 : 1, transition: "opacity 0.35s ease" }}>
                        {lines[0] && (
                            <span style={{ display: "block", color: "#111" }}>
                                {lines[0]}
                                {!lines[1] && (
                                    <span style={{ display: "inline-block", width: 4, height: "0.85em", background: "#e53935", marginLeft: 3, verticalAlign: "middle", animation: fading ? "none" : "blink 1s step-end infinite" }} />
                                )}
                            </span>
                        )}
                        {lines[1] !== undefined && (
                            <span style={{ display: "block", color: "#e53935" }}>
                                {lines[1]}
                                <span style={{ display: "inline-block", width: 4, height: "0.85em", background: "#e53935", marginLeft: 3, verticalAlign: "middle", animation: fading ? "none" : "blink 1s step-end infinite" }} />
                            </span>
                        )}
                    </h1>
                </div>

                <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 400, margin: "0 0 40px" }}>
                    Join the community of heroes. Your donation can save up to three lives. Securely login to manage your donations and history.
                </p>

                {/* New Donor card */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 14, padding: "16px 20px", maxWidth: 380, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", cursor: "pointer", transition: "box-shadow 0.2s" }}
                    onClick={() => navigate("/register")}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(229,57,53,0.12)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)")}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 40, height: 40, background: "#fff0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <User size={18} color="#e53935" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#111" }}>New Donor?</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Register today and start saving lives</p>
                        </div>
                    </div>
                    <span style={{ fontSize: 20, color: "#ccc", fontWeight: 300 }}>—</span>
                </div>
            </div>

            {/* ── RIGHT PANEL: Login Card ── */}
            <div style={{ width: 440, display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 40px 60px", background: "#fafafa" }}>
                <div style={{ width: "100%", background: "#fff", borderRadius: 18, boxShadow: "0 4px 32px rgba(0,0,0,0.09)", padding: "36px 32px" }}>

                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome Back</h2>
                    <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 24px" }}>Enter your credentials to access your account.</p>

                    {error && (
                        <div style={{ background: "#fff5f5", border: "1px solid #fdd", borderRadius: 8, padding: "9px 13px", marginBottom: 16, color: "#e53935", fontSize: 13, fontWeight: 600 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail size={14} style={iconPos} />
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="admin@gmail.com" style={inp} onFocus={onF} onBlur={onB} required />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock size={14} style={iconPos} />
                                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••" style={{ ...inp, paddingRight: 44 }} onFocus={onF} onBlur={onB} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb" }}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Aadhaar last 4 */}
                        <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                                Aadhaar Last 4 Digits
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock size={14} style={iconPos} />
                                <input type="text" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                                    placeholder="1234" maxLength={4} style={inp} onFocus={onF} onBlur={onB} required />
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#666", cursor: "pointer" }}>
                                <input type="checkbox" style={{ accentColor: "#e53935", width: 14, height: 14 }} />
                                Remember me
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: 13, color: "#e53935", fontWeight: 700, textDecoration: "none" }}>
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            style={{ width: "100%", padding: "13px", background: loading ? "#f08080" : "#e53935", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(229,57,53,0.3)", transition: "background 0.2s", marginTop: 4 }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#b71c1c"; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#e53935"; }}>
                            {loading
                                ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
                                : <>Sign In <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", margin: "18px 0 0" }}>
                        Don't have an account?{" "}
                        <Link to="/register" style={{ color: "#e53935", fontWeight: 800, textDecoration: "none" }}>Register Now</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    [data-left] { display: none !important; }
                }
            `}</style>
        </div>
    );
}
