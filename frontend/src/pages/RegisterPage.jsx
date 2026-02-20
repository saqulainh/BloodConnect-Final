import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, Droplets, ChevronRight, ChevronLeft,
    ShieldCheck, Camera, FileText, MapPin, Lock, Eye, EyeOff,
    Check, AlertCircle, Upload, X
} from "lucide-react";
import { registerUser, getCurrentLocation } from "../services/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STEPS = [
    { id: 0, label: "Personal Info", icon: User },
    { id: 1, label: "Aadhaar", icon: ShieldCheck },
    { id: 2, label: "Documents", icon: FileText },
    { id: 3, label: "Password", icon: Lock },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatAadhaar = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const isValidAadhaar = (num) => {
    const clean = num.replace(/\s/g, "");
    return /^[2-9]\d{11}$/.test(clean);
};

const maskAadhaar = (num) => {
    const clean = num.replace(/\s/g, "");
    if (clean.length < 4) return clean;
    return "XXXX XXXX " + clean.slice(-4);
};

const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score; // 0–5
};

const STRENGTH_LABELS = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label = ({ children }) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#888", marginBottom: 7, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {children}
    </label>
);

const InputWrap = ({ icon: Icon, children }) => (
    <div style={{ position: "relative" }}>
        {Icon && <Icon size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none", zIndex: 1 }} />}
        {children}
    </div>
);

const inputStyle = (hasIcon = true) => ({
    width: "100%", padding: `12px 14px 12px ${hasIcon ? "42px" : "14px"}`,
    border: "1.5px solid #eee", borderRadius: 10, fontSize: 14,
    background: "#f9f9f9", outline: "none", boxSizing: "border-box",
    color: "#111", fontFamily: "inherit", transition: "border 0.2s, background 0.2s"
});

function InputField({ icon: Icon, label, ...props }) {
    return (
        <div>
            {label && <Label>{label}</Label>}
            <InputWrap icon={Icon}>
                <input {...props} style={inputStyle(!!Icon)}
                    onFocus={e => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#eee"; e.target.style.background = "#f9f9f9"; }}
                />
            </InputWrap>
        </div>
    );
}

// ─── StepBar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
            {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                    <React.Fragment key={s.id}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: done ? "#e53935" : active ? "#fff" : "#f5f5f5",
                                border: active ? "2.5px solid #e53935" : done ? "none" : "1.5px solid #e8e8e8",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.3s"
                            }}>
                                {done
                                    ? <Check size={16} color="#fff" strokeWidth={3} />
                                    : <s.icon size={15} color={active ? "#e53935" : "#ccc"} />
                                }
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: active ? "#e53935" : done ? "#555" : "#bbb", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: done ? "#e53935" : "#f0f0f0", margin: "0 6px", marginBottom: 22, transition: "background 0.4s" }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── FileUpload ───────────────────────────────────────────────────────────────
function FileUpload({ label, accept, onChange, preview, hint }) {
    const ref = useRef(null);
    return (
        <div>
            <Label>{label}</Label>
            <div
                onClick={() => ref.current.click()}
                style={{
                    border: preview ? "1.5px solid #e53935" : "1.5px dashed #ddd",
                    borderRadius: 12, padding: 16, cursor: "pointer",
                    background: preview ? "#fff5f5" : "#fafafa",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.2s"
                }}
                onMouseEnter={e => { if (!preview) e.currentTarget.style.borderColor = "#e53935"; e.currentTarget.style.background = "#fff8f8"; }}
                onMouseLeave={e => { if (!preview) e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.background = preview ? "#fff5f5" : "#fafafa"; }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="preview" style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1.5px solid #fdd" }} />
                        <div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#e53935" }}>✓ File selected</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Click to change</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ width: 40, height: 40, background: "#fff0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Upload size={18} color="#e53935" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#555" }}>Click to upload</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{hint || "JPG, PNG or PDF"}</p>
                        </div>
                    </>
                )}
            </div>
            <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={onChange} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [gpsStatus, setGpsStatus] = useState("");
    const [coords, setCoords] = useState(null);
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [aadhaarFocused, setAadhaarFocused] = useState(false);

    const [form, setForm] = useState({
        name: "", email: "", phone: "", bloodGroup: "", role: "donor", address: "",
        aadhaarNumber: "", password: "", confirmPassword: "",
    });

    const [files, setFiles] = useState({ aadhaarImage: null, medicalCertificate: null, profilePicture: null });
    const [previews, setPreviews] = useState({ aadhaarImage: "", medicalCertificate: "", profilePicture: "" });

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const onFile = (field) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFiles({ ...files, [field]: file });
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreviews({ ...previews, [field]: url });
        } else {
            setPreviews({ ...previews, [field]: "" });
        }
    };

    const onAadhaar = (e) => {
        const formatted = formatAadhaar(e.target.value);
        setForm({ ...form, aadhaarNumber: formatted });
    };

    const fetchGps = async () => {
        setGpsStatus("Fetching location...");
        try {
            const pos = await getCurrentLocation();
            setCoords(pos);
            setGpsStatus("✓ Location captured");
        } catch {
            setGpsStatus("⚠ Location access denied");
        }
    };

    // ── Validation per step ───────────────────────────────────────────────────
    const validate = () => {
        setError("");
        if (step === 0) {
            if (!form.name.trim()) return setError("Full name is required."), false;
            if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Valid email is required."), false;
            if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) return setError("Phone must be 10 digits."), false;
            if (!form.bloodGroup) return setError("Please select your blood group."), false;
            return true;
        }
        if (step === 1) {
            if (!isValidAadhaar(form.aadhaarNumber)) return setError("Enter a valid 12-digit Aadhaar number. First digit must be 2–9."), false;
            if (!files.aadhaarImage) return setError("Please upload your Aadhaar card image for verification."), false;
            return true;
        }
        if (step === 2) return true; // Documents optional
        if (step === 3) {
            if (!form.password || form.password.length < 8) return setError("Password must be at least 8 characters."), false;
            if (form.password !== form.confirmPassword) return setError("Passwords do not match."), false;
            return true;
        }
        return true;
    };

    const goNext = () => { if (validate()) setStep((s) => s + 1); };
    const goPrev = () => { setError(""); setStep((s) => s - 1); };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            fd.append("email", form.email.trim().toLowerCase());
            fd.append("phone", form.phone.replace(/\s/g, ""));
            fd.append("bloodGroup", form.bloodGroup);
            fd.append("role", form.role);
            fd.append("address", form.address);
            fd.append("aadhaarNumber", form.aadhaarNumber.replace(/\s/g, ""));
            fd.append("password", form.password);
            if (coords) { fd.append("lat", coords.lat); fd.append("lng", coords.lng); }
            if (files.aadhaarImage) fd.append("aadhaarImage", files.aadhaarImage);
            if (files.medicalCertificate) fd.append("medicalCertificate", files.medicalCertificate);
            if (files.profilePicture) fd.append("profilePicture", files.profilePicture);

            const res = await registerUser(fd);
            navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const pwdScore = passwordStrength(form.password);
    const aadhaarValid = isValidAadhaar(form.aadhaarNumber);

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#fafafa", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* ── Left Panel ── */}
            <div style={{ width: 340, background: "linear-gradient(160deg,#b71c1c 0%,#e53935 55%,#ff7043 100%)", padding: "48px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 220, height: 220, background: "rgba(0,0,0,0.1)", borderRadius: "50%" }} />

                {/* Brand */}
                <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
                        <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Droplets size={20} color="#fff" />
                        </div>
                        <span style={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: "-0.03em" }}>BloodConnect</span>
                    </div>

                    <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 900, lineHeight: 1.15, margin: "0 0 14px", letterSpacing: "-0.03em" }}>
                        Join the<br />Lifesaving<br />Network
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.65, margin: "0 0 32px" }}>
                        Complete your profile in 4 simple steps and start making a real difference today.
                    </p>

                    {/* Step checklist */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {STEPS.map((s) => (
                            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, opacity: s.id <= step ? 1 : 0.45, transition: "opacity 0.3s" }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.id < step ? "rgba(255,255,255,0.9)" : s.id === step ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {s.id < step
                                        ? <Check size={14} color="#e53935" strokeWidth={3} />
                                        : <s.icon size={13} color="rgba(255,255,255,0.9)" />
                                    }
                                </div>
                                <span style={{ color: s.id === step ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: s.id === step ? 800 : 500 }}>
                                    {s.id === step && "→ "}{s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login link */}
                <div style={{ position: "relative" }}>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0 }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#fff", fontWeight: 800 }}>Sign in</Link>
                    </p>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
                <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.07)", padding: "36px 32px" }}>

                    <StepBar step={step} />

                    {/* Step title */}
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                            {step === 0 && "Personal Information"}
                            {step === 1 && "Aadhaar Verification"}
                            {step === 2 && "Documents & Location"}
                            {step === 3 && "Secure Password"}
                        </h2>
                        <p style={{ fontSize: 13, color: "#aaa", margin: 0, fontWeight: 500 }}>
                            {step === 0 && "Tell us about yourself"}
                            {step === 1 && "Verify your identity with your Aadhaar card"}
                            {step === 2 && "Upload supporting documents (optional but recommended)"}
                            {step === 3 && "Create a strong password to secure your account"}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: "#fff5f5", border: "1.5px solid #fdd", borderRadius: 10, padding: "11px 14px", marginBottom: 20, color: "#e53935", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}
                        style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* ── STEP 0: Personal Info ─────────────────────────────── */}
                        {step === 0 && (
                            <>
                                <InputField icon={User} label="Full Name" type="text" value={form.name} onChange={set("name")} placeholder="Your full legal name" required />
                                <InputField icon={Mail} label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
                                <InputField icon={Phone} label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile number" required />

                                <div>
                                    <Label>Blood Group</Label>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                        {BLOOD_GROUPS.map((bg) => (
                                            <button key={bg} type="button" onClick={() => setForm({ ...form, bloodGroup: bg })}
                                                style={{
                                                    padding: "10px 4px", borderRadius: 10, border: form.bloodGroup === bg ? "2px solid #e53935" : "1.5px solid #eee",
                                                    background: form.bloodGroup === bg ? "#fff0f0" : "#fafafa",
                                                    color: form.bloodGroup === bg ? "#e53935" : "#888",
                                                    fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.15s"
                                                }}>
                                                {bg}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>I am registering as</Label>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        {["donor", "receiver"].map((r) => (
                                            <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                                                style={{
                                                    padding: "13px 10px", borderRadius: 12, border: form.role === r ? "2px solid #e53935" : "1.5px solid #eee",
                                                    background: form.role === r ? "#fff0f0" : "#fafafa",
                                                    color: form.role === r ? "#e53935" : "#999",
                                                    fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                                                    textTransform: "capitalize"
                                                }}>
                                                {r === "donor" ? "🩸 Donor" : "🏥 Receiver"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <InputField icon={MapPin} label="Address (optional)" type="text" value={form.address} onChange={set("address")} placeholder="City, State" />
                            </>
                        )}

                        {/* ── STEP 1: Aadhaar Verification ─────────────────────── */}
                        {step === 1 && (
                            <>
                                {/* Info box */}
                                <div style={{ background: "#f0f7ff", border: "1.5px solid #c7e0ff", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                                    <ShieldCheck size={18} color="#2b68d6" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <div>
                                        <p style={{ margin: "0 0 2px", fontSize: 12.5, fontWeight: 800, color: "#1a4fa0" }}>Why Aadhaar?</p>
                                        <p style={{ margin: 0, fontSize: 12, color: "#3a6fc7", lineHeight: 1.55 }}>
                                            Aadhaar verification ensures that all donors are genuine Indian citizens. Your data is stored securely and never shared.
                                        </p>
                                    </div>
                                </div>

                                {/* Aadhaar number input */}
                                <div>
                                    <Label>Aadhaar Number (12 digits)</Label>
                                    <div style={{ position: "relative" }}>
                                        <ShieldCheck size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: aadhaarValid ? "#22c55e" : "#ccc", pointerEvents: "none" }} />
                                        <input
                                            type="text" inputMode="numeric"
                                            value={aadhaarFocused ? form.aadhaarNumber : (form.aadhaarNumber.length >= 12 ? maskAadhaar(form.aadhaarNumber) : form.aadhaarNumber)}
                                            onChange={onAadhaar}
                                            onFocus={(e) => { setAadhaarFocused(true); e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                                            onBlur={(e) => { setAadhaarFocused(false); e.target.style.borderColor = aadhaarValid ? "#22c55e" : "#eee"; e.target.style.background = aadhaarValid ? "#f0fff4" : "#f9f9f9"; }}
                                            placeholder="XXXX XXXX XXXX"
                                            maxLength={14}
                                            style={{ ...inputStyle(true), borderColor: aadhaarValid ? "#22c55e" : "#eee", background: aadhaarValid && !aadhaarFocused ? "#f0fff4" : "#f9f9f9", fontFamily: "monospace", letterSpacing: "0.1em", fontSize: 16 }}
                                        />
                                        {aadhaarValid && (
                                            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 22, height: 22, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Check size={13} color="#fff" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    {form.aadhaarNumber.replace(/\s/g, "").length > 0 && (
                                        <p style={{ fontSize: 11, marginTop: 5, fontWeight: 700, color: aadhaarValid ? "#22c55e" : "#e53935" }}>
                                            {aadhaarValid ? "✓ Valid Aadhaar format" : `${form.aadhaarNumber.replace(/\s/g, "").length}/12 digits`}
                                        </p>
                                    )}
                                </div>

                                {/* Aadhaar Image Upload */}
                                <FileUpload
                                    label="Aadhaar Card Image *"
                                    accept="image/*,.pdf"
                                    preview={previews.aadhaarImage}
                                    onChange={onFile("aadhaarImage")}
                                    hint="Front side of your Aadhaar card — JPG or PNG"
                                />

                                {/* Verified badge when both are done */}
                                {aadhaarValid && files.aadhaarImage && (
                                    <div style={{ background: "#f0fff4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 32, height: 32, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Check size={16} color="#fff" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#15803d" }}>Aadhaar Ready for Verification</p>
                                            <p style={{ margin: 0, fontSize: 11.5, color: "#4ade80" }}>Last 4 digits: {form.aadhaarNumber.slice(-4)} • Image submitted</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── STEP 2: Documents & Location ─────────────────────── */}
                        {step === 2 && (
                            <>
                                <FileUpload
                                    label="Profile Picture (optional)"
                                    accept="image/*"
                                    preview={previews.profilePicture}
                                    onChange={onFile("profilePicture")}
                                    hint="Clear face photo for donor recognition"
                                />

                                <FileUpload
                                    label="Medical Certificate (optional)"
                                    accept="image/*,.pdf"
                                    preview={previews.medicalCertificate}
                                    onChange={onFile("medicalCertificate")}
                                    hint="Improves donor credibility — PDF or image"
                                />

                                {/* GPS Location */}
                                <div>
                                    <Label>Your Location (for nearby donor matching)</Label>
                                    <button type="button" onClick={fetchGps}
                                        style={{
                                            width: "100%", padding: "12px 16px",
                                            border: coords ? "1.5px solid #22c55e" : "1.5px dashed #ddd",
                                            borderRadius: 12, background: coords ? "#f0fff4" : "#fafafa",
                                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                            color: coords ? "#15803d" : "#999", fontWeight: 700, fontSize: 13, transition: "all 0.2s"
                                        }}>
                                        <MapPin size={17} color={coords ? "#22c55e" : "#e53935"} />
                                        {coords ? "✓ Location captured" : "Tap to get GPS location"}
                                    </button>
                                    {gpsStatus && !gpsStatus.includes("✓") && (
                                        <p style={{ fontSize: 11.5, color: "#f97316", marginTop: 5, fontWeight: 600 }}>{gpsStatus}</p>
                                    )}
                                    <p style={{ fontSize: 11, color: "#bbb", marginTop: 6, fontWeight: 500 }}>
                                        Location helps connect nearby donors to urgent requests.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* ── STEP 3: Password ──────────────────────────────────── */}
                        {step === 3 && (
                            <>
                                <div>
                                    <Label>Password</Label>
                                    <div style={{ position: "relative" }}>
                                        <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc" }} />
                                        <input
                                            type={showPwd ? "text" : "password"}
                                            value={form.password} onChange={set("password")}
                                            placeholder="Minimum 8 characters"
                                            style={{ ...inputStyle(true), paddingRight: 44 }}
                                            onFocus={e => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                                            onBlur={e => { e.target.style.borderColor = "#eee"; e.target.style.background = "#f9f9f9"; }}
                                        />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 4 }}>
                                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Strength meter */}
                                    {form.password.length > 0 && (
                                        <div style={{ marginTop: 10 }}>
                                            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= pwdScore ? STRENGTH_COLORS[pwdScore] : "#f0f0f0", transition: "background 0.3s" }} />
                                                ))}
                                            </div>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: STRENGTH_COLORS[pwdScore], margin: 0 }}>
                                                {STRENGTH_LABELS[pwdScore]}
                                            </p>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                                {[
                                                    { ok: form.password.length >= 8, label: "8+ chars" },
                                                    { ok: /[A-Z]/.test(form.password), label: "Uppercase" },
                                                    { ok: /[0-9]/.test(form.password), label: "Number" },
                                                    { ok: /[^A-Za-z0-9]/.test(form.password), label: "Symbol" },
                                                ].map(({ ok, label }) => (
                                                    <span key={label} style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: ok ? "#f0fff4" : "#f5f5f5", color: ok ? "#15803d" : "#aaa", border: `1px solid ${ok ? "#bbf7d0" : "#eee"}` }}>
                                                        {ok ? "✓" : "○"} {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label>Confirm Password</Label>
                                    <div style={{ position: "relative" }}>
                                        <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#ccc" }} />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            value={form.confirmPassword} onChange={set("confirmPassword")}
                                            placeholder="Re-enter your password"
                                            style={{ ...inputStyle(true), paddingRight: 44, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "#fca5a5" : "#eee" }}
                                            onFocus={e => { e.target.style.borderColor = "#e53935"; e.target.style.background = "#fff"; }}
                                            onBlur={e => { e.target.style.borderColor = form.confirmPassword && form.password !== form.confirmPassword ? "#fca5a5" : "#eee"; e.target.style.background = "#f9f9f9"; }}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 4 }}>
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {form.confirmPassword && form.password !== form.confirmPassword && (
                                        <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, fontWeight: 600 }}>⚠ Passwords do not match</p>
                                    )}
                                </div>

                                <p style={{ fontSize: 11.5, color: "#aaa", lineHeight: 1.6 }}>
                                    By creating an account you agree to our{" "}
                                    <span style={{ color: "#e53935", fontWeight: 700, cursor: "pointer" }}>Terms of Service</span> and{" "}
                                    <span style={{ color: "#e53935", fontWeight: 700, cursor: "pointer" }}>Privacy Policy</span>.
                                </p>
                            </>
                        )}

                        {/* Nav buttons */}
                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            {step > 0 && (
                                <button type="button" onClick={goPrev}
                                    style={{ flex: 1, padding: "13px", background: "#f5f5f5", color: "#666", fontWeight: 700, border: "none", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14, transition: "background 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#eee"}
                                    onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            )}
                            <button type="submit" disabled={loading}
                                style={{
                                    flex: 2, padding: "13px",
                                    background: loading ? "#f08080" : "linear-gradient(135deg,#e53935,#b71c1c)",
                                    color: "#fff", fontWeight: 800, border: "none", borderRadius: 12,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    fontSize: 14, boxShadow: loading ? "none" : "0 5px 18px rgba(229,57,53,0.32)",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 7px 22px rgba(229,57,53,0.4)"; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 5px 18px rgba(229,57,53,0.32)"; }}>
                                {loading
                                    ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Submitting...</>
                                    : step === 3 ? <>Create Account <Check size={16} /></> : <>Continue <ChevronRight size={16} /></>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 700px) { [data-left] { display: none !important; } }
            `}</style>
        </div>
    );
}
