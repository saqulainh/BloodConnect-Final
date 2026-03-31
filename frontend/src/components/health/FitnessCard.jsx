import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "../ui/Toast";

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`/api/v1${endpoint}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
};

// ── Score Circle ──────────────────────────────────────────────────────────────
function ScoreCircle({ score, ready }) {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black" style={{ color }}>{score}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">score</span>
            </div>
        </div>
    );
}

export default function FitnessCard() {
    const { success: toastSuccess, error: toastError } = useToast();
    const [form, setForm] = useState({ hemoglobin: "", weight: "", lastMealHoursAgo: "" });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.hemoglobin || !form.weight || form.lastMealHoursAgo === "") {
            toastError("Missing Fields", "Please fill all health fields.");
            return;
        }
        setLoading(true);
        try {
            const res = await apiFetch("/health-wallet/fitness-check", {
                method: "POST",
                body: JSON.stringify({
                    hemoglobin: parseFloat(form.hemoglobin),
                    weight: parseFloat(form.weight),
                    lastMealHoursAgo: parseFloat(form.lastMealHoursAgo),
                }),
            });
            setResult(res.data);
            if (res.data.ready) toastSuccess("You're Ready!", "Your health looks great for donation.");
        } catch (err) {
            toastError("Check Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={16} className="text-red-600" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800">Health Readiness Check</h3>
                    <p className="text-xs text-slate-400 font-medium">Check if you're fit to donate today</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Hemoglobin (g/dL)
                        </label>
                        <input
                            type="number" step="0.1" min="5" max="25"
                            placeholder="e.g. 13.5"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                            value={form.hemoglobin}
                            onChange={e => setForm({ ...form, hemoglobin: e.target.value })}
                        />
                        <p className="text-[9px] text-slate-400 mt-1">Min: 12.5 g/dL for donation</p>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Weight (kg)
                        </label>
                        <input
                            type="number" step="0.5" min="30" max="200"
                            placeholder="e.g. 65"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                            value={form.weight}
                            onChange={e => setForm({ ...form, weight: e.target.value })}
                        />
                        <p className="text-[9px] text-slate-400 mt-1">Min: 50 kg required</p>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Last Meal (hours ago)
                        </label>
                        <input
                            type="number" step="0.5" min="0" max="24"
                            placeholder="e.g. 2"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                            value={form.lastMealHoursAgo}
                            onChange={e => setForm({ ...form, lastMealHoursAgo: e.target.value })}
                        />
                        <p className="text-[9px] text-slate-400 mt-1">Ideal: 2–4 hours before donation</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Checking...
                        </span>
                    ) : "Check My Health Readiness"}
                </button>
            </form>

            {/* Result */}
            {result && (
                <div className={`mt-5 rounded-2xl border p-5 flex items-start gap-5 animate-in fade-in slide-in-from-bottom-3 duration-400 ${result.ready ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                    }`}>
                    <ScoreCircle score={result.fitnessScore} ready={result.ready} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {result.ready
                                ? <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                : <AlertTriangle size={18} className="text-red-500 shrink-0" />
                            }
                            <p className={`text-base font-black ${result.ready ? "text-emerald-800" : "text-red-800"}`}>
                                {result.ready ? "You're Ready to Donate! 🎉" : "Not Ready Yet"}
                            </p>
                        </div>

                        {result.warnings.length > 0 && (
                            <div className="space-y-1.5 mb-2">
                                {result.warnings.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                                        <span className="mt-0.5 shrink-0">⚠️</span>
                                        <span className="font-medium">{w}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {result.suggestions.length > 0 && (
                            <div className="space-y-1.5">
                                {result.suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                                        <span className="mt-0.5 shrink-0">💡</span>
                                        <span className="font-medium">{s}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
