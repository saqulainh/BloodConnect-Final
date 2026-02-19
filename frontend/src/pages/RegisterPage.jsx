import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Upload, Loader2, MapPin, ArrowRight, ArrowLeft, Check, User, Phone, Mail, Lock, Droplets } from "lucide-react";
import { registerUser, getCurrentLocation } from "../services/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const TYPEWRITER_LINES = [
    "Save a life today.",
    "Be someone's hero.",
    "Your blood. Their hope.",
    "Donate. Connect. Live.",
];

// ── File upload button — OUTSIDE Register to prevent remount on re-render ──────
const FileBtn = ({ field, label, maxKB, req, fileName, onFilePicked }) => {
    const inputRef = useRef(null);
    return (
        <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>
                {label}{req && <span style={{ color: "#e53935" }}> *</span>}
            </p>
            <div
                onClick={() => inputRef.current?.click()}
                style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                    border: `1.5px dashed ${fileName ? "#4caf50" : "#e0e0e0"}`,
                    borderRadius: 10, cursor: "pointer", background: fileName ? "#f1fff5" : "#fafafa",
                    fontSize: 13, color: fileName ? "#2e7d32" : "#bbb", transition: "all 0.2s", userSelect: "none",
                }}
                onMouseEnter={(e) => { if (!fileName) e.currentTarget.style.borderColor = "#e53935"; }}
                onMouseLeave={(e) => { if (!fileName) e.currentTarget.style.borderColor = "#e0e0e0"; }}
            >
                <Upload size={14} color={fileName ? "#4caf50" : "#e53935"} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: fileName ? 600 : 400 }}>
                    {fileName || `Click to upload ${label}`}
                </span>
                {fileName && <span style={{ fontSize: 16 }}>✓</span>}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files[0];
                        if (!f) return;
                        if (f.size > maxKB * 1024) {
                            alert(`File must be under ${maxKB}KB. Your file: ${(f.size / 1024).toFixed(0)}KB`);
                            e.target.value = "";
                            return;
                        }
                        onFilePicked(field, f);
                    }}
                />
            </div>
        </div>
    );
};

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(lines, speed = 70, pause = 1800) {
    const [display, setDisplay] = useState("");
    const [lineIdx, setLineIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const current = lines[lineIdx];
        let timeout;
        if (!deleting && charIdx <= current.length) {
            // Fade in when starting a new line
            if (charIdx === 0) setFading(false);
            timeout = setTimeout(() => { setDisplay(current.slice(0, charIdx)); setCharIdx((c) => c + 1); }, speed);
        } else if (!deleting && charIdx > current.length) {
            timeout = setTimeout(() => { setFading(true); setTimeout(() => setDeleting(true), 300); }, pause);
        } else if (deleting && charIdx >= 0) {
            timeout = setTimeout(() => { setDisplay(current.slice(0, charIdx)); setCharIdx((c) => c - 1); }, speed / 2);
        } else {
            setDeleting(false);
            setLineIdx((i) => (i + 1) % lines.length);
        }
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, lineIdx, lines, speed, pause]);

    return { display, fading };
}

