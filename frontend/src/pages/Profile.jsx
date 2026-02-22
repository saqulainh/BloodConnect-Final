import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Droplets, MapPin, Shield, Edit2, Save, X, LogOut, CheckCircle, Clock, Camera, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { getMe, updateMe, logoutUser, isLoggedIn } from "../services/api";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ name: "", phone: "", address: "" });

    useEffect(() => {
        if (!isLoggedIn()) { navigate("/login"); return; }
        fetchUser();
    }, []);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await getMe();
            const u = res.data?.user || res.data;
            setUser(u);
            setForm({ name: u.name || "", phone: u.phone || "", address: u.address || "" });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const res = await updateMe(form);
            const u = res.data?.user || res.data;
            setUser((prev) => ({ ...prev, ...u }));
            setEditing(false);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
            <Loader2 size={32} color="#e53935" style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const name = user?.name || "User";
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const bloodGroup = user?.bloodGroup || "—";
    const donationCount = user?.donationCount || 0;
    const requestCount = user?.requestCount || 0;
    const isEligible = user?.eligibility?.isEligible !== false;
    const nextEligible = user?.eligibility?.nextEligibleDate ? new Date(user.eligibility.nextEligibleDate).toLocaleDateString() : null;
    const isVerified = user?.isVerified;
    const isAadhaarVerified = user?.aadhaarVerified;
    const isAvailable = user?.isAvailable;

    const lbl = { fontSize: 11, fontWeight: 800, color: "#aaa", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4, display: "block" };
    const val = { fontSize: 15, fontWeight: 600, color: "#111" };
    const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #eee", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111", background: "#fafafa", transition: "border 0.2s" };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Inter','Segoe UI',sans-serif", paddingBottom: 40 }}>

            {/* ── RED HEADER ── */}
            <div style={{ background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)", padding: "20px 20px 80px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, padding: "8px 16px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                        <ArrowLeft size={14} /> Back
                    </button>
                    <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 18, margin: 0 }}>My Profile</h1>
                    <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, padding: "8px 16px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>

                {/* Avatar card — overlaps header */}
                <div style={{ background: "#fff", borderRadius: 20, padding: "24px", marginTop: -50, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", textAlign: "center", marginBottom: 16 }}>
                    <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(229,57,53,0.3)" }}>
                            {user?.profilePicture
                                ? <img src={user.profilePicture} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontWeight: 900, fontSize: 28, color: "#fff" }}>{initials}</span>}
                        </div>
                        <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, background: "#e53935", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", cursor: "pointer" }}>
                            <Camera size={12} color="#fff" />
                        </div>
                    </div>
                    <h2 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 20, color: "#111" }}>{name}</h2>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, color: "#aaa" }}>{user?.role === "donor" ? "🩸 Donor" : "🏥 Receiver"}</span>
                        {isAadhaarVerified ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#2e7d32", fontWeight: 700 }}>
                                <ShieldCheck size={12} /> Aadhaar Verified
                            </span>
                        ) : isVerified && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#4682B4", fontWeight: 700 }}>
                                <CheckCircle size={12} /> Email Verified
                            </span>
                        )}
                    </div>
                    {!isAadhaarVerified && user?.role === "donor" && (
                        <button
                            onClick={() => navigate("/verify-aadhaar")} // Assuming a route exists or will be created
                            style={{ marginTop: 12, background: "#fff5f5", border: "1px solid #ffcdd2", color: "#e53935", padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
                        >
                            <AlertCircle size={12} />
                            GET AADHAAR VERIFIED
                        </button>
                    )}

                    {/* Stats row */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 20, borderTop: "1px solid #f5f5f5", paddingTop: 16 }}>
                        {[
                            { label: "Blood Type", value: bloodGroup, color: "#e53935" },
                            { label: "Donations", value: donationCount },
                            { label: "Requests", value: requestCount },
                        ].map(({ label, value, color }, i) => (
                            <div key={label} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid #f5f5f5" : "none" }}>
                                <p style={{ margin: 0, fontWeight: 900, fontSize: 22, color: color || "#111" }}>{value}</p>
                                <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontWeight: 600 }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status badges */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <div style={{ flex: 1, background: isAvailable ? "#f0fff4" : "#f9f9f9", border: `1.5px solid ${isAvailable ? "#b2f5c8" : "#eee"}`, borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: isAvailable ? "#2e7d32" : "#aaa" }}>
                            {isAvailable ? "✅ Available" : "⏸ Unavailable"}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Donation status</p>
                    </div>
                    <div style={{ flex: 1, background: isEligible ? "#f0fff4" : "#fff8e1", border: `1.5px solid ${isEligible ? "#b2f5c8" : "#ffe082"}`, borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: isEligible ? "#2e7d32" : "#f57c00" }}>
                            {isEligible ? "✅ Eligible" : "⏳ Not Yet"}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{nextEligible ? `Next: ${nextEligible}` : "Eligibility"}</p>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div style={{ background: "#fff5f5", border: "1px solid #fdd", borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: "#e53935", fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
                {success && <div style={{ background: "#f0fff4", border: "1px solid #b2f5c8", borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: "#2e7d32", fontSize: 13, fontWeight: 600 }}>✅ {success}</div>}

                {/* Profile info card */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 15, color: "#111" }}>Personal Information</h3>
                        {!editing
                            ? <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff5f5", border: "none", borderRadius: 8, padding: "6px 12px", color: "#e53935", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                <Edit2 size={12} /> Edit
                            </button>
                            : <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => setEditing(false)} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f5f5f5", border: "none", borderRadius: 8, padding: "6px 12px", color: "#555", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                    <X size={12} /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 4, background: "#e53935", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                                    {saving ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={12} />} Save
                                </button>
                            </div>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[
                            { icon: <User size={14} color="#e53935" />, label: "Full Name", field: "name", value: user?.name },
                            { icon: <Mail size={14} color="#e53935" />, label: "Email", field: null, value: user?.email },
                            { icon: <Phone size={14} color="#e53935" />, label: "Phone", field: "phone", value: user?.phone },
                            { icon: <MapPin size={14} color="#e53935" />, label: "Address", field: "address", value: user?.address },
                            { icon: <Droplets size={14} color="#e53935" />, label: "Blood Group", field: null, value: user?.bloodGroup },
                            { icon: <Shield size={14} color="#e53935" />, label: "Aadhaar", field: null, value: user?.aadhaarNumber ? `XXXX XXXX ${user.aadhaarNumber.toString().slice(-4)}` : "••••••••••••" },
                        ].map(({ icon, label, field, value }) => (
                            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <div style={{ width: 32, height: 32, background: "#fff5f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                    {icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={lbl}>{label}</span>
                                    {editing && field
                                        ? <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                            style={inp} onFocus={(e) => (e.target.style.borderColor = "#e53935")} onBlur={(e) => (e.target.style.borderColor = "#eee")} />
                                        : <span style={val}>{value || "—"}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logout button */}
                <button onClick={handleLogout}
                    style={{ width: "100%", padding: "14px", background: "#fff", border: "2px solid #e53935", borderRadius: 12, color: "#e53935", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#e53935"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#e53935"; }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
