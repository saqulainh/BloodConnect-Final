import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Droplets, Heart, ShieldCheck, Users, Activity, Shield } from "lucide-react";
import gsap from "gsap";
import { isLoggedIn } from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── Typewriter hook ────────────────────────────────────────────────────
const LINES = [
    "Give Blood,\nSave Lives.",
    "Be a Hero,\nDonate Today.",
    "Your Drop,\nTheir Hope.",
    "Connect.\nDonate. Live.",
];

function useTypewriter(lines, speed = 75, pause = 2200) {
    const [display, setDisplay] = useState("");
    const [lineIdx, setLineIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const current = lines[lineIdx];
        let t;
        if (!deleting && charIdx <= current.length) {
            if (charIdx === 0) setFading(false);
            t = setTimeout(() => { setDisplay(current.slice(0, charIdx)); setCharIdx(c => c + 1); }, speed);
        } else if (!deleting && charIdx > current.length) {
            t = setTimeout(() => { setFading(true); setTimeout(() => setDeleting(true), 400); }, pause);
        } else if (deleting && charIdx >= 0) {
            t = setTimeout(() => { setDisplay(current.slice(0, charIdx)); setCharIdx(c => c - 1); }, speed / 2.5);
        } else {
            setDeleting(false);
            setLineIdx(i => (i + 1) % lines.length);
        }
        return () => clearTimeout(t);
    }, [charIdx, deleting, lineIdx, lines, speed, pause]);

    return { display, fading };
}

