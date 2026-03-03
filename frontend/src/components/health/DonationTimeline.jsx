import React, { useState } from "react";
import { Calendar, Droplets, Heart, CheckCircle, Clock, Plus, X, Loader2 } from "lucide-react";
import { useToast } from "../ui/Toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
    const map = {
        Donated: { bg: "bg-blue-100", text: "text-blue-700" },
        Recovery: { bg: "bg-amber-100", text: "text-amber-700" },
        Eligible: { bg: "bg-emerald-100", text: "text-emerald-700" },
    };
    const s = map[status] || map.Donated;
    return (
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

// ── Heart beat animation for "Life Saved" ─────────────────────────────────────
function HeartBeat() {
    return (
        <span
            className="inline-block"
            style={{ animation: "heartbeat 1.2s ease-in-out infinite" }}
        >❤️</span>
    );
}

// ── Log Donation Modal ────────────────────────────────────────────────────────
function LogModal({ onClose, onSaved }) {
    const { success, error } = useToast();
    const [form, setForm] = useState({ patientName: "", hospital: "", bloodGroup: "O+", units: 1, date: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("/api/v1/health-wallet/log-donation", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            success("Donation Logged!", "Your donation has been recorded.");
            onSaved();
        } catch (err) {
            error("Failed", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black">Log a Donation</h3>
                            <p className="text-red-200 text-sm mt-0.5">Every donation saves up to 3 lives</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Patient Name</label>
                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                            value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} placeholder="Patient's name" required />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Hospital</label>
                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                            value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} placeholder="Hospital / Blood bank" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Blood Group</label>
                            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Units</label>
                            <input type="number" min="1" max="5"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                value={form.units} onChange={e => setForm({ ...form, units: parseInt(e.target.value) })} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date of Donation</label>
                        <input type="date" max={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                            value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50">
                        {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Saving...</span> : "Log Donation"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Main Timeline Component ───────────────────────────────────────────────────
export default function DonationTimeline({ timeline = [], onRefresh }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-slate-400" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Donation Timeline 2.0</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                >
                    <Plus size={13} /> Log Donation
                </button>
            </div>

            {timeline.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Droplets size={26} className="text-red-300" />
                    </div>
                    <p className="text-sm font-black text-slate-500 mb-1">No donations logged yet</p>
                    <p className="text-xs text-slate-400 mb-5">Your life-saving journey starts with one donation.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        Log Your First Donation
                    </button>
                </div>
            ) : (
                <div className="relative border-l-2 border-red-100 ml-4 space-y-5 pb-2">
                    {timeline.map((record, i) => (
                        <div key={record._id || i} className="relative pl-6">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-[3px] shadow-sm ${record.currentStage === "Life Saved" ? "bg-emerald-400 border-emerald-600" : "bg-white border-red-500"
                                }`} />

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-red-200 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-black text-slate-800">{record.hospital}</p>
                                            <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{record.bloodGroup}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {record.units} unit{record.units !== 1 ? "s" : ""} → <strong>{record.patientName}</strong>
                                        </p>
                                        {record.currentStage === "Life Saved" && (
                                            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                                <HeartBeat /> Life Saved!
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                        <StatusPill status={record.status} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-[9px] text-slate-300 mt-4 text-right">*WHO: 1 donation = up to 3 lives</p>

            {showModal && (
                <LogModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => { setShowModal(false); onRefresh?.(); }}
                />
            )}
        </div>
    );
}