// ── Step bar ──────────────────────────────────────────────────────────────────
const StepBar = ({ step }) => {
    const steps = ["Personal Info", "Identity", "Password"];
    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
            {steps.map((label, i) => (
                <React.Fragment key={i}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: 13, transition: "all 0.3s",
                            background: i <= step ? "#e53935" : "#f0f0f0",
                            color: i <= step ? "#fff" : "#aaa",
                            boxShadow: i === step ? "0 0 0 4px rgba(229,57,53,0.15)" : "none",
                        }}>
                            {i < step ? <Check size={14} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: i <= step ? "#e53935" : "#bbb", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ flex: 1, height: 2, margin: "0 8px", marginBottom: 20, background: i < step ? "#e53935" : "#f0f0f0", transition: "background 0.4s" }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ── Main Register component ───────────────────────────────────────────────────
export default function Register() {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        name: "", email: "", phone: "", bloodGroup: "", address: "",
        role: "donor", aadhaarNumber: "", password: "", confirmPassword: "",
    });
    const [files, setFiles] = useState({ aadhaarImage: null, medicalCertificate: null, profilePicture: null });
    const [fileNames, setFileNames] = useState({ aadhaarImage: "", medicalCertificate: "", profilePicture: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [gpsStatus, setGpsStatus] = useState("");
    const [coords, setCoords] = useState(null);
    const { display: typed, fading } = useTypewriter(TYPEWRITER_LINES);

    useEffect(() => { fetchGps(); }, []);

    const fetchGps = async () => {
        setGpsStatus("fetching");
        try { const loc = await getCurrentLocation(); setCoords(loc); setGpsStatus("ok"); }
        catch { setGpsStatus("denied"); }
    };

    // Called by FileBtn when a valid file is picked
    const handleFilePicked = (field, file) => {
        setFiles((p) => ({ ...p, [field]: file }));
        setFileNames((p) => ({ ...p, [field]: file.name }));
        setError("");
    };

    const slideIn = (dir) => {
        if (!formRef.current) return;
        formRef.current.style.opacity = "0";
        formRef.current.style.transform = `translateX(${dir > 0 ? 30 : -30}px)`;
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.style.transition = "all 0.3s ease";
                formRef.current.style.opacity = "1";
                formRef.current.style.transform = "translateX(0)";
            }
        }, 20);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "aadhaarNumber") setForm({ ...form, aadhaarNumber: value.replace(/\D/g, "").slice(0, 12) });
        else if (name === "phone") setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 10) });
        else setForm({ ...form, [name]: value });
    };

    const validate = () => {
        setError("");
        if (step === 0) {
            if (!form.name.trim()) { setError("Full name is required"); return false; }
            if (!form.email.includes("@")) { setError("Valid email is required"); return false; }
            if (form.phone.length < 10) { setError("Enter valid 10-digit phone number"); return false; }
            if (!form.bloodGroup) { setError("Please select your blood group"); return false; }
        }
        if (step === 1) {
            if (form.aadhaarNumber.length !== 12) { setError("Enter valid 12-digit Aadhaar number"); return false; }
            if (!files.aadhaarImage) { setError("Aadhaar card image is required"); return false; }
        }
        if (step === 2) {
            if (form.password.length < 6) { setError("Password must be at least 6 characters"); return false; }
            if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
        }
        return true;
    };

    const goNext = () => { if (!validate()) return; slideIn(1); setStep((s) => s + 1); };
    const goPrev = () => { setError(""); slideIn(-1); setStep((s) => s - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
            if (coords) { fd.append("lat", coords.lat); fd.append("lng", coords.lng); }
            fd.append("aadhaarImage", files.aadhaarImage);
            if (files.medicalCertificate) fd.append("medicalCertificate", files.medicalCertificate);
            if (files.profilePicture) fd.append("profilePicture", files.profilePicture);
            await registerUser(fd);
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = {
        width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #ebebeb",
        borderRadius: 10, fontSize: 13.5, background: "#fafafa", outline: "none",
        boxSizing: "border-box", color: "#111", fontFamily: "inherit", transition: "border 0.2s",
    };
    const lbl = { fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase", display: "block" };
    const onF = (e) => (e.target.style.borderColor = "#e53935");
    const onB = (e) => (e.target.style.borderColor = "#ebebeb");
    const iconStyle = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" };

    const STEP_TITLES = ["Personal Info", "Identity & Documents", "Set Password"];
    const STEP_SUBS = ["Tell us about yourself", "Secure identity verification", "Create your account password"];

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f7f7f9" }}>

            {/* ── LEFT PANEL ── */}
            <div style={{ width: 360, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 44px", borderRight: "1px solid #f0f0f0", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
                    <div style={{ width: 38, height: 38, background: "#e53935", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Droplets size={20} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 17, color: "#111", letterSpacing: "-0.02em" }}>
                        Blood<span style={{ color: "#e53935" }}>Connect</span>
                    </span>
                </div>

                <div style={{ marginBottom: 36 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111", lineHeight: 1.2, margin: "0 0 8px", letterSpacing: "-0.03em", minHeight: 80, opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
                        {typed}
                        <span style={{ display: "inline-block", width: 3, height: "0.85em", background: "#e53935", marginLeft: 3, verticalAlign: "middle", animation: fading ? "none" : "blink 1s step-end infinite" }} />
                    </h1>
                    <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, margin: 0 }}>
                        Join thousands of verified donors.<br />Every registration saves a life.
                    </p>
                </div>

                {[
                    { icon: "🔒", title: "AES-256 Encrypted", desc: "Aadhaar never stored in plaintext." },
                    { icon: "📍", title: "Geo Matching", desc: "Matched with donors within 5km." },
                    { icon: "⚡", title: "Instant Alerts", desc: "Real-time Pusher notifications." },
                ].map(({ icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
                        <div style={{ width: 36, height: 36, background: "#fff5f5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                            {icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "#222" }}>{title}</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 32px", overflowY: "auto" }}>
                <div style={{ width: "100%", maxWidth: 520 }}>
                    <StepBar step={step} />

                    <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,0.07)", padding: "36px 36px 28px" }}>
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{STEP_TITLES[step]}</h2>
                            <p style={{ fontSize: 12, color: "#bbb", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{STEP_SUBS[step]}</p>
                        </div>

                        {error && (
                            <div style={{ background: "#fff5f5", border: "1px solid #fdd", borderRadius: 9, padding: "9px 14px", marginBottom: 18, color: "#e53935", fontSize: 13, fontWeight: 600 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div ref={formRef}>
                            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}>

                                {/* ── STEP 0: Personal Info ── */}
                                {step === 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <div>
                                            <label style={lbl}>I am a</label>
                                            <div style={{ display: "flex", background: "#f4f4f6", borderRadius: 10, padding: 4, gap: 4 }}>
                                                {[{ val: "donor", label: "🩸 Donor" }, { val: "receiver", label: "🏥 Receiver" }].map(({ val, label }) => (
                                                    <button key={val} type="button" onClick={() => setForm({ ...form, role: val })}
                                                        style={{
                                                            flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                                                            background: form.role === val ? "#e53935" : "transparent",
                                                            color: form.role === val ? "#fff" : "#999",
                                                            boxShadow: form.role === val ? "0 2px 8px rgba(229,57,53,0.25)" : "none",
                                                        }}>
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label style={lbl}>Full Name <span style={{ color: "#e53935" }}>*</span></label>
                                            <div style={{ position: "relative" }}>
                                                <User size={14} style={iconStyle} />
                                                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" style={fieldStyle} onFocus={onF} onBlur={onB} />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div>
                                                <label style={lbl}>Email <span style={{ color: "#e53935" }}>*</span></label>
                                                <div style={{ position: "relative" }}>
                                                    <Mail size={14} style={iconStyle} />
                                                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" style={fieldStyle} onFocus={onF} onBlur={onB} />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={lbl}>Phone <span style={{ color: "#e53935" }}>*</span></label>
                                                <div style={{ position: "relative" }}>
                                                    <Phone size={14} style={iconStyle} />
                                                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit" maxLength={10} style={fieldStyle} onFocus={onF} onBlur={onB} />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12 }}>
                                            <div>
                                                <label style={lbl}>Blood Group <span style={{ color: "#e53935" }}>*</span></label>
                                                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                                                    style={{ ...fieldStyle, paddingLeft: 14, appearance: "none", cursor: "pointer" }} onFocus={onF} onBlur={onB}>
                                                    <option value="">Select</option>
                                                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={lbl}>City / Address</label>
                                                <input name="address" type="text" value={form.address} onChange={handleChange} placeholder="Mumbai, Maharashtra"
                                                    style={{ ...fieldStyle, paddingLeft: 14 }} onFocus={onF} onBlur={onB} />
                                            </div>
                                        </div>

                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                            background: gpsStatus === "ok" ? "#f0fff4" : gpsStatus === "denied" ? "#fff5f5" : "#fffbf0",
                                            color: gpsStatus === "ok" ? "#2e7d32" : gpsStatus === "denied" ? "#e53935" : "#92400e",
                                            border: `1px solid ${gpsStatus === "ok" ? "#b2f5c8" : gpsStatus === "denied" ? "#fcc" : "#fef3c7"}`,
                                        }}>
                                            <MapPin size={11} />
                                            {gpsStatus === "fetching" && "Getting location for geo-matching..."}
                                            {gpsStatus === "ok" && "Location captured ✓ — you'll appear in nearby searches"}
                                            {gpsStatus === "denied" && <span>Location denied — <button onClick={fetchGps} type="button" style={{ background: "none", border: "none", color: "#e53935", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12 }}>Retry</button></span>}
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 1: Identity & Documents ── */}
                                {step === 1 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <div>
                                            <label style={lbl}>Aadhaar Number <span style={{ color: "#e53935" }}>*</span></label>
                                            <input name="aadhaarNumber" type="text" value={form.aadhaarNumber} onChange={handleChange}
                                                placeholder="12-digit Aadhaar (AES-256 encrypted)" maxLength={12}
                                                style={{ ...fieldStyle, paddingLeft: 14 }} onFocus={onF} onBlur={onB} />
                                            <p style={{ fontSize: 11, color: "#ccc", margin: "4px 0 0" }}>🔒 Encrypted before storage — never stored in plaintext</p>
                                        </div>

                                        <FileBtn
                                            field="aadhaarImage" label="Aadhaar Card Photo" maxKB={150} req
                                            fileName={fileNames.aadhaarImage} onFilePicked={handleFilePicked}
                                        />

                                        {form.role === "donor" && (
                                            <FileBtn
                                                field="medicalCertificate" label="Medical Certificate (optional)" maxKB={500}
                                                fileName={fileNames.medicalCertificate} onFilePicked={handleFilePicked}
                                            />
                                        )}

                                        <FileBtn
                                            field="profilePicture" label="Profile Picture (optional)" maxKB={200}
                                            fileName={fileNames.profilePicture} onFilePicked={handleFilePicked}
                                        />
                                    </div>
                                )}

                                {/* ── STEP 2: Password ── */}
                                {step === 2 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <div style={{ background: "#fafafa", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 42, height: 42, background: "#e53935", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <span style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>{form.bloodGroup || "?"}</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#111" }}>{form.name}</p>
                                                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{form.email} · {form.role === "donor" ? "Donor 🩸" : "Receiver 🏥"}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={lbl}>Secure Password <span style={{ color: "#e53935" }}>*</span></label>
                                            <div style={{ position: "relative" }}>
                                                <Lock size={14} style={iconStyle} />
                                                <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handleChange}
                                                    placeholder="Min 6 characters" style={{ ...fieldStyle, paddingRight: 44 }} onFocus={onF} onBlur={onB} />
                                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>
                                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={lbl}>Confirm Password <span style={{ color: "#e53935" }}>*</span></label>
                                            <div style={{ position: "relative" }}>
                                                <Lock size={14} style={iconStyle} />
                                                <input name="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={handleChange}
                                                    placeholder="Repeat password"
                                                    style={{ ...fieldStyle, paddingRight: 44, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "#e53935" : "#ebebeb" }}
                                                    onFocus={onF} onBlur={onB} />
                                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>
                                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                                    {step > 0 && (
                                        <button type="button" onClick={goPrev}
                                            style={{ padding: "12px 20px", background: "#f4f4f6", color: "#555", fontWeight: 700, fontSize: 14, border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f4f4f6")}>
                                            <ArrowLeft size={15} /> Back
                                        </button>
                                    )}
                                    <button type="submit" disabled={loading}
                                        style={{ flex: 1, padding: "12px", background: loading ? "#f08080" : "#111", color: "#fff", fontWeight: 800, fontSize: 14, border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
                                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#e53935"; }}
                                        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#111"; }}>
                                        {loading
                                            ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</>
                                            : step < 2 ? <>Next Step <ArrowRight size={15} /></> : <><Check size={15} /> Create Account</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <p style={{ textAlign: "center", fontSize: 13, color: "#bbb", marginTop: 20 }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#e53935", fontWeight: 800, textDecoration: "none" }}>Sign in instead</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
        </div>
    );
}
