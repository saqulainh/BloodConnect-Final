import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Search, Home, MessageCircle, User, Droplets, MapPin, ChevronRight, LogOut, ToggleLeft, ToggleRight, X, Loader2 } from "lucide-react";
import { getMe, updateMe, logoutUser, isLoggedIn } from "../lib/api";
import { subscribeToUserChannel, unsubscribeFromUserChannel } from "../lib/pusher";

const QUICK_ACTIONS = [
    { icon: "🩸", label: "Find Donors", path: "/donors", color: "#fff0f0" },
    { icon: "🆘", label: "Request Blood", action: "request", color: "#fff0f0" },
    { icon: "📋", label: "Blood Orders", path: "/dashboard", color: "#fff0f0" },
    { icon: "🚑", label: "Ambulances", path: "/dashboard", color: "#fff0f0" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const pusherChannelRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [togglingAvail, setTogglingAvail] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [activeTab, setActiveTab] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!isLoggedIn()) { navigate("/login"); return; }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!userData?._id) return;
        pusherChannelRef.current = subscribeToUserChannel(userData._id, (eventName, data) => {
            const msg =
                eventName === "blood-request"
                    ? `🩸 Urgent: ${data.bloodGroup || "blood"} needed near you!`
                    : eventName === "donation-confirmed"
                        ? `✅ Donation confirmed! Thank you.`
                        : eventName === "new-message"
                            ? `💬 ${data.content || "New message received"}`
                            : data.message || "New notification";
            setNotifications((prev) => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        });
        return () => {
            if (pusherChannelRef.current && userData?._id)
                unsubscribeFromUserChannel(pusherChannelRef.current, userData._id);
        };
    }, [userData?._id]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const data = await getMe();
            setUserData(data.data?.user || data.data);
        } catch {
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        if (!userData) return;
        const eligible = userData.eligibility?.isEligible !== false;
        if (!eligible) { alert("You are not eligible to donate yet. Please wait until your next eligible date."); return; }
        setTogglingAvail(true);
        try {
            const res = await updateMe({ isAvailable: !userData.isAvailable });
            setUserData((prev) => ({ ...prev, isAvailable: res.data?.user?.isAvailable ?? !prev.isAvailable }));
        } catch (err) {
            alert(err.message);
        } finally {
            setTogglingAvail(false);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    const unread = notifications.length;
    const user = userData;
    const firstName = user?.name?.split(" ")[0] || "User";
    const city = user?.address || "Your City";
    const bloodGroup = user?.bloodGroup || "—";
    const donationCount = user?.donationCount || 0;
    const isAvailable = user?.isAvailable ?? false;
    const isEligible = user?.eligibility?.isEligible !== false;

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
            <div style={{ textAlign: "center" }}>
                <Loader2 size={36} color="#e53935" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ color: "#888", marginTop: 12, fontWeight: 600 }}>Loading your dashboard...</p>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Inter','Segoe UI',sans-serif", paddingBottom: 80 }}>

            {/* ── RED HEADER ── */}
            <div style={{ background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)", padding: "20px 20px 60px", position: "relative" }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Avatar */}
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)", overflow: "hidden" }}>
                            {user?.profilePicture
                                ? <img src={user.profilePicture} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>{firstName[0]}</span>}
                        </div>
                        <div>
                            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500 }}>Hi, {firstName}</p>
                            <p style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                <MapPin size={11} /> Welcome to {city}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        {/* Notification bell */}
                        <button onClick={() => setShowNotifs(!showNotifs)} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                            <Bell size={17} color="#fff" />
                            {unread > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#ffeb3b", borderRadius: "50%" }} />}
                        </button>
                        <button onClick={handleLogout} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LogOut size={17} color="#fff" />
                        </button>
                    </div>
                </div>

                {/* Hero card */}
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: 0, lineHeight: 1.2 }}>Donate Blood<br />Save Life</h2>
                            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "4px 0 12px" }}>Every drop counts. Be a hero today.</p>
                            <div style={{ display: "flex", gap: 16 }}>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 20 }}>{bloodGroup}</p>
                                    <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600 }}>Blood Type</p>
                                </div>
                                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 20 }}>{donationCount}</p>
                                    <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600 }}>Donations</p>
                                </div>
                                <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 20 }}>{isEligible ? "✓" : "⏳"}</p>
                                    <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600 }}>Eligible</p>
                                </div>
                            </div>
                        </div>
                        {/* Availability toggle */}
                        <div style={{ textAlign: "center" }}>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase" }}>Available</p>
                            <button onClick={toggleAvailability} disabled={togglingAvail || !isEligible}
                                style={{ background: "none", border: "none", cursor: isEligible ? "pointer" : "not-allowed", opacity: isEligible ? 1 : 0.5 }}>
                                {isAvailable
                                    ? <ToggleRight size={36} color="#4caf50" />
                                    : <ToggleLeft size={36} color="rgba(255,255,255,0.5)" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── WHITE CONTENT CARD (overlaps red header) ── */}
            <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", marginTop: -28, padding: "24px 20px", minHeight: "calc(100vh - 200px)" }}>

                {/* Search bar */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f5f5f5", borderRadius: 50, padding: "10px 16px" }}>
                        <MapPin size={15} color="#e53935" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Nearby" style={{ border: "none", background: "none", outline: "none", fontSize: 14, color: "#333", flex: 1, fontFamily: "inherit" }} />
                        <Search size={15} color="#e53935" />
                    </div>
                    <button style={{ width: 42, height: 42, borderRadius: "50%", background: "#f5f5f5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 16 }}>⚙️</span>
                    </button>
                </div>

                {/* Quick actions grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {QUICK_ACTIONS.map(({ icon, label, path, action }) => (
                        <button key={label}
                            onClick={() => action === "request" ? setShowRequestModal(true) : navigate(path)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e53935"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(229,57,53,0.12)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}>
                            <div style={{ width: 40, height: 40, background: "#fff0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                                {icon}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Emergency Blood section */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 16, color: "#111" }}>Emergency Blood</h3>
                        <button style={{ background: "none", border: "none", color: "#e53935", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>See All</button>
                    </div>

                    {/* Emergency cards */}
                    {[
                        { hospital: "Cedars-Sinai Medical Center", blood: "O-", urgency: "Critical", time: "2 min ago" },
                        { hospital: "Apollo Hospital, Delhi", blood: "AB+", urgency: "Urgent", time: "15 min ago" },
                        { hospital: "AIIMS, Mumbai", blood: "B+", urgency: "Urgent", time: "32 min ago" },
                    ].map(({ hospital, blood, urgency, time }) => (
                        <div key={hospital} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#fff", border: "1.5px solid #f5f5f5", borderRadius: 14, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#e53935")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#f5f5f5")}>
                            <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg, #c62828, #e53935)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>{blood}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#111" }}>{hospital}</p>
                                <p style={{ margin: 0, fontSize: 11, color: "#aaa", marginTop: 2 }}>{time}</p>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: urgency === "Critical" ? "#fff0f0" : "#fff8e1", color: urgency === "Critical" ? "#e53935" : "#f57c00" }}>
                                {urgency}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Notifications dropdown */}
                {showNotifs && (
                    <div style={{ position: "fixed", top: 70, right: 16, width: 300, background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 200, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>Notifications</span>
                            <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><X size={16} /></button>
                        </div>
                        {notifications.length === 0
                            ? <p style={{ textAlign: "center", color: "#bbb", padding: "20px", fontSize: 13 }}>No notifications yet</p>
                            : notifications.map((n) => (
                                <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f9f9f9" }}>
                                    <p style={{ margin: 0, fontSize: 13, color: "#333" }}>{n.msg}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: "#bbb", marginTop: 2 }}>{n.time}</p>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* ── BOTTOM NAV ── */}
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 100 }}>
                {[
                    { id: "home", icon: <Home size={20} />, label: "Home" },
                    { id: "chat", icon: <MessageCircle size={20} />, label: "Chat" },
                    { id: "search", icon: <Search size={20} />, label: "Search" },
                    { id: "profile", icon: <User size={20} />, label: "Profile" },
                ].map(({ id, icon, label }) => (
                    <button key={id} onClick={() => {
                        setActiveTab(id);
                        if (id === "search") navigate("/donors");
                        if (id === "chat") navigate("/chat");
                        if (id === "profile") navigate("/profile");
                    }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "0 16px" }}>
                        {id === "home" && activeTab === "home"
                            ? <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e53935", borderRadius: 50, padding: "8px 18px", color: "#fff" }}>
                                <Home size={18} color="#fff" />
                                <span style={{ fontSize: 13, fontWeight: 700 }}>Home</span>
                            </div>
                            : <div style={{ color: activeTab === id ? "#e53935" : "#bbb", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                {icon}
                                <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
                            </div>}
                    </button>
                ))}
            </div>

            {/* ── REQUEST BLOOD MODAL ── */}
            {showRequestModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: 18, color: "#111" }}>Request Blood</h3>
                            <button onClick={() => setShowRequestModal(false)} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={16} />
                            </button>
                        </div>
                        <p style={{ color: "#aaa", fontSize: 13, margin: "0 0 20px" }}>Fill in the details to send an urgent blood request to nearby donors.</p>
                        <RequestBloodForm onClose={() => setShowRequestModal(false)} />
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ── Request Blood inline form ─────────────────────────────────────────
function RequestBloodForm({ onClose }) {
    const [form, setForm] = useState({ bloodGroup: "", unitsRequired: 1, hospitalName: "", urgency: "Urgent" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bloodGroup || !form.hospitalName) { setError("All fields are required"); return; }
        setLoading(true);
        try {
            const { createBloodRequest, getCurrentLocation } = await import("../lib/api");
            const loc = await getCurrentLocation().catch(() => ({ lat: 0, lng: 0 }));
            await createBloodRequest({ ...form, lat: loc.lat, lng: loc.lng });
            alert("🩸 Blood request sent! Nearby donors have been notified.");
            onClose();
        } catch (err) {
            setError(err.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    const inp = { width: "100%", padding: "11px 14px", border: "1.5px solid #eee", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 12 };
    const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

    return (
        <form onSubmit={handleSubmit}>
            {error && <p style={{ color: "#e53935", fontSize: 13, marginBottom: 10 }}>⚠️ {error}</p>}
            <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} style={{ ...inp, appearance: "none" }}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="text" placeholder="Hospital Name" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} style={inp} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input type="number" min={1} max={10} placeholder="Units" value={form.unitsRequired} onChange={(e) => setForm({ ...form, unitsRequired: +e.target.value })} style={{ ...inp, marginBottom: 0 }} />
                <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} style={{ ...inp, marginBottom: 0, appearance: "none" }}>
                    <option value="Urgent">Urgent</option>
                    <option value="Normal">Normal</option>
                </select>
            </div>
            <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "13px", background: "#e53935", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? "Sending..." : "🩸 Send Request"}
            </button>
        </form>
    );
}
