import React from "react";

// ── Badge tier visual config ──────────────────────────────────────────────────
const BADGE_VISUALS = {
    "Future Hero": { bg: "from-slate-100 to-slate-200", text: "text-slate-600", ring: "", glow: "" },
    "Bronze Lifesaver": { bg: "from-orange-300 to-amber-500", text: "text-white", ring: "ring-4 ring-orange-300/50", glow: "" },
    "Silver Lifesaver": { bg: "from-slate-300 to-slate-500", text: "text-white", ring: "ring-4 ring-slate-300/60", glow: "" },
    "Gold Lifesaver": { bg: "from-yellow-300 to-amber-500", text: "text-white", ring: "ring-4 ring-yellow-300/60", glow: "shadow-yellow-300/50 shadow-2xl" },
    "Platinum Lifesaver": { bg: "from-slate-200 to-slate-400", text: "text-slate-700", ring: "ring-4 ring-slate-200/60", glow: "shadow-slate-300/40 shadow-2xl" },
    "Hero of Humanity": { bg: "from-red-500 via-rose-600 to-red-800", text: "text-white", ring: "ring-4 ring-red-400/70", glow: "shadow-red-400/50 shadow-2xl" },
};

export default function BadgeCard({ badge, totalDonations, totalUnits }) {
    if (!badge) return null;

    const visual = BADGE_VISUALS[badge.badgeName] || BADGE_VISUALS["Future Hero"];
    const isHero = badge.badgeName === "Hero of Humanity";
    const isMaxed = badge.donationsToNext === 0 && badge.nextBadge === null;

    return (
        <div className={`relative bg-gradient-to-br ${visual.bg} ${visual.glow} rounded-3xl p-6 overflow-hidden`}>
            {/* Ambient shapes */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-4 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />

            {/* Hero gradient border animation */}
            {isHero && (
                <div
                    className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, #f00 0%, #e11d48 50%, #900 100%)", animation: "spin 4s linear infinite" }}
                />
            )}

            <div className="relative flex items-center gap-5">
                {/* Badge icon */}
                <div className={`w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-lg ${visual.ring}`}>
                    {badge.badgeEmoji}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-70 ${visual.text}`}>Donor Status</p>
                    <p className={`text-2xl font-black mt-0.5 ${visual.text}`}>{badge.badgeName}</p>
                    <p className={`text-sm mt-1 ${visual.text} opacity-80`}>
                        {totalDonations} donation{totalDonations !== 1 ? "s" : ""} • {totalUnits} units
                    </p>

                    {/* Progress to next badge */}
                    {!isMaxed && badge.nextBadge && (
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold opacity-70 ${visual.text}`}>
                                    {badge.donationsToNext} more to {badge.nextBadge}
                                </span>
                                <span className={`text-[10px] font-black opacity-80 ${visual.text}`}>
                                    {badge.progressPercentage}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white/80 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${badge.progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {isMaxed && (
                        <p className={`text-xs mt-2 font-black ${visual.text} opacity-80`}>
                            🏅 Maximum rank achieved!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
