import React, { useState, useEffect } from "react";
import {
    Siren, Droplets, MapPin, Clock, Phone,
    UserCheck, Loader2, AlertCircle, Send,
    RefreshCw, ChevronRight, Activity
} from "lucide-react";
import Pusher from "pusher-js";
import { broadcastSOS, getActiveSOSAlerts } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_STYLES = {
    Critical: "bg-red-600 text-white",
    Urgent: "bg-amber-500 text-white",
    Normal: "bg-slate-100 text-slate-600",
};

// ── Alert Card ─────────────────────────────────────────────────────────
const AlertCard = ({ alert, isNew = false }) => {
    const timeAgo = (date) => {
        const mins = Math.floor((Date.now() - new Date(date)) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <div className={`relative bg-white border-2 rounded-2xl p-4 transition-all duration-500 ${isNew ? "border-red-400 shadow-lg shadow-red-100 animate-in slide-in-from-top-3" : "border-slate-100 hover:border-red-200"}`}>
            {isNew && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full animate-bounce">
                    LIVE
                </div>
            )}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Blood group badge */}
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-200 flex-shrink-0">
                        {alert.bloodGroup}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-800">{alert.patientName || "Emergency Patient"}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${URGENCY_STYLES[alert.urgency] || URGENCY_STYLES.Urgent}`}>
                                {alert.urgency || "Urgent"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />
                            {alert.hospital}
                        </p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400 font-medium">{timeAgo(alert.createdAt || alert.timestamp)}</p>
                    <p className="text-xs font-bold text-red-600 mt-1">{alert.units} unit{alert.units !== 1 ? "s" : ""} needed</p>
                </div>
            </div>

            {alert.requesterPhone && (
                <a
                    href={`tel:${alert.requesterPhone}`}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-black transition-colors"
                >
                    <Phone size={12} />
                    Call {alert.requester || "Requester"}
                </a>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────
export default function SOSBroadcast() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        bloodGroup: "O+",
        hospital: "",
        patientName: "",
        message: "",
    });

    // ── Load active alerts ──────────────────────────────────────────
    const loadAlerts = async () => {
        setLoading(true);
        try {
            const res = await getActiveSOSAlerts();
            if (res?.success) setAlerts(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();

        // Subscribe to Pusher SOS channel for real-time alerts
        const pusherKey = import.meta.env.VITE_PUSHER_KEY || "b4ffc9b25b5577f690b4";
        const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || "ap2";

        const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
        const channel = pusher.subscribe("sos-alerts");

        channel.bind("new-sos", (data) => {
            setLiveAlerts(prev => [data, ...prev].slice(0, 5));
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe("sos-alerts");
        };
    }, []);

    // ── Broadcast SOS ───────────────────────────────────────────────
    const handleBroadcast = async () => {
        if (!form.hospital.trim()) return alert("Please enter the hospital name.");
        setBroadcasting(true);
        setBroadcastResult(null);
        try {
            let lat, lng;
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch { /* location optional */ }
            }
            const res = await broadcastSOS({ ...form, lat, lng });
            if (res?.success) {
                setBroadcastResult({ success: true, message: res.message, count: res.data?.donorCount || 0 });
                setShowForm(false);
                loadAlerts();
            } else {
                setBroadcastResult({ success: false, message: res?.message || "Broadcast failed" });
            }
        } catch (err) {
            setBroadcastResult({ success: false, message: err.message });
        } finally {
            setBroadcasting(false);
        }
    };

    const allAlerts = [...liveAlerts, ...alerts].slice(0, 20);

    return (
        <div className="space-y-6">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 to-red-950 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/20 to-transparent" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <span className="text-xs font-black text-red-300 uppercase tracking-widest">Emergency System</span>
                        </div>
                        <h2 className="text-2xl font-black">SOS Broadcast</h2>
                        <p className="text-sm text-slate-400 mt-1">Alert nearby donors instantly for critical requests.</p>
                    </div>
                    <Siren size={40} className="text-red-500 opacity-50" />
                </div>
            </div>

            {/* ── Broadcast Result ────────────────────────────────────── */}
            {broadcastResult && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium ${broadcastResult.success
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-red-50 border-red-100 text-red-700"
                    }`}>
                    {broadcastResult.success ? "✅" : "❌"}
                    <p>{broadcastResult.message}</p>
                </div>
            )}

            {/* ── Broadcast Button / Form ──────────────────────────────── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Send size={15} className="text-red-500" />
                        <p className="text-sm font-black text-slate-800">Send Emergency Alert</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${showForm ? "bg-slate-100 text-slate-600" : "bg-red-600 text-white shadow-md shadow-red-200"}`}
                    >
                        {showForm ? "Cancel" : "🚨 New SOS"}
                    </button>
                </div>

                {showForm && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Blood Group *</label>
                                <select
                                    value={form.bloodGroup}
                                    onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-red-400"
                                >
                                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    placeholder="Patient name"
                                    value={form.patientName}
                                    onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-red-400 font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hospital *</label>
                            <input
                                type="text"
                                placeholder="Hospital name and city"
                                value={form.hospital}
                                onChange={e => setForm(p => ({ ...p, hospital: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-red-400 font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Additional Message</label>
                            <textarea
                                placeholder="Any additional details..."
                                value={form.message}
                                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-red-400 font-medium resize-none"
                            />
                        </div>
                        <button
                            onClick={handleBroadcast}
                            disabled={broadcasting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm shadow-lg shadow-red-200 transition-all disabled:opacity-70"
                        >
                            {broadcasting ? <Loader2 size={16} className="animate-spin" /> : <Siren size={16} />}
                            {broadcasting ? "Broadcasting..." : "🚨 Broadcast SOS to Nearby Donors"}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Live Alert Feed ──────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity size={15} className="text-red-500" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                            Active Alerts
                            {liveAlerts.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-[9px] rounded-full font-black">
                                    {liveAlerts.length} LIVE
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={loadAlerts}
                        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <RefreshCw size={12} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 size={24} className="text-red-400 animate-spin" />
                    </div>
                ) : allAlerts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Siren size={32} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-400">No active emergency alerts</p>
                        <p className="text-xs text-slate-300 mt-1">All critical requests from the last 12 hours will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {liveAlerts.map((a, i) => <AlertCard key={`live-${i}`} alert={a} isNew={true} />)}
                        {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
