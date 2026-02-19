import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Phone, Droplets, ChevronDown, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { getNearbyDonors, getCurrentLocation } from "../services/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const INDIAN_DISTRICTS = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
    "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad",
];

export default function FindDonors() {
    const navigate = useNavigate();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [filters, setFilters] = useState({ bloodGroup: "A+", district: "", upazila: "" });
    const [expandedDonor, setExpandedDonor] = useState(null);

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setLocationError("");
        try {
            const loc = await getCurrentLocation();
            const res = await getNearbyDonors({
                lat: loc.lat,
                lng: loc.lng,
                bloodGroup: filters.bloodGroup || undefined,
                radius: 50,
            });
            setDonors(res.data?.donors || res.data || []);
        } catch (err) {
            if (err.message?.includes("denied") || err.message?.includes("location")) {
                setLocationError("Location access denied. Please enable location to find nearby donors.");
            } else {
                setLocationError(err.message || "Failed to fetch donors.");
            }
            setDonors([]);
        } finally {
            setLoading(false);
        }
    };

    const SelectBox = ({ value, onChange, options, placeholder, icon }) => (
        <div style={{ position: "relative", flex: 1 }}>
            {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>{icon}</span>}
            <select value={value} onChange={(e) => onChange(e.target.value)}
                style={{ width: "100%", padding: `10px 36px 10px ${icon ? "36px" : "14px"}`, border: "none", borderRadius: 8, fontSize: 14, color: value ? "#111" : "#888", background: "#fff", outline: "none", appearance: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none" }} />
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f0f2f5" }}>

            {/* ── DARK HERO SECTION ── */}
            <div style={{ position: "relative", background: "linear-gradient(135deg, #1a0000 0%, #7b1111 50%, #c62828 100%)", minHeight: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px 80px", overflow: "hidden" }}>

                {/* Background overlay texture */}
                <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\"><circle cx=\"30\" cy=\"30\" r=\"1\" fill=\"rgba(255,255,255,0.03)\"/></svg>')", opacity: 0.5 }} />

                {/* Back button */}
                <button onClick={() => navigate("/dashboard")}
                    style={{ position: "absolute", top: 20, left: 20, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 50, padding: "8px 16px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, backdropFilter: "blur(4px)" }}>
                    <ArrowLeft size={14} /> Back
                </button>

                {/* Headline */}
                <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
                    <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(22px,4vw,38px)", lineHeight: 1.2, margin: "0 0 10px", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                        Efficiently Connect with Blood Donors:<br />
                        <span style={{ color: "#ffcdd2" }}>Saving Lives Made Simpler and Faster</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
                        Search verified donors near you by blood group and location
                    </p>
                </div>

                {/* ── FILTER BAR ── */}
                <div style={{ background: "#fff", borderRadius: 12, padding: "6px 6px 6px 6px", display: "flex", alignItems: "center", gap: 0, width: "100%", maxWidth: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", position: "relative", zIndex: 1, flexWrap: "wrap" }}>

                    {/* Blood Group */}
                    <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 130, borderRight: "1px solid #eee", padding: "0 4px" }}>
                        <Droplets size={14} color="#e53935" style={{ marginLeft: 8, flexShrink: 0 }} />
                        <select value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                            style={{ flex: 1, padding: "10px 8px", border: "none", fontSize: 14, color: "#111", background: "transparent", outline: "none", appearance: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                            <option value="">Blood Group</option>
                            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown size={13} color="#aaa" style={{ flexShrink: 0, marginRight: 4 }} />
                    </div>

                    {/* District */}
                    <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 150, borderRight: "1px solid #eee", padding: "0 4px" }}>
                        <MapPin size={14} color="#e53935" style={{ marginLeft: 8, flexShrink: 0 }} />
                        <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            style={{ flex: 1, padding: "10px 8px", border: "none", fontSize: 14, color: filters.district ? "#111" : "#aaa", background: "transparent", outline: "none", appearance: "none", cursor: "pointer", fontFamily: "inherit" }}>
                            <option value="">Select a District</option>
                            {INDIAN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={13} color="#aaa" style={{ flexShrink: 0, marginRight: 4 }} />
                    </div>

                    {/* Upazila / Area */}
                    <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 140, padding: "0 4px" }}>
                        <MapPin size={14} color="#e53935" style={{ marginLeft: 8, flexShrink: 0 }} />
                        <input value={filters.upazila} onChange={(e) => setFilters({ ...filters, upazila: e.target.value })}
                            placeholder="Select a Upazila"
                            style={{ flex: 1, padding: "10px 8px", border: "none", fontSize: 14, color: "#111", background: "transparent", outline: "none", fontFamily: "inherit" }} />
                    </div>

                    {/* Search button */}
                    <button onClick={handleSearch} disabled={loading}
                        style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 8, padding: "11px 22px", fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "background 0.2s", flexShrink: 0 }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#b71c1c"; }}
                        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#e53935"; }}>
                        <Search size={14} />
                        {loading ? "Searching..." : "SEARCH"}
                    </button>
                </div>
            </div>

            {/* ── RESULTS SECTION ── */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

                {/* Error */}
                {locationError && (
                    <div style={{ background: "#fff5f5", border: "1px solid #fdd", borderRadius: 12, padding: "14px 18px", marginBottom: 24, color: "#e53935", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                        ⚠️ {locationError}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                <div style={{ height: 200, background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", animation: "shimmer 1.5s infinite" }} />
                                <div style={{ padding: 16 }}>
                                    <div style={{ height: 16, background: "#f0f0f0", borderRadius: 8, marginBottom: 8, width: "60%" }} />
                                    <div style={{ height: 12, background: "#f0f0f0", borderRadius: 8, marginBottom: 6, width: "80%" }} />
                                    <div style={{ height: 12, background: "#f0f0f0", borderRadius: 8, width: "50%" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Donor cards */}
                {!loading && searched && donors.length > 0 && (
                    <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 18, color: "#111" }}>
                                {donors.length} Donor{donors.length !== 1 ? "s" : ""} Found
                            </h2>
                            <span style={{ fontSize: 13, color: "#aaa" }}>Sorted by distance</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
                            {donors.map((donor) => (
                                <DonorCard key={donor._id} donor={donor} expanded={expandedDonor === donor._id} onToggle={() => setExpandedDonor(expandedDonor === donor._id ? null : donor._id)} />
                            ))}
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!loading && searched && donors.length === 0 && !locationError && (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🩸</div>
                        <h3 style={{ fontWeight: 900, fontSize: 20, color: "#111", margin: "0 0 8px" }}>No donors found nearby</h3>
                        <p style={{ color: "#aaa", fontSize: 14 }}>Try a different blood group or increase the search radius.</p>
                    </div>
                )}

                {/* Initial state */}
                {!searched && !loading && (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                        <h3 style={{ fontWeight: 900, fontSize: 20, color: "#111", margin: "0 0 8px" }}>Search for Donors</h3>
                        <p style={{ color: "#aaa", fontSize: 14 }}>Select your blood group and click Search to find verified donors near you.</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}

// ── Donor Card ────────────────────────────────────────────────────────
function DonorCard({ donor, expanded, onToggle }) {
    const name = donor.name || "Anonymous";
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const distance = donor.distance ? `${(donor.distance / 1000).toFixed(1)} km away` : null;
    const phone = donor.phone || donor.contact;
    const isAvailable = donor.isAvailable;
    const isVerified = donor.isVerified;
    const donationCount = donor.donationCount || 0;

    return (
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", transition: "all 0.2s", border: "1.5px solid #f0f0f0" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 32px rgba(229,57,53,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)")}>

            {/* Photo / Avatar area */}
            <div style={{ height: 180, background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {donor.profilePicture
                    ? <img src={donor.profilePicture} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e53935", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontWeight: 900, fontSize: 28, color: "#fff" }}>{initials}</span>
                    </div>}

                {/* Blood group badge */}
                <div style={{ position: "absolute", top: 12, right: 12, background: "#e53935", color: "#fff", fontWeight: 900, fontSize: 13, padding: "4px 10px", borderRadius: 20, boxShadow: "0 2px 8px rgba(229,57,53,0.4)" }}>
                    {donor.bloodGroup}
                </div>

                {/* Availability dot */}
                <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "3px 10px", backdropFilter: "blur(4px)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: isAvailable ? "#4caf50" : "#aaa" }} />
                    <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{isAvailable ? "Available" : "Unavailable"}</span>
                </div>
            </div>

            {/* Info */}
            <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#111" }}>{name}</h3>
                    {isVerified && <CheckCircle size={14} color="#4caf50" />}
                </div>

                {donor.address && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <MapPin size={12} color="#e53935" />
                        <span style={{ fontSize: 12, color: "#666" }}>{donor.address}</span>
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <Droplets size={12} color="#e53935" />
                    <span style={{ fontSize: 12, color: "#666" }}>Blood Group: <strong>{donor.bloodGroup}</strong></span>
                </div>

                {distance && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <Clock size={12} color="#aaa" />
                        <span style={{ fontSize: 12, color: "#aaa" }}>{distance}</span>
                    </div>
                )}

                {donationCount > 0 && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff5f5", borderRadius: 20, padding: "3px 10px", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: "#e53935", fontWeight: 700 }}>🩸 {donationCount} donation{donationCount !== 1 ? "s" : ""}</span>
                    </div>
                )}

                {/* View More / Contact */}
                {expanded && phone && (
                    <div style={{ marginTop: 8, padding: "10px 12px", background: "#f9f9f9", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                        <Phone size={13} color="#e53935" />
                        <a href={`tel:${phone}`} style={{ fontSize: 13, color: "#111", fontWeight: 700, textDecoration: "none" }}>{phone}</a>
                    </div>
                )}

                <button onClick={onToggle}
                    style={{ width: "100%", marginTop: 12, padding: "10px", background: expanded ? "#f5f5f5" : "#e53935", color: expanded ? "#555" : "#fff", fontWeight: 800, fontSize: 13, border: "none", borderRadius: 9, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = "#b71c1c"; }}
                    onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = "#e53935"; }}>
                    {expanded ? "HIDE" : "VIEW MORE"}
                </button>
            </div>
        </div>
    );
}