// ── Trust badges ────────────────────────────────────────────────────────
const TRUST = [
    { icon: ShieldCheck, label: "Verified Donors", sub: "100% ID verified" },
    { icon: Users, label: "12,000+ Members", sub: "Across 320 cities" },
    { icon: Activity, label: "24/7 Active", sub: "Real-time matching" },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [useAadhaar, setUseAadhaar] = useState(false);
    const [aadhaarLast4, setAadhaarLast4] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { display: typed, fading } = useTypewriter(LINES);
    const cardRef = useRef(null);
    const leftRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn()) { navigate("/dashboard"); return; }

        const ctx = gsap.context(() => {
            gsap.fromTo(leftRef.current,
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 30, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out", delay: 0.2 }
            );
        });
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) { setError("Please enter your email and password."); return; }
        setError("");
        setLoading(true);
        try {
            await login({ email: form.email, password: form.password, aadhaarLast4: useAadhaar ? aadhaarLast4 : undefined });
            navigate("/dashboard");
        } catch (err) {
            console.error("Login caught error:", err);
            setError(err.message || err.response?.data?.message || err.toString() || "Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const lines = typed.split("\n");

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#fff" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* ── LEFT PANEL ── */}
            <div ref={leftRef} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 64px", background: "#fff", borderRight: "1px solid #f5f5f5", position: "relative", overflow: "hidden" }}>

                {/* Background Decorations */}
                <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(229,57,53,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, background: "radial-gradient(circle, rgba(229,57,53,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, background: "#e53935", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(229,57,53,0.35)" }}>
                        <Droplets size={22} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", color: "#111" }}>
                        Blood<span style={{ color: "#e53935" }}>Connect</span>
                    </span>
                </div>

                {/* Main content */}
                <div style={{ maxWidth: 480 }}>
                    {/* Typewriter Headline */}
                    <div style={{ marginBottom: 28, minHeight: 130 }}>
                        <h1 style={{ fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 900, lineHeight: 1.05, margin: 0, letterSpacing: "-0.04em", opacity: fading ? 0 : 1, transition: "opacity 0.35s ease" }}>
                            {lines[0] && (
                                <span style={{ display: "block", color: "#111" }}>
                                    {lines[0]}
                                    {!lines[1] && <span style={{ display: "inline-block", width: 4, height: "0.85em", background: "#e53935", marginLeft: 3, verticalAlign: "middle", animation: fading ? "none" : "blink 1s step-end infinite" }} />}
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

                    <p style={{ fontSize: 16, color: "#777", lineHeight: 1.7, marginBottom: 40, maxWidth: 400 }}>
                        Join thousands of verified donors. Your single donation can save up to <strong style={{ color: "#e53935" }}>three lives</strong> — start making a difference today.
                    </p>

                    {/* Trust badges */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {TRUST.map(({ icon: Icon, label, sub }) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 42, height: 42, background: "#fff5f5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={20} color="#e53935" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: 13.5, color: "#111" }}>{label}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Register CTA bottom */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 16, padding: "16px 20px", maxWidth: 440, cursor: "pointer", transition: "box-shadow 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                    onClick={() => navigate("/register")}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(229,57,53,0.12)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 40, height: 40, background: "#fff0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Heart size={18} color="#e53935" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 13.5, color: "#111" }}>New here? Register as a Donor</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Create your free account in 2 minutes</p>
                        </div>
                    </div>
                    <ArrowRight size={18} color="#ccc" />
                </div>
            </div>

            {/* ── RIGHT PANEL: Login Card ── */}
            <div style={{ width: 460, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 40px", background: "#fafafa" }}>
                <div ref={cardRef} style={{ width: "100%", background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", padding: "40px 36px" }}>

                    {/* Card Header */}
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #e53935, #b71c1c)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 6px 16px rgba(229,57,53,0.3)" }}>
                            <Droplets size={24} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111", margin: "0 0 6px", letterSpacing: "-0.03em" }}>Welcome Back</h2>
                        <p style={{ fontSize: 14, color: "#aaa", margin: 0, fontWeight: 500 }}>Sign in to your BloodConnect account</p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div style={{ background: "#fff5f5", border: "1.5px solid #fdd", borderRadius: 10, padding: "11px 14px", marginBottom: 20, color: "#e53935", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                        {/* Email */}
                        <div>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 7, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Email Address
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" }} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1.5px solid #eee", borderRadius: 10, fontSize: 14, background: "#f9f9f9", outline: "none", boxSizing: "border-box", color: "#111", fontFamily: "inherit", transition: "border 0.2s, background 0.2s" }}
                                    onFocus={e => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                                    onBlur={e => { e.target.style.borderColor = "#eee"; e.target.style.background = "#f9f9f9"; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                <label style={{ fontSize: 11, fontWeight: 800, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    Password
                                </label>
                                <Link to="/forgot-password" style={{ fontSize: 12, color: "#e53935", fontWeight: 700, textDecoration: "none" }}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <div style={{ position: "relative" }}>
                                <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" }} />
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={{ width: "100%", padding: "12px 44px 12px 42px", border: "1.5px solid #eee", borderRadius: 10, fontSize: 14, background: "#f9f9f9", outline: "none", boxSizing: "border-box", color: "#111", fontFamily: "inherit", transition: "border 0.2s, background 0.2s" }}
                                    onFocus={e => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                                    onBlur={e => { e.target.style.borderColor = "#eee"; e.target.style.background = "#f9f9f9"; }}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 4 }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* ── Aadhaar 2FA Toggle ── */}
                        <div>
                            <button type="button" onClick={() => { setUseAadhaar(!useAadhaar); setAadhaarLast4(""); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700,
                                    color: useAadhaar ? "#e53935" : "#888", background: useAadhaar ? "#fff5f5" : "#f9f9f9",
                                    border: `1.5px solid ${useAadhaar ? "#fdd" : "#eee"}`, borderRadius: 20,
                                    padding: "7px 14px", cursor: "pointer", transition: "all 0.2s"
                                }}>
                                <Shield size={14} />
                                {useAadhaar ? "Aadhaar Verification ON" : "Add Aadhaar Verification"}
                                <span style={{ marginLeft: "auto", width: 30, height: 16, background: useAadhaar ? "#e53935" : "#ddd", borderRadius: 8, position: "relative", display: "inline-flex", alignItems: "center", transition: "background 0.2s" }}>
                                    <span style={{ position: "absolute", left: useAadhaar ? 16 : 2, width: 12, height: 12, background: "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                                </span>
                            </button>

                            {useAadhaar && (
                                <div style={{ marginTop: 12 }}>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 7, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                        Aadhaar Last 4 Digits
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <ShieldCheck size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: aadhaarLast4.length === 4 ? "#22c55e" : "#e53935", pointerEvents: "none" }} />
                                        <input
                                            type="text" inputMode="numeric" maxLength={4}
                                            value={aadhaarLast4}
                                            onChange={e => setAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                            placeholder="Last 4 digits of Aadhaar"
                                            style={{ width: "100%", padding: "11px 14px 11px 42px", border: "1.5px solid #fdd", borderRadius: 10, fontSize: 15, background: "#fff8f8", outline: "none", boxSizing: "border-box", color: "#111", fontFamily: "monospace", letterSpacing: "0.2em", fontWeight: 800, transition: "border 0.2s" }}
                                            onFocus={e => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                                            onBlur={e => { e.target.style.borderColor = "#fdd"; e.target.style.background = "#fff8f8"; }}
                                        />
                                        {aadhaarLast4.length === 4 && (
                                            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 11, color: "#aaa", marginTop: 5, fontWeight: 500 }}>
                                        Extra security: enter the last 4 digits of your registered Aadhaar number.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Remember me */}
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#666", cursor: "pointer", fontWeight: 500 }}>
                            <input type="checkbox" style={{ accentColor: "#e53935", width: 15, height: 15 }} />
                            Keep me signed in
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "14px", marginTop: 4,
                                background: loading ? "#f08080" : "linear-gradient(135deg, #e53935, #b71c1c)",
                                color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 12,
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                boxShadow: loading ? "none" : "0 6px 20px rgba(229,57,53,0.35)",
                                transition: "all 0.2s", letterSpacing: "0.01em"
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 8px 28px rgba(229,57,53,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            {loading
                                ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
                                : <>Sign In <ArrowRight size={17} /></>
                            }
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
                        <span style={{ fontSize: 12, color: "#ccc", fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
                    </div>

                    <p style={{ textAlign: "center", fontSize: 13.5, color: "#aaa", margin: 0 }}>
                        Don't have an account?{" "}
                        <Link to="/register" style={{ color: "#e53935", fontWeight: 800, textDecoration: "none" }}>
                            Create one free →
                        </Link>
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
