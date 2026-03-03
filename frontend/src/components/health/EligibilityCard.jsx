import React from "react";
import { CheckCircle, Clock, Calendar } from "lucide-react";

// ── Circular progress SVG ─────────────────────────────────────────────────────
function CircularProgress({ percent, days, eligible }) {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                {/* Progress */}
                <circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke={eligible ? "#10b981" : "#f59e0b"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {eligible ? (
                    <CheckCircle size={24} className="text-emerald-500" />
                ) : (
                    <>
                        <span className="text-2xl font-black text-amber-600 leading-none">{days}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">days</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default function EligibilityCard({ eligibility }) {
    if (!eligibility) return null;

    const { eligible, remainingDays, nextEligibleDate, progressPercent } = eligibility;

    return (
        <div className={`rounded-2xl border p-5 ${eligible
            ? "bg-emerald-50 border-emerald-100"
            : "bg-amber-50 border-amber-100"
            }`}>
            <div className="flex items-center gap-4">
                <CircularProgress percent={progressPercent} days={remainingDays} eligible={eligible} />

                <div className="flex-1 min-w-0">
                    {eligible ? (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Eligible Now</p>
                            </div>
                            <p className="text-lg font-black text-emerald-800">Ready to Donate! 🎉</p>
                            <p className="text-sm text-emerald-600 mt-1 font-medium">You can save lives today. Your body is ready.</p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={12} className="text-amber-500" />
                                <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Recovery Mode</p>
                            </div>
                            <p className="text-lg font-black text-amber-800">
                                {remainingDays} day{remainingDays !== 1 ? "s" : ""} to go
                            </p>
                            <p className="text-sm text-amber-600 mt-1 font-medium">
                                You can donate again in {remainingDays} day{remainingDays !== 1 ? "s" : ""}.
                            </p>
                            {nextEligibleDate && (
                                <div className="flex items-center gap-1 mt-2">
                                    <Calendar size={11} className="text-amber-500" />
                                    <p className="text-xs font-bold text-amber-600">
                                        Eligible on {new Date(nextEligibleDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {!eligible && (
                <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-amber-600 mb-1">
                        <span>Recovery Progress</span>
                        <span>{progressPercent}% recovered</span>
                    </div>
                    <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
