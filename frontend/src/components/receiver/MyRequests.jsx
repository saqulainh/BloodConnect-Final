import React, { useState, useEffect, useCallback } from 'react';
import {
    MapPin, X, AlertCircle, Loader2, MessageCircle, Edit, Trash2,
    Plus, CheckCircle2, Clock, Filter, Heart, ChevronDown, ChevronUp,
    Phone, FileText, Droplets, ArrowUpDown, RefreshCw, Ban, Info,
    SortAsc, Calendar, Zap, Eye
} from 'lucide-react';
import {
    createBloodRequest, getCurrentLocation, getMyReceiverRequests,
    updateBloodRequest, deleteBloodRequest, sendGratitudeTodonor,
    cancelBloodRequest
} from '../../services/api';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCIES    = ["Normal", "Urgent", "Critical"];

// ─────────────────────────────────────────────────────────────────────────────
// Request Form Modal
// ─────────────────────────────────────────────────────────────────────────────
const RequestForm = ({ onClose, initialData = null }) => {
    const [form, setForm] = useState({
        patientName:  initialData?.patientName  || '',
        bloodGroup:   initialData?.bloodGroup   || '',
        hospital:     initialData?.hospital     || '',
        urgency:      initialData?.urgency      || 'Normal',
        units:        initialData?.units        || 1,
        description:  initialData?.description  || '',
        contactPhone: initialData?.contactPhone || '',
        city:         initialData?.city         || '',
    });
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const [locating, setLocating] = useState(false);
    const [locText,  setLocText]  = useState('');

    const autoLocate = async () => {
        setLocating(true);
        try {
            const loc = await getCurrentLocation();
            setLocText(`📍 GPS: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
            setForm(f => ({ ...f, _lat: loc.lat, _lng: loc.lng }));
        } catch { setLocText('⚠️ Location unavailable'); }
        finally   { setLocating(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bloodGroup) { setError('Please select a blood group.'); return; }
        setLoading(true); setError('');
        try {
            let lat, lng;
            if (form._lat) { lat = form._lat; lng = form._lng; }
            else {
                try { const loc = await getCurrentLocation(); lat = loc.lat; lng = loc.lng; }
                catch { /* geo optional */ }
            }
            const payload = { ...form, ...(lat ? { lat, lng } : {}) };
            delete payload._lat; delete payload._lng;

            if (initialData?._id) await updateBloodRequest(initialData._id, payload);
            else                   await createBloodRequest(payload);
            onClose(true);
        } catch (err) {
            setError(err.message || 'Failed to save request');
        } finally { setLoading(false); }
    };

    const urgencyColors = { Normal: 'bg-slate-100 text-slate-700', Urgent: 'bg-amber-100 text-amber-700', Critical: 'bg-red-100 text-red-700' };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => onClose(false)} />
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                            <Droplets size={20} color="white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">{initialData ? 'Edit Request' : 'New Blood Request'}</h3>
                            <p className="text-xs text-slate-400 font-medium">Fill in patient details carefully</p>
                        </div>
                    </div>
                    <button onClick={() => onClose(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    {/* Patient Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Patient Name *</label>
                        <input type="text" required value={form.patientName}
                            onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
                            placeholder="Patient's full name" />
                    </div>

                    {/* Blood Group */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Blood Group *</label>
                        <div className="grid grid-cols-4 gap-2">
                            {BLOOD_GROUPS.map(bg => (
                                <button key={bg} type="button" onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                                    className={`py-2.5 rounded-xl text-sm font-black transition-all ${form.bloodGroup === bg ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105' : 'bg-slate-50 text-slate-600 hover:bg-red-50 border border-slate-200'}`}>
                                    {bg}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hospital + City */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Hospital *</label>
                            <input type="text" required value={form.hospital}
                                onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
                                placeholder="Hospital name" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">City</label>
                            <input type="text" value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
                                placeholder="City" />
                        </div>
                    </div>

                    {/* Urgency + Units */}
                    <div className="grid grid-cols-3 gap-3">
                        {URGENCIES.map(u => (
                            <button key={u} type="button" onClick={() => setForm(f => ({ ...f, urgency: u }))}
                                className={`py-2.5 px-3 rounded-xl text-sm font-black transition-all border ${form.urgency === u ? urgencyColors[u] + ' border-current shadow-sm scale-105' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                                {u === 'Critical' ? '🔴' : u === 'Urgent' ? '🟠' : '🟢'} {u}
                            </button>
                        ))}
                    </div>

                    {/* Units */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Units Required *</label>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setForm(f => ({ ...f, units: Math.max(1, f.units - 1) }))}
                                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black hover:bg-red-100 hover:text-red-600 transition">−</button>
                            <span className="text-2xl font-black text-slate-800 w-8 text-center">{form.units}</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, units: Math.min(10, f.units + 1) }))}
                                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black hover:bg-red-100 hover:text-red-600 transition">+</button>
                            <span className="text-xs text-slate-400 font-medium">unit{form.units > 1 ? 's' : ''} of blood</span>
                        </div>
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Emergency Contact</label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="tel" value={form.contactPhone}
                                onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
                                placeholder="+91 98765 43210" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Additional Notes</label>
                        <textarea rows={2} value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none transition"
                            placeholder="Any additional context about the patient or requirement..." />
                    </div>

                    {/* GPS Location */}
                    <button type="button" onClick={autoLocate} disabled={locating}
                        className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition disabled:opacity-50">
                        {locating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                        {locText || 'Auto-detect my location'}
                    </button>

                    {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl flex items-center gap-2"><AlertCircle size={12} />{error}</p>}

                    <button type="submit" disabled={loading || !form.bloodGroup}
                        className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-black rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-200 mt-2">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Droplets size={18} />}
                        {loading ? 'Submitting...' : initialData ? 'Update Request' : 'Submit Blood Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Cancel Modal
// ─────────────────────────────────────────────────────────────────────────────
const CancelModal = ({ req, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const REASONS = [
        "Found a donor through other means",
        "Patient condition improved",
        "Hospital has sufficient stock now",
        "Request submitted by mistake",
        "Other",
    ];

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(req._id, reason);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Ban size={18} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Cancel Request</h3>
                        <p className="text-xs text-slate-400 font-medium">For {req.patientName} — {req.bloodGroup}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 font-medium">Please provide a reason for cancellation:</p>
                    <div className="space-y-2">
                        {REASONS.map(r => (
                            <button key={r} type="button" onClick={() => setReason(r)}
                                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all ${reason === r ? 'bg-amber-50 text-amber-700 border-2 border-amber-300' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Or write a custom reason..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 resize-none" />
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Keep Request</button>
                        <button onClick={handleConfirm} disabled={loading || !reason.trim()}
                            className="flex-1 py-3 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                            Cancel Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Request Card
// ─────────────────────────────────────────────────────────────────────────────
const RequestCard = ({ req, onEdit, onDelete, onCancel, onGratitude, onStartChat, onViewTimeline, gratSending }) => {
    const [expanded, setExpanded] = useState(false);

    const isFulfilled = req.status === 'Completed' || req.status === 'resolved';
    const isCancelled = req.status === 'Cancelled';
    const isActive    = req.status === 'Active'    || req.status === 'active';

    const urgencyMeta = {
        Critical: { bg: 'bg-red-600',    text: 'text-white', label: '🔴 CRITICAL', bar: 'bg-red-500',  pulse: true  },
        Urgent:   { bg: 'bg-amber-500',  text: 'text-white', label: '🟠 URGENT',   bar: 'bg-amber-400', pulse: false },
        Normal:   { bg: 'bg-slate-200',  text: 'text-slate-700', label: '🟢 Normal', bar: 'bg-slate-300', pulse: false },
    };
    const meta = urgencyMeta[req.urgency] || urgencyMeta.Normal;

    const statusStyles = {
        Active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
        active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
        Completed: 'bg-blue-100 text-blue-700 border-blue-200',
        resolved:  'bg-blue-100 text-blue-700 border-blue-200',
        Cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
    };

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60)   return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        if (s < 86400)return `${Math.floor(s/3600)}h ago`;
        return `${Math.floor(s/86400)}d ago`;
    };

    return (
        <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group ${isCancelled ? 'border-slate-200 opacity-70' : 'border-slate-100'}`}>
            {/* Urgency top bar */}
            {isActive && (
                <div className={`h-1 w-full ${meta.bar} ${meta.pulse ? 'animate-pulse' : ''}`} />
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md ${isCancelled ? 'bg-slate-400' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
                            {req.bloodGroup}
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 leading-tight">{req.patientName}</h4>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />{req.hospital}{req.city ? `, ${req.city}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${meta.bg} ${meta.text}`}>
                            {meta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{timeAgo(req.createdAt)}</span>
                    </div>
                </div>

                {/* Status + Units Row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusStyles[req.status] || statusStyles.Active}`}>
                        {isFulfilled ? '✅ Fulfilled' : isCancelled ? '🚫 Cancelled' : '⏳ Active'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                        <Droplets size={9} className="inline mr-1" />{req.units} unit{req.units > 1 ? 's' : ''}
                    </span>
                    {req.contactPhone && (
                        <a href={`tel:${req.contactPhone}`} className="text-[10px] text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition">
                            <Phone size={9} />{req.contactPhone}
                        </a>
                    )}
                </div>

                {/* Donor info for fulfilled */}
                {isFulfilled && req.fulfilledBy && (
                    <div className="bg-rose-50 rounded-xl p-3 mb-3 flex items-center justify-between border border-rose-100">
                        <div className="flex items-center gap-2">
                            {req.fulfilledBy.profilePicture ? (
                                <img src={req.fulfilledBy.profilePicture} alt={req.fulfilledBy.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white text-xs font-black">
                                    {req.fulfilledBy.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-black text-rose-800">{req.fulfilledBy.name}</p>
                                <p className="text-[10px] text-rose-600">{req.fulfilledBy.bloodGroup} donor</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {onStartChat && (
                                <button onClick={() => onStartChat(req.fulfilledBy)}
                                    className="px-2.5 py-1.5 bg-white text-rose-600 border border-rose-200 text-[10px] font-black rounded-lg hover:bg-rose-50 transition flex items-center gap-1">
                                    <MessageCircle size={10} /> Chat
                                </button>
                            )}
                            <button onClick={() => onGratitude(req)} disabled={gratSending === req._id}
                                className="px-2.5 py-1.5 bg-rose-600 text-white text-[10px] font-black rounded-lg hover:bg-rose-700 transition flex items-center gap-1 disabled:opacity-50">
                                <Heart size={10} /> {gratSending === req._id ? '...' : 'Thanks'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Cancelled info */}
                {isCancelled && req.cancelledReason && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs text-slate-500 font-medium border border-slate-200 flex items-start gap-2">
                        <Info size={12} className="mt-0.5 shrink-0 text-slate-400" />
                        <span>Cancelled: {req.cancelledReason}</span>
                    </div>
                )}

                {/* Expandable description */}
                {req.description && (
                    <div className="mb-3">
                        <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-400 font-bold flex items-center gap-1 hover:text-slate-600 transition">
                            <FileText size={10} /> {expanded ? 'Hide' : 'Show'} notes
                            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                        {expanded && (
                            <p className="mt-2 text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                                {req.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => onViewTimeline(req)}
                        className="flex-1 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1 border border-slate-200">
                        <Eye size={12} /> Timeline
                    </button>

                    {isActive && (
                        <>
                            <button onClick={() => onEdit(req)}
                                className="flex-1 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-1 border border-blue-200">
                                <Edit size={12} /> Edit
                            </button>
                            <button onClick={() => onCancel(req)}
                                className="flex-1 py-2 bg-amber-50 text-amber-600 text-xs font-bold rounded-xl hover:bg-amber-100 transition flex items-center justify-center gap-1 border border-amber-200">
                                <Ban size={12} /> Cancel
                            </button>
                            <button onClick={() => onDelete(req._id)}
                                className="py-2 px-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-1 border border-red-200">
                                <Trash2 size={12} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main MyRequests Component
// ─────────────────────────────────────────────────────────────────────────────
const MyRequests = ({ onStartChat, onViewTimeline }) => {
    const [requests,    setRequests]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [refreshing,  setRefreshing]  = useState(false);
    const [showForm,    setShowForm]    = useState(false);
    const [editData,    setEditData]    = useState(null);
    const [cancelReq,   setCancelReq]   = useState(null);
    const [gratSending, setGratSending] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter]   = useState('All');
    const [sortBy,       setSortBy]         = useState('newest');
    const [bgFilter,     setBgFilter]       = useState('All');
    const [showFilters,  setShowFilters]    = useState(false);

    const fetchRequests = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else          setRefreshing(true);
        try {
            const params = {};
            if (statusFilter !== 'All') params.status = statusFilter;
            if (bgFilter !== 'All')     params.bloodGroup = bgFilter;
            if (sortBy)                 params.sort = sortBy;

            const res = await getMyReceiverRequests(params);
            if (res?.success) setRequests(res.data || []);
        } catch (err) { console.error("Error fetching requests:", err); }
        finally { setLoading(false); setRefreshing(false); }
    }, [statusFilter, bgFilter, sortBy]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    // Auto-refresh every 30s for active requests
    useEffect(() => {
        const timer = setInterval(() => fetchRequests(true), 30_000);
        return () => clearInterval(timer);
    }, [fetchRequests]);

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this request?')) return;
        try {
            await deleteBloodRequest(id);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleCancelConfirm = async (id, reason) => {
        try {
            await cancelBloodRequest(id, reason);
            setCancelReq(null);
            fetchRequests(true);
        } catch (err) { console.error("Cancel error:", err); }
    };

    const handleGratitude = async (req) => {
        if (!req.fulfilledBy?._id) return;
        setGratSending(req._id);
        try {
            await sendGratitudeTodonor({ requestId: req._id, donorId: req.fulfilledBy._id });
        } catch (err) { console.error("Gratitude error:", err); }
        finally { setGratSending(null); }
    };

    const handleFormClose = (refresh) => {
        setShowForm(false);
        setEditData(null);
        if (refresh) fetchRequests(true);
    };

    const handleViewTimeline = (req) => {
        if (onViewTimeline) onViewTimeline(req);
    };

    // Stats summary
    const activeCount    = requests.filter(r => r.status === 'Active' || r.status === 'active').length;
    const fulfilledCount = requests.filter(r => r.status === 'Completed' || r.status === 'resolved').length;
    const cancelledCount = requests.filter(r => r.status === 'Cancelled').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">My Blood Requests</h2>
                    <p className="text-sm text-slate-400 font-medium">
                        {requests.length} total · {activeCount} active · {fulfilledCount} fulfilled
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchRequests(true)} disabled={refreshing}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 border rounded-xl transition flex items-center gap-1.5 text-xs font-bold ${showFilters ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <Filter size={14} /> Filters
                    </button>
                    <button onClick={() => { setEditData(null); setShowForm(true); }}
                        className="px-5 py-2.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2">
                        <Plus size={16} /> New Request
                    </button>
                </div>
            </div>

            {/* Summary stat pills */}
            <div className="flex gap-3 flex-wrap">
                {[
                    { label: 'Active', count: activeCount, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Fulfilled', count: fulfilledCount, color: 'bg-blue-100 text-blue-700' },
                    { label: 'Cancelled', count: cancelledCount, color: 'bg-slate-100 text-slate-500' },
                ].map(({ label, count, color }) => (
                    <div key={label} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${color}`}>
                        <span className="text-lg font-black">{count}</span> {label}
                    </div>
                ))}
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {['All', 'Active', 'Fulfilled', 'Cancelled'].map(f => (
                                    <button key={f} onClick={() => setStatusFilter(f)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${statusFilter === f ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Blood Group Filter */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Blood Group</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {['All', ...BLOOD_GROUPS].map(bg => (
                                    <button key={bg} onClick={() => setBgFilter(bg)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${bgFilter === bg ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                                        {bg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sort By</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {[{ k: 'newest', l: '⬇ Newest' }, { k: 'oldest', l: '⬆ Oldest' }, { k: 'urgency', l: '🔴 Urgency' }].map(({ k, l }) => (
                                    <button key={k} onClick={() => setSortBy(k)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${sortBy === k ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400">Loading requests...</p>
                    </div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Droplets className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-xl font-black text-slate-300">No requests found</p>
                    <p className="text-sm text-slate-400 mt-2 mb-6">
                        {statusFilter !== 'All' || bgFilter !== 'All' ? 'Try adjusting your filters.' : 'Create your first blood request to get started.'}
                    </p>
                    {statusFilter === 'All' && bgFilter === 'All' && (
                        <button onClick={() => { setEditData(null); setShowForm(true); }}
                            className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center gap-2 mx-auto">
                            <Plus size={18} /> Create First Request
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map(req => (
                        <RequestCard
                            key={req._id}
                            req={req}
                            onEdit={(r)  => { setEditData(r); setShowForm(true); }}
                            onDelete={handleDelete}
                            onCancel={(r) => setCancelReq(r)}
                            onGratitude={handleGratitude}
                            onStartChat={onStartChat}
                            onViewTimeline={handleViewTimeline}
                            gratSending={gratSending}
                        />
                    ))}
                </div>
            )}

            {showForm && <RequestForm onClose={handleFormClose} initialData={editData} />}
            {cancelReq && <CancelModal req={cancelReq} onClose={() => setCancelReq(null)} onConfirm={handleCancelConfirm} />}
        </div>
    );
};

export default MyRequests;
