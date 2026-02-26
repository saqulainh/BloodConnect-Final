import React, { useState, useEffect } from "react";
import {
    Heart, Droplets, Clock, Award, Calendar,
    Loader2, AlertCircle, ChevronRight, ShieldCheck,
    Activity, TrendingUp, Info
} from "lucide-react";
import { getMyDonations } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import BloodJourney from "./BloodJourney";

// ── Badge config ───────────────────────────────────────────────────────
const BADGES = [
    { min: 50, title: "Platinum Lifesaver", icon: "💍", color: "from-slate-700 to-slate-900", text: "text-slate-100" },
    { min: 25, title: "Gold Lifesaver", icon: "🏆", color: "from-yellow-400 to-amber-500", text: "text-white" },
    { min: 10, title: "Silver Hero", icon: "🥈", color: "from-slate-300 to-slate-400", text: "text-slate-800" },
    { min: 5, title: "Bronze Donor", icon: "🥉", color: "from-orange-400 to-orange-600", text: "text-white" },
    { min: 1, title: "First Timer", icon: "🦸", color: "from-red-400 to-red-600", text: "text-white" },
    { min: 0, title: "Future Hero", icon: "🌱", color: "from-slate-100 to-slate-200", text: "text-slate-500" },
];

const getBadge = (count) => BADGES.find(b => count >= b.min) || BADGES[BADGES.length - 1];

// ── Recovery tips ──────────────────────────────────────────────────────
const RECOVERY_TIPS = [
    { icon: "💧", title: "Stay Hydrated", tip: "Drink at least 8 glasses of water today and avoid alcohol for 24h after donation.", category: "Hydration" },
    { icon: "🥗", title: "Eat Iron-Rich Foods", tip: "Eat spinach, lentils, red meat, or fortified cereals to replenish iron levels.", category: "Nutrition" },
    { icon: "😴", title: "Rest Well", tip: "Avoid strenuous activity for 24 hours. Your body is working hard to replenish blood cells.", category: "Rest" },
    { icon: "🚫", title: "Avoid Smoking", tip: "Do not smoke for at least 3 hours after donating to ensure proper oxygen delivery.", category: "Safety" },
    { icon: "☀️", title: "Eat a Full Meal", tip: "Do not donate on an empty stomach. Have a wholesome meal 2-3 hours before next donation.", category: "Pre-Donation" },
    { icon: "🩺", title: "56-Day Rule", tip: "Wait at least 56 days (8 weeks) between whole blood donations for safe iron recovery.", category: "Safety" },
];

