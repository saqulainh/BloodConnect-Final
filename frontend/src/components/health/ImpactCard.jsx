import React, { useState, useEffect, useRef } from "react";
import { Heart, Zap, Trophy, Flame } from "lucide-react";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useAnimatedCount(target, duration = 1500) {
    const [count, setCount] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
        let start = null;
        const startVal = 0;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * (target - startVal) + startVal));
            if (progress < 1) frameRef.current = requestAnimationFrame(step);
        };
        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration]);

    return count;
}

function StatCard({ icon: Icon, label, value, color, suffix = "" }) {
    const animated = useAnimatedCount(value);
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} />
            </div>
            <p className="text-2xl font-black text-slate-800">{animated}{suffix}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
        </div>
    );
}

export default function ImpactCard({ totalDonations, totalUnits, livesSaved, impactScore, streak, longestStreak }) {
    return (
        <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Heart} label="Donations" value={totalDonations} color="text-red-600 bg-red-50" />
                <StatCard icon={Zap} label="Units Given" value={totalUnits} color="text-blue-600 bg-blue-50" />
                <StatCard icon={Heart} label="Lives Saved" value={livesSaved} color="text-emerald-600 bg-emerald-50" />
                <StatCard icon={Trophy} label="Impact Score" value={impactScore} color="text-purple-600 bg-purple-50" />
            </div>

            {/* Streak Card */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                        🔥
                    </div>
                    <div>
                        <p className="text-xs font-black text-orange-100 uppercase tracking-widest">Donation Streak</p>
                        <p className="text-2xl font-black text-white">
                            {streak} {streak === 1 ? "Streak" : "Streak"}
                        </p>
                        {streak > 0 && (
                            <p className="text-xs text-orange-200 font-medium">Keep it up! 🎯</p>
                        )}
                        {streak === 0 && (
                            <p className="text-xs text-orange-200 font-medium">Donate regularly to build a streak</p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-orange-200 font-bold uppercase">Best</p>
                    <p className="text-xl font-black text-white">{longestStreak}</p>
                </div>
            </div>

            {/* Impact breakdown note */}
            <p className="text-[9px] text-slate-300 text-right">
                *Lives saved = units × 3 (WHO) | Impact Score = (donations × 10) + (units × 5)
            </p>
        </div>
    );
}
