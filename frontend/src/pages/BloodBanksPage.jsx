import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Building2,
    MapPin,
    Phone,
    Clock,
    Droplets,
    Search,
    Navigation,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    ExternalLink,
    Filter,
    HeartPulse,
    ChevronDown,
    ArrowLeft
} from "lucide-react";
import { getHospitals, getHospitalCities } from "../services/api";
import Footer from "../components/Footer";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CATEGORIES = ["All", "Government", "Private", "Red Cross", "Charitable", "Rotary"];

const getStockUnits = (hospital, bloodGroup) => {
    if (Array.isArray(hospital.bloodStock)) {
        return hospital.bloodStock.find((stock) => stock.bloodGroup === bloodGroup)?.units || 0;
    }
    return Number(hospital.bloodStock?.[bloodGroup] || 0);
};

const matchesCategory = (hospitalCategory, selectedCategory) => {
    if (selectedCategory === "All") return true;
    return hospitalCategory?.toLowerCase().startsWith(selectedCategory.toLowerCase());
};

export default function BloodBanksPage() {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    // Fetch cities and hospitals
    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [hospRes, citiesRes] = await Promise.all([
                getHospitals(),
                getHospitalCities().catch(() => ({ data: { data: [] } }))
            ]);

            const fetchedHospitals = hospRes.data?.data || hospRes.data || [];
            setHospitals(fetchedHospitals);

            const fetchedCities = citiesRes.data?.data || [];
            if (fetchedCities.length > 0) {
                setCities(["All", ...fetchedCities]);
            } else {
                // Fallback unique cities from hospital data
                const uniqueCities = Array.from(new Set(fetchedHospitals.map(h => h.city).filter(Boolean)));
                setCities(["All", ...(uniqueCities.length > 0 ? uniqueCities : ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kolkata"])]);
            }
        } catch (err) {
            console.error("Error loading blood bank data:", err);
            setError("Could not load hospital and blood bank data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter logic
    const filteredHospitals = useMemo(() => {
        return hospitals.filter((hospital) => {
            // Text search
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = hospital.name?.toLowerCase().includes(query);
                const matchCity = hospital.city?.toLowerCase().includes(query);
                const matchAddress = hospital.address?.toLowerCase().includes(query);
                if (!matchName && !matchCity && !matchAddress) return false;
            }

            // City filter
            if (selectedCity !== "All" && hospital.city?.toLowerCase() !== selectedCity.toLowerCase()) {
                return false;
            }

            // Category filter
            if (!matchesCategory(hospital.category, selectedCategory)) {
                return false;
            }

            // Verified filter
            if (verifiedOnly && !hospital.isVerified) {
                return false;
            }

            // Blood group stock filter
            if (selectedBloodGroup !== "All") {
                if (getStockUnits(hospital, selectedBloodGroup) <= 0) return false;
            }

            return true;
        });
    }, [hospitals, searchQuery, selectedCity, selectedCategory, selectedBloodGroup, verifiedOnly]);

    // Stock level badge styling helper
    const getStockStatus = (units) => {
        if (units >= 15) {
            return {
                bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                dot: "bg-emerald-500",
                label: "High"
            };
        } else if (units >= 5) {
            return {
                bg: "bg-amber-50 text-amber-700 border-amber-200",
                dot: "bg-amber-500",
                label: "Moderate"
            };
        } else if (units > 0) {
            return {
                bg: "bg-rose-50 text-rose-700 border-rose-200",
                dot: "bg-rose-500 animate-pulse",
                label: "Critical"
            };
        }
        return {
            bg: "bg-slate-50 text-slate-400 border-slate-200",
            dot: "bg-slate-300",
            label: "Depleted"
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
            {/* ── HERO BANNER ── */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-red-900/30">
                <div className="max-w-6xl mx-auto">
                    {/* Top bar / Back navigation */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                Live Stock Sync
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-bold tracking-wide uppercase mb-4 border border-red-500/30">
                            <Building2 className="w-3.5 h-3.5" /> Institutional Network
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
                            Verified Hospital & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-200">Blood Bank Directory</span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6">
                            Instant access to emergency blood reserves, licensed blood banks, and government medical centers with live inventory across India.
                        </p>

                        {/* Quick highlights */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-3xl mx-auto pt-2">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-xs text-slate-400 font-medium">Verified Centers</p>
                                <p className="text-lg font-bold text-white mt-0.5">50+ Network</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-xs text-slate-400 font-medium">Availability</p>
                                <p className="text-lg font-bold text-emerald-400 mt-0.5">24/7 Ready</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-xs text-slate-400 font-medium">Accreditation</p>
                                <p className="text-lg font-bold text-white mt-0.5">NABH & NACO</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-xs text-slate-400 font-medium">Contact Action</p>
                                <p className="text-lg font-bold text-red-400 mt-0.5">1-Tap Direct Call</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SEARCH & FILTER CONTROLS ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 transition-all">
                    {/* Search Row */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                        {/* Keyword Search */}
                        <div className="md:col-span-6 relative">
                            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by hospital name, area, or locality..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* City Dropdown */}
                        <div className="md:col-span-3 relative">
                            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer transition-all"
                            >
                                <option value="All">All Cities</option>
                                {cities.filter(c => c !== "All").map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Category Dropdown */}
                        <div className="md:col-span-3 relative">
                            <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer transition-all"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat} Facilities</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Blood Group Filter Chips */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                                <Droplets className="w-3.5 h-3.5 text-red-600" /> Required Group:
                            </span>
                            <button
                                onClick={() => setSelectedBloodGroup("All")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedBloodGroup === "All"
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                Any
                            </button>
                            {BLOOD_GROUPS.map((group) => (
                                <button
                                    key={group}
                                    onClick={() => setSelectedBloodGroup(group)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedBloodGroup === group
                                        ? "bg-red-600 text-white shadow-md ring-2 ring-red-400/50"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>

                        {/* Verified toggle & Refresh */}
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                                />
                                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Only
                                </span>
                            </label>

                            <button
                                onClick={fetchData}
                                title="Refresh directory data"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── EMERGENCY NOTICE & DONOR REDIRECT ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-xl text-red-600 flex-shrink-0 mt-0.5">
                            <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-red-950">Patient Emergency Guidance</h4>
                            <p className="text-xs text-red-800/90 mt-0.5 max-w-2xl">
                                Hospital blood banks issue blood units against a doctor's requisition form. In case specific rare units are exhausted, you can also search our voluntary individual donor network.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/find-donors"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex-shrink-0"
                    >
                        Search Individual Donors <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── HOSPITAL DIRECTORY LIST ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Result count & active filter labels */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Found <span className="text-slate-900">{filteredHospitals.length}</span> Medical Institutions
                        {selectedCity !== "All" && ` in ${selectedCity}`}
                        {selectedCategory !== "All" && ` (${selectedCategory})`}
                        {selectedBloodGroup !== "All" && ` with ${selectedBloodGroup} Stock`}
                    </p>
                    {(searchQuery || selectedCity !== "All" || selectedCategory !== "All" || selectedBloodGroup !== "All" || verifiedOnly) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCity("All");
                                setSelectedCategory("All");
                                setSelectedBloodGroup("All");
                                setVerifiedOnly(false);
                            }}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-bold text-slate-500">Loading verified hospital stock across India...</p>
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-8">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-red-800">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                        >
                            Retry Loading
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredHospitals.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-4 shadow-sm">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No Hospitals or Blood Banks Match Your Search</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Try broadening your filters, choosing a different city, or resetting the blood group requirement.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCity("All");
                                setSelectedCategory("All");
                                setSelectedBloodGroup("All");
                                setVerifiedOnly(false);
                            }}
                            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                        >
                            Show All Institutions
                        </button>
                    </div>
                )}

                {/* Hospital Cards Grid */}
                {!loading && !error && filteredHospitals.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {filteredHospitals.map((hospital) => {
                            const mapUrl = hospital.location?.coordinates
                                ? `https://www.google.com/maps/search/?api=1&query=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + " " + hospital.address + " " + hospital.city)}`;

                            return (
                                <div
                                    key={hospital._id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                                >
                                    {/* Card Header & Details */}
                                    <div className="p-5 sm:p-6">
                                        {/* Top Badges */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                                    {hospital.category || "Hospital"}
                                                </span>
                                                {hospital.isVerified && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                                        Verified
                                                    </span>
                                                )}
                                                {hospital.accreditation && (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                                                        {hospital.accreditation}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                {hospital.operatingHours || "24/7 Service"}
                                            </div>
                                        </div>

                                        {/* Hospital Title */}
                                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                                            {hospital.name}
                                        </h3>

                                        {/* Address */}
                                        <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                            <span>{hospital.address}, {hospital.city}, {hospital.state} {hospital.pincode}</span>
                                        </div>

                                        {/* ── LIVE STOCK INVENTORY SECTION ── */}
                                        <div className="mt-5 pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Droplets className="w-4 h-4 text-red-600" />
                                                    <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                                                        Live Blood Stock Units
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    Updated {new Date(hospital.updatedAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>

                                            {/* Blood Stock Chips Grid */}
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                                                {BLOOD_GROUPS.map((group) => {
                                                    const units = getStockUnits(hospital, group);
                                                    const status = getStockStatus(units);
                                                    const isHighlight = selectedBloodGroup === group;

                                                    return (
                                                        <div
                                                            key={group}
                                                            className={`p-2 rounded-xl border text-center transition-all ${status.bg} ${isHighlight ? "ring-2 ring-red-500 shadow-sm" : ""
                                                                }`}
                                                            title={`${group}: ${units} Units available (${status.label})`}
                                                        >
                                                            <div className="text-xs font-black tracking-tight">{group}</div>
                                                            <div className="text-sm font-extrabold mt-0.5 leading-none">{units}</div>
                                                            <div className="text-[9px] font-medium tracking-tighter opacity-80 mt-1 uppercase">
                                                                {units === 1 ? "Unit" : "Units"}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                                        <div className="text-[11px] text-slate-500 font-medium truncate">
                                            {hospital.emergencyNumber
                                                ? `Emergency: ${hospital.emergencyNumber}`
                                                : `Call: ${hospital.contactNumber || hospital.phone || "Unavailable"}`}
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Google Maps Directions */}
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                                            >
                                                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                                Directions
                                            </a>

                                            {/* Direct Phone Call */}
                                            <a
                                                href={`tel:${hospital.emergencyNumber || hospital.contactNumber || hospital.phone || ""}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                                Call Bank
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
