import React, { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Heart, Droplets, TrendingUp, ShieldCheck, Calendar } from "lucide-react";
import BadgeCard from "../health/BadgeCard";
import ImpactCard from "../health/ImpactCard";
import EligibilityCard from "../health/EligibilityCard";
import FitnessCard from "../health/FitnessCard";
import DonationTimeline from "../health/DonationTimeline";
import DonationChart from "../health/DonationChart";

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={15} className="text-red-500" />
            </div>
            <div>
                <p className="text-sm font-black text-slate-800">{title}</p>
                {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
}

// ── Recovery Tips ─────────────────────────────────────────────────────────────
const RECOVERY_TIPS = [
    { icon: "💧", title: "Stay Hydrated", tip: "Drink at least 8 glasses of water today and avoid alcohol for 24h after donation.", category: "Hydration" },
    { icon: "🥗", title: "Eat Iron-Rich Foods", tip: "Eat spinach, lentils, red meat, or fortified cereals to replenish iron levels.", category: "Nutrition" },
    { icon: "😴", title: "Rest Well", tip: "Avoid strenuous activity for 24 hours. Your body is working hard to replenish blood cells.", category: "Rest" },
    { icon: "🚫", title: "Avoid Smoking", tip: "Do not smoke for at least 3 hours after donating to ensure proper oxygen delivery.", category: "Safety" },
    { icon: "☀️", title: "Eat a Full Meal", tip: "Do not donate on an empty stomach. Have a wholesome meal 2–3 hours before next donation.", category: "Pre-Donation" },
    { icon: "🩺", title: "56-Day Rule", tip: "Wait at least 56 days (8 weeks) between whole blood donations for safe iron recovery.", category: "Safety" },
];

function RecoveryTips() {
    const [activeTip, setActiveTip] = useState(null);
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RECOVERY_TIPS.map((tip, i) => (
                <button
                    key={i}
                    onClick={() => setActiveTip(activeTip === i ? null : i)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${activeTip === i
                            ? "border-red-300 bg-red-50"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                >
                    <div className="text-2xl mb-2">{tip.icon}</div>
                    <p className="text-xs font-black text-slate-800">{tip.title}</p>
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mt-0.5">{tip.category}</p>
                    {activeTip === i && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            {tip.tip}
                        </p>
                    )}
                </button>
            ))}
        </div>
    );
}

// ── Main HealthWallet 2.0 ─────────────────────────────────────────────────────
export default function HealthWallet() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("/api/v1/health-wallet/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to load health wallet.");
            setStats(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // ── Loading State ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="text-red-500 animate-spin" />
                <p className="text-sm font-bold text-slate-400">Loading your Health Wallet…</p>
            </div>
        );
    }

    // ── Error State ───────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                <div>
                    <p className="font-black">Failed to load Health Wallet</p>
                    <p className="text-xs mt-0.5 opacity-80">{error}</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const {
        totalDonations,
        totalUnits,
        livesSaved,
        impactScore,
        badge,
        eligibility,
        streak,
        longestStreak,
        chartData,
        timeline,
    } = stats;

    return (
        <div className="space-y-6">

            {/* ── 1. Donor Rank / Badge Card ──────────────────────────── */}
            <BadgeCard
                badge={badge}
                totalDonations={totalDonations}
                totalUnits={totalUnits}
            />

            {/* ── 2. Impact Stats + Streak ────────────────────────────── */}
            <div>
                <SectionHeader
                    icon={Heart}
                    title="Your Real-World Impact"
                    subtitle="Every unit you donate changes lives"
                />
                <ImpactCard
                    totalDonations={totalDonations}
                    totalUnits={totalUnits}
                    livesSaved={livesSaved}
                    impactScore={impactScore}
                    streak={streak}
                    longestStreak={longestStreak}
                />
            </div>

            {/* ── 3. Smart Eligibility Banner ─────────────────────────── */}
            <div>
                <SectionHeader
                    icon={Calendar}
                    title="Donation Eligibility"
                    subtitle="Real-time eligibility based on 56-day rule"
                />
                <EligibilityCard eligibility={eligibility} />
            </div>

            {/* ── 4. Contribution Growth Chart ────────────────────────── */}
            <DonationChart chartData={chartData} />

            {/* ── 5. Donation Timeline 2.0 ────────────────────────────── */}
            <div>
                <SectionHeader
                    icon={Droplets}
                    title="Donation Timeline 2.0"
                    subtitle="Your full donation history with blood journey tracking"
                />
                <DonationTimeline timeline={timeline} onRefresh={fetchStats} />
            </div>

            {/* ── 6. Health Readiness Check ───────────────────────────── */}
            <div>
                <SectionHeader
                    icon={ShieldCheck}
                    title="Pre-Donation Health Check"
                    subtitle="Verify your fitness before heading to the donation centre"
                />
                <FitnessCard />
            </div>

            {/* ── 7. Recovery Tips ────────────────────────────────────── */}
            <div>
                <SectionHeader
                    icon={TrendingUp}
                    title="Health & Recovery Tips"
                    subtitle="Tap any card to expand"
                />
                <RecoveryTips />
            </div>

        </div>
    );
}
