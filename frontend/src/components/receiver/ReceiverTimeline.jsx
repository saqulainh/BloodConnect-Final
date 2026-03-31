import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    CheckCircle, Clock, Search, Droplets, FlaskConical,
    Heart, AlertCircle, Loader2, ChevronRight, Eye, RefreshCw,
    Phone, MapPin, Calendar, X, User
} from 'lucide-react';
import { getMyReceiverRequests, getRequestTimeline } from '../../services/api';

const STAGE_META = {
    "Request Created":   { icon: AlertCircle, color: "text-red-600",   bg: "bg-red-100",   border: "border-red-200",   barColor: "#DC2626" },
    "Searching Donors":  { icon: Search,      color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", barColor: "#F59E0B" },
    "Donor Matched":     { icon: CheckCircle, color: "text-blue-600",  bg: "bg-blue-100",  border: "border-blue-200",  barColor: "#3B82F6" },
    "Blood Donated":     { icon: Droplets,    color: "text-red-700",   bg: "bg-red-100",   border: "border-red-200",   barColor: "#B91C1C" },
    "Testing & Processing": { icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200", barColor: "#7C3AED" },
    "Delivered":         { icon: Heart,       color: "text-rose-600",  bg: "bg-rose-100",  border: "border-rose-200",  barColor: "#E11D48" },
};

const getStatusBadge = (status) => {
    const m = {
        Active:    { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: '⏳ Active' },
        active:    { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: '⏳ Active' },
        Completed: { cls: 'bg-blue-100 text-blue-700 border-blue-200',          label: '✅ Fulfilled' },
        resolved:  { cls: 'bg-blue-100 text-blue-700 border-blue-200',          label: '✅ Fulfilled' },
        Cancelled: { cls: 'bg-slate-100 text-slate-500 border-slate-200',       label: '🚫 Cancelled' },
    };
    return m[status] || m.Active;
};

const ReceiverTimeline = ({ initialRequestId }) => {
    const [requests,       setRequests]       = useState([]);
    const [selectedReq,    setSelectedReq]    = useState(null);
    const [timeline,       setTimeline]       = useState(null);
    const [loading,        setLoading]        = useState(true);
    const [timelineLoading,setTimelineLoading]= useState(false);
    const [searchTerm,     setSearchTerm]     = useState('');
    const pollRef = useRef(null);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await getMyReceiverRequests({ sort: 'newest' });
            if (res?.success) {
                setRequests(res.data || []);
                return res.data || [];
            }
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
        return [];
    }, []);

    const viewTimeline = useCallback(async (req, silent = false) => {
        if (!silent) { setSelectedReq(req); setTimelineLoading(true); }
        try {
            const res = await getRequestTimeline(req._id);
            if (res?.success) setTimeline(res.data);
        } catch (err) { console.error("Timeline error:", err); }
        finally { setTimelineLoading(false); }
    }, []);

    useEffect(() => {
        fetchRequests().then(data => {
            if (!data.length) return;
            // Auto-select: use initialRequestId if provided, otherwise the most recent active request
            const target = initialRequestId
                ? data.find(r => r._id === initialRequestId)
                : data.find(r => r.status === 'Active' || r.status === 'active') || data[0];
            if (target) viewTimeline(target);
        });
    }, [fetchRequests, viewTimeline, initialRequestId]);

    // Poll timeline for active requests every 30s
    useEffect(() => {
        if (!selectedReq) return;
        const isActive = selectedReq.status === 'Active' || selectedReq.status === 'active';
        if (!isActive) { clearInterval(pollRef.current); return; }
        pollRef.current = setInterval(() => viewTimeline(selectedReq, true), 30_000);
        return () => clearInterval(pollRef.current);
    }, [selectedReq, viewTimeline]);

    const filteredRequests = requests.filter(r =>
        !searchTerm.trim() ||
        r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const completedStages = timeline?.stages.filter(s => s.completed).length || 0;
    const totalStages     = timeline?.stages.length || 6;
    const progressPct     = Math.round((completedStages / totalStages) * 100);

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-black text-slate-800">Request Timeline</h2>
                <p className="text-sm text-slate-400 font-medium">Track your blood request journey from creation to delivery.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ── Left: Request List ── */}
                <div className="lg:col-span-2 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search requests..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-red-400 animate-spin" /></div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                            <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-300">{searchTerm ? 'No matches' : 'No requests yet'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
                            {filteredRequests.map(req => {
                                const statusMeta = getStatusBadge(req.status);
                                const isSelected = selectedReq?._id === req._id;
                                return (
                                    <button key={req._id} onClick={() => { setSelectedReq(req); viewTimeline(req); }}
                                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${isSelected ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}>
                                        <div className={`w-11 h-11 bg-gradient-to-br ${req.status === 'Cancelled' ? 'from-slate-400 to-slate-500' : 'from-red-500 to-red-700'} rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}>
                                            {req.bloodGroup}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 truncate">{req.patientName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                                                <MapPin size={8} />{req.hospital}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusMeta.cls}`}>
                                                {req.status === 'Completed' || req.status === 'resolved' ? 'Done' : req.status === 'Cancelled' ? 'X' : 'Active'}
                                            </span>
                                            <ChevronRight size={12} className={isSelected ? 'text-red-400' : 'text-slate-300'} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Right: Timeline View ── */}
                <div className="lg:col-span-3">
                    {!selectedReq ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Eye className="w-14 h-14 text-slate-200 mb-3" />
                            <p className="text-xl font-black text-slate-300">Select a request</p>
                            <p className="text-sm text-slate-400 mt-1">Click any request on the left to view its journey</p>
                        </div>
                    ) : timelineLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100">
                            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-3" />
                            <p className="text-sm font-bold text-slate-400">Loading timeline...</p>
                        </div>
                    ) : timeline ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Request Header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${selectedReq.status === 'Cancelled' ? 'from-slate-400 to-slate-500' : 'from-red-500 to-red-700'} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0`}>
                                        {timeline.request.bloodGroup}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">{timeline.request.patientName}</h3>
                                                <p className="text-sm text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <MapPin size={12} />{timeline.request.hospital}
                                                    {timeline.request.units && ` · ${timeline.request.units} unit${timeline.request.units > 1 ? 's' : ''}`}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(timeline.request.status).cls} shrink-0`}>
                                                {getStatusBadge(timeline.request.status).label}
                                            </span>
                                        </div>
                                        {timeline.request.contactPhone && (
                                            <a href={`tel:${timeline.request.contactPhone}`}
                                                className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline">
                                                <Phone size={10} />{timeline.request.contactPhone}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Overall Progress bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                                        <span className="flex items-center gap-1"><RefreshCw size={10} /> Journey Progress</span>
                                        <span>{completedStages}/{totalStages} stages · {progressPct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${progressPct}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Stages */}
                            <div className="p-6 space-y-0">
                                {timeline.stages.map((stage, idx) => {
                                    const m      = STAGE_META[stage.stage] || STAGE_META["Request Created"];
                                    const Icon   = stage.completed ? m.icon : Clock;
                                    const isLast = idx === timeline.stages.length - 1;
                                    return (
                                        <div key={idx} className="flex gap-4 relative">
                                            {/* Connector line */}
                                            {!isLast && (
                                                <div className="absolute left-[21px] top-[44px] bottom-0 w-0.5 rounded-full"
                                                    style={{ background: stage.completed ? m.barColor : '#e2e8f0', height: 'calc(100% - 8px)' }} />
                                            )}
                                            {/* Icon bubble */}
                                            <div className={`relative z-10 shrink-0 w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all duration-500 ${stage.completed ? `${m.bg} ${m.color} border-2 ${m.border} shadow-sm` : 'bg-slate-100 text-slate-300 border-2 border-slate-200'}`}>
                                                <Icon size={18} />
                                            </div>
                                            {/* Content */}
                                            <div className={`flex-1 pb-7 ${!stage.completed ? 'opacity-40' : ''}`}>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-sm font-black text-slate-800">{stage.stage}</h4>
                                                    {stage.completed && !isLast && <CheckCircle size={12} className="text-emerald-500" />}
                                                    {stage.completed && isLast && <span className="text-sm">🎉</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{stage.message}</p>
                                                {stage.timestamp && (
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider flex items-center gap-1">
                                                        <Calendar size={9} />
                                                        {new Date(stage.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Donor Info (if fulfilled) */}
                            {timeline.request.fulfilledBy && (
                                <div className="mx-6 mb-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 flex items-center gap-4 border border-rose-100">
                                    <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                                        {timeline.request.fulfilledBy.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Fulfilled By</p>
                                        <p className="font-black text-rose-800">{timeline.request.fulfilledBy.name}</p>
                                        <p className="text-xs text-rose-600 font-medium">{timeline.request.fulfilledBy.bloodGroup} donor</p>
                                    </div>
                                    <Heart className="ml-auto text-rose-400" size={20} fill="currentColor" />
                                </div>
                            )}

                            {/* Cancelled Reason */}
                            {timeline.request.status === 'Cancelled' && timeline.request.cancelledReason && (
                                <div className="mx-6 mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 font-medium">
                                    <p className="font-black text-slate-600 mb-1">Cancellation Reason</p>
                                    <p>{timeline.request.cancelledReason}</p>
                                    {timeline.request.cancelledAt && (
                                        <p className="text-slate-400 mt-1 font-bold uppercase tracking-wider text-[10px]">
                                            {new Date(timeline.request.cancelledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ReceiverTimeline;
