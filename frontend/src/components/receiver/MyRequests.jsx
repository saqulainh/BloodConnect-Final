import React, { useState, useEffect } from 'react';
import {
    MapPin, X, AlertCircle, Loader2, MessageCircle, Edit, Trash2,
    Plus, CheckCircle2, Clock, Filter, ChevronDown, Heart
} from 'lucide-react';
import {
    createBloodRequest, getCurrentLocation, getMyReceiverRequests,
    updateBloodRequest, deleteBloodRequest, sendGratitudeTodonor
} from '../../services/api';

// ── Request Form ──────────────────────────────────────────────────────
const RequestForm = ({ onClose, initialData = null }) => {
    const [form, setForm] = useState({
        patientName: initialData?.patientName || '',
        bloodGroup: initialData?.bloodGroup || '',
        hospital: initialData?.hospital || '',
        urgency: initialData?.urgency || 'Normal',
        units: initialData?.units || 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const loc = await getCurrentLocation();
            const payload = { ...form, lat: loc.lat, lng: loc.lng };
            if (initialData?._id) {
                await updateBloodRequest(initialData._id, payload);
            } else {
                await createBloodRequest(payload);
            }
            onClose(true);
        } catch (err) {
            setError(err.message || 'Failed to save request');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => onClose(false)} />
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800">{initialData ? 'Edit Request' : '🩸 New Blood Request'}</h3>
                    <button onClick={() => onClose(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Patient Name</label>
                        <input type="text" required value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400" placeholder="Enter patient name" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Blood Group</label>
                        <div className="grid grid-cols-4 gap-2">
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                <button key={bg} type="button" onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                                    className={`py-2.5 rounded-xl text-sm font-black transition-all ${form.bloodGroup === bg ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                                    {bg}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Hospital</label>
                        <input type="text" required value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400" placeholder="Hospital name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Urgency</label>
                            <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                                <option>Normal</option>
                                <option>Urgent</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Units</label>
                            <input type="number" min="1" max="10" value={form.units} onChange={e => setForm(f => ({ ...f, units: parseInt(e.target.value) || 1 }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
                    <button type="submit" disabled={loading || !form.bloodGroup}
                        className="w-full py-3.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-200">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                        {initialData ? 'Update Request' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────
const MyRequests = ({ onStartChat }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);
    const [filter, setFilter] = useState('All');
    const [gratSending, setGratSending] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getMyReceiverRequests();
            if (res?.success) setRequests(res.data);
        } catch (err) { console.error("Error fetching requests:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this request?')) return;
        try {
            await deleteBloodRequest(id);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleFormClose = (refresh) => {
        setShowForm(false);
        setEditData(null);
        if (refresh) fetchRequests();
    };

    const handleGratitude = async (req) => {
        if (!req.fulfilledBy?._id) return;
        setGratSending(req._id);
        try {
            await sendGratitudeTodonor({ requestId: req._id, donorId: req.fulfilledBy._id });
        } catch (err) { console.error("Gratitude error:", err); }
        finally { setGratSending(null); }
    };

    const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter || (filter === 'Fulfilled' && (r.status === 'Completed' || r.status === 'resolved')));

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': case 'active': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'Completed': case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getUrgencyStyle = (urgency) => {
        switch (urgency) {
            case 'Critical': return 'bg-red-600 text-white';
            case 'Urgent': return 'bg-amber-500 text-white';
            default: return 'bg-slate-200 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">My Blood Requests</h2>
                    <p className="text-sm text-slate-400 font-medium">{requests.length} total requests</p>
                </div>
                <button onClick={() => { setEditData(null); setShowForm(true); }}
                    className="px-5 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 flex items-center gap-2">
                    <Plus size={16} /> New Request
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Active', 'Fulfilled', 'Cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Request Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-teal-400 animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-lg font-black text-slate-300">No requests found</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first blood request to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(req => (
                        <div key={req._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                                            {req.bloodGroup}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800">{req.patientName}</h4>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><MapPin size={10} /> {req.hospital}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${getUrgencyStyle(req.urgency)}`}>
                                        {req.urgency}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(req.status)}`}>
                                        {req.status === 'Completed' || req.status === 'resolved' ? '✅ Fulfilled' : req.status}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold">{req.units} unit(s)</span>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        {new Date(req.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                {/* Fulfilled — Show donor info */}
                                {(req.status === 'Completed' || req.status === 'resolved') && req.fulfilledBy && (
                                    <div className="bg-emerald-50 rounded-xl p-3 mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-black">
                                                {req.fulfilledBy.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-emerald-800">{req.fulfilledBy.name}</p>
                                                <p className="text-[10px] text-emerald-600">{req.fulfilledBy.bloodGroup}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleGratitude(req)} disabled={gratSending === req._id}
                                            className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 disabled:opacity-50">
                                            <Heart size={10} /> {gratSending === req._id ? 'Sending...' : 'Thanks'}
                                        </button>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {(req.status === 'Active' || req.status === 'active') && (
                                        <>
                                            <button onClick={() => { setEditData(req); setShowForm(true); }}
                                                className="flex-1 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1">
                                                <Edit size={12} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(req._id)}
                                                className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-1">
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </>
                                    )}
                                    {req.fulfilledBy && onStartChat && (
                                        <button onClick={() => onStartChat(req.fulfilledBy)}
                                            className="flex-1 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-1">
                                            <MessageCircle size={12} /> Chat
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && <RequestForm onClose={handleFormClose} initialData={editData} />}
        </div>
    );
};

export default MyRequests;