// ── NextDonationCountdown ──────────────────────────────────────────────
const NextDonation = ({ lastDonation }) => {
    if (!lastDonation) return (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-emerald-700">You're eligible to donate today!</p>
        </div>
    );

    const daysSince = Math.floor((Date.now() - new Date(lastDonation)) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 56 - daysSince);
    const nextDate = new Date(new Date(lastDonation).getTime() + 56 * 24 * 60 * 60 * 1000);
    const progress = Math.min(100, Math.round((daysSince / 56) * 100));

    if (daysRemaining === 0) return (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-emerald-700">✅ You're ready to donate again!</p>
        </div>
    );

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-slate-700">Recovery Progress</p>
                <p className="text-xs font-bold text-slate-400">
                    Eligible on {nextDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            </div>
            <div className="h-3 bg-slate-100 rounded-full mb-2">
                <div
                    className="h-3 rounded-full bg-gradient-to-r from-red-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Last: {new Date(lastDonation).toLocaleDateString("en-IN")}</span>
                <span className="text-amber-600">{daysRemaining} days remaining</span>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────
export default function HealthWallet() {
    const { user } = useAuth();
    const [data, setData] = useState({ records: [], totalDonations: 0, totalUnits: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trackingId, setTrackingId] = useState(null);
    const [activeTip, setActiveTip] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getMyDonations();
                if (res?.success) setData(res.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 size={32} className="text-red-500 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
            <AlertCircle size={16} />
            <p>{error}</p>
        </div>
    );

    const badge = getBadge(data.totalDonations);
    const livesSaved = data.totalDonations * 3;
    const nextBadge = BADGES.find(b => b.min > data.totalDonations && b.min > 0);
    const toNextBadge = nextBadge ? nextBadge.min - data.totalDonations : 0;

    return (
        <div className="space-y-6">

            {/* ── Hero Badge Card ────────────────────────────────────── */}
            <div className={`bg-gradient-to-br ${badge.color} rounded-3xl p-6 relative overflow-hidden`}>
                <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative flex items-center gap-5">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-lg">
                        {badge.icon}
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-70 ${badge.text}`}>Donor Status</p>
                        <p className={`text-2xl font-black ${badge.text}`}>{badge.title}</p>
                        <p className={`text-sm mt-1 ${badge.text} opacity-80`}>
                            {data.totalDonations} donation{data.totalDonations !== 1 ? "s" : ""} • {data.totalUnits} units
                        </p>
                        {toNextBadge > 0 && (
                            <p className={`text-xs mt-1 ${badge.text} opacity-60`}>
                                {toNextBadge} more to {BADGES.find(b => b.min === nextBadge?.min)?.title}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stats Row ──────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Droplets, label: "Donations", value: data.totalDonations, color: "text-red-600 bg-red-50" },
                    { icon: Activity, label: "Units Given", value: data.totalUnits, color: "text-blue-600 bg-blue-50" },
                    { icon: Heart, label: "Lives Saved*", value: livesSaved, color: "text-emerald-600 bg-emerald-50" },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                        <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                            <Icon size={16} />
                        </div>
                        <p className="text-2xl font-black text-slate-800">{value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    </div>
                ))}
            </div>

            {/* ── Recovery Tracker ────────────────────────────────────── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Clock size={15} className="text-slate-400" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Next Donation Eligibility</p>
                </div>
                <NextDonation lastDonation={user?.lastDonation} />
            </div>

            {/* ── Health Tips ─────────────────────────────────────────── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={15} className="text-slate-400" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Health &amp; Recovery Tips</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {RECOVERY_TIPS.map((tip, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTip(activeTip === i ? null : i)}
                            className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${activeTip === i ? "border-red-300 bg-red-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                        >
                            <div className="text-2xl mb-2">{tip.icon}</div>
                            <p className="text-xs font-black text-slate-800">{tip.title}</p>
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mt-0.5">{tip.category}</p>
                            {activeTip === i && (
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed animate-in slide-in-from-top-1 duration-200">
                                    {tip.tip}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Donation Timeline ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={15} className="text-slate-400" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Donation Timeline</p>
                </div>

                {data.records.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Heart size={32} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-400">No donations logged yet</p>
                        <p className="text-xs text-slate-300 mt-1">Your journey as a lifesaver starts now!</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-red-100 ml-4 space-y-5 pb-2">
                        {data.records.map((record, i) => (
                            <div key={record._id || i} className="relative pl-6">
                                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-[3px] border-red-500 shadow-sm" />
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-red-200 transition-colors">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{record.hospital}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {record.units} unit(s) → <strong>{record.patientName}</strong>
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                            {new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setTrackingId(trackingId === record._id ? null : record._id)}
                                        className={`mt-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${trackingId === record._id ? "bg-slate-800 text-white" : "bg-white text-red-600 border border-red-100 hover:bg-red-50"}`}
                                    >
                                        <Droplets size={10} className={trackingId === record._id ? "" : "animate-pulse"} />
                                        {trackingId === record._id ? "Hide Journey" : "Track Blood Journey"}
                                    </button>

                                    {trackingId === record._id && (
                                        <div className="mt-3 bg-white rounded-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                            <BloodJourney journey={record.journey} currentStage={record.currentStage} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="text-[9px] text-slate-300 mt-4 text-right">*Estimated based on 3 lives per donation (WHO guideline)</p>
            </div>
        </div>
    );
}
