import React, { useState, useCallback } from "react";
import {
    MapPin, Navigation, Droplets, Clock, ShieldCheck,
    Search, Loader2, AlertCircle, Phone, MessageSquare,
    ChevronRight, Zap, Filter
} from "lucide-react";
import { getProximityDonors } from "../../services/api";

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ELIGIBILITY_COLORS = {
    eligible: "bg-emerald-50 text-emerald-700 border-emerald-100",
    ineligible: "bg-amber-50 text-amber-700 border-amber-100",
};

// ── getDriveColor ─────────────────────────────────────────────────────
const getDriveColor = (minutes) => {
    if (minutes <= 10) return "text-emerald-600";
    if (minutes <= 25) return "text-amber-600";
    return "text-red-600";
};

// ── DonorCard ─────────────────────────────────────────────────────────
const DonorCard = ({ donor, onChat }) => {
    const initials = donor.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const driveColor = getDriveColor(donor.driveTimeMinutes);

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {donor.profilePicture ? (
                        <img src={donor.profilePicture} alt={donor.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
                            {initials}
                        </div>
                    )}
                    {/* Blood group badge */}
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-red-600 rounded-md text-white text-[9px] font-black">
                        {donor.bloodGroup}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-slate-800 truncate">{donor.name}</p>
                        {donor.aadhaarVerified && (
                            <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">{donor.address || "Location shared"}</p>

                    {/* Distance + Drive Time */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={11} className="text-slate-400" />
                            <span className="font-bold">{donor.distanceKm} km</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-black ${driveColor}`}>
                            <Clock size={11} />
                            <span>{donor.driveTimeLabel} away</span>
                        </div>
                    </div>
                </div>

                {/* Eligibility badge */}
                <div className={`flex-shrink-0 px-2 py-1 rounded-lg border text-[10px] font-black ${donor.isEligible ? ELIGIBILITY_COLORS.eligible : ELIGIBILITY_COLORS.ineligible}`}>
                    {donor.isEligible ? "✅ Ready" : "⏳ " + donor.eligibilityNote}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                {donor.phone && (
                    <a
                        href={`tel:${donor.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-colors"
                    >
                        <Phone size={12} />
                        Call
                    </a>
                )}
                <button
                    onClick={() => onChat?.(donor)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-black hover:bg-slate-100 transition-colors"
                >
                    <MessageSquare size={12} />
                    Message
                </button>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────
export default function ProximityFinder({ onStartChat }) {
    const [bloodGroup, setBloodGroup] = useState("All");
    const [radius, setRadius] = useState(20);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [meta, setMeta] = useState(null);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSearched(true);

        try {
            if (!navigator.geolocation) throw new Error("Geolocation not supported by your browser.");
            const pos = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
            );

            const { latitude: lat, longitude: lng } = pos.coords;
            const res = await getProximityDonors({ lat, lng, bloodGroup, radius });

            if (res?.success) {
                setDonors(res.data || []);
                setMeta(res.meta);
            } else {
                throw new Error(res?.message || "Search failed");
            }
        } catch (err) {
            setError(err.message || "Failed to get location. Please allow location access.");
        } finally {
            setLoading(false);
        }
    }, [bloodGroup, radius]);

    const eligibleDonors = donors.filter(d => d.isEligible);

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <Navigation size={18} className="text-red-200" />
                        <span className="text-xs font-black text-red-200 uppercase tracking-widest">AI Proximity Matching</span>
                    </div>
                    <h2 className="text-2xl font-black mb-1">Find Donors Near You</h2>
                    <p className="text-sm text-red-200">Smart geo-matching with drive-time estimates &amp; eligibility checks.</p>
                </div>
            </div>

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={15} className="text-slate-400" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Search Filters</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Blood Group */}
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Blood Group</label>
                        <select
                            value={bloodGroup}
                            onChange={e => setBloodGroup(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-red-400 transition-all"
                        >
                            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>

                    {/* Radius */}
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Radius: <span className="text-red-500">{radius} km</span>
                        </label>
                        <input
                            type="range"
                            min={1} max={100} step={5}
                            value={radius}
                            onChange={e => setRadius(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-red-600"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold">
                            <span>1km</span><span>50km</span><span>100km</span>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg shadow-red-200 transition-all disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            {loading ? "Locating..." : "Search"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Error ──────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
                    <AlertCircle size={16} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* ── Results ────────────────────────────────────────────── */}
            {searched && !loading && !error && (
                <>
                    {/* Meta summary */}
                    {meta && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <Droplets size={14} className="text-red-500" />
                                <span className="text-sm font-black text-slate-700">{donors.length} donors found</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                <Zap size={14} className="text-emerald-600" />
                                <span className="text-sm font-black text-emerald-700">{eligibleDonors.length} ready now</span>
                            </div>
                        </div>
                    )}

                    {donors.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                            <MapPin size={40} className="text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-500">No donors found in this area.</p>
                            <p className="text-xs text-slate-400 mt-1">Try increasing the search radius.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {donors.map(donor => (
                                <DonorCard key={donor._id} donor={donor} onChat={onStartChat} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ── Empty State ─────────────────────────────────────────── */}
            {!searched && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Navigation size={28} className="text-red-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Set your filters and hit Search</p>
                    <p className="text-xs text-slate-400 mt-1">We'll use your GPS to find donors near you.</p>
                </div>
            )}
        </div>
    );
}
