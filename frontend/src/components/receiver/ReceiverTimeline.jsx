import React, { useState, useEffect } from 'react';
import {
    CheckCircle, Clock, Search, Droplets, FlaskConical, Truck,
    Heart, AlertCircle, Loader2, ChevronRight, Eye
} from 'lucide-react';
import { getMyReceiverRequests, getRequestTimeline } from '../../services/api';

const STAGE_META = {
    "Request Created": { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100", ring: "ring-red-200" },
    "Searching Donors": { icon: Search, color: "text-blue-600", bg: "bg-blue-100", ring: "ring-blue-200" },
    "Donor Matched": { icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-100", ring: "ring-indigo-200" },
    "Blood Donated": { icon: Droplets, color: "text-red-600", bg: "bg-red-100", ring: "ring-red-200" },
    "Testing & Processing": { icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-100", ring: "ring-purple-200" },
    "Delivered": { icon: Heart, color: "text-rose-600", bg: "bg-rose-100", ring: "ring-rose-200" },
};

const ReceiverTimeline = () => {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [timeline, setTimeline] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timelineLoading, setTimelineLoading] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await getMyReceiverRequests();
                if (res?.success) setRequests(res.data);
            } catch (err) { console.error("Error:", err); }
            finally { setLoading(false); }
        };
        fetchRequests();
    }, []);

    const viewTimeline = async (req) => {
        setSelectedReq(req);
        setTimelineLoading(true);
        try {
            const res = await getRequestTimeline(req._id);
            if (res?.success) setTimeline(res.data);
        } catch (err) { console.error("Timeline error:", err); }
        finally { setTimelineLoading(false); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': case 'active': return 'bg-red-100 text-red-700';
            case 'Completed': case 'resolved': return 'bg-rose-100 text-rose-700';
            case 'Cancelled': return 'bg-slate-100 text-slate-500';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-black text-slate-800">Request Timeline</h2>
                <p className="text-sm text-slate-400 font-medium">Track the journey of your blood requests from creation to life saved.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Request List */}
                <div className="lg:col-span-1 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a Request</p>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-red-400 animate-spin" /></div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                            <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-300">No requests yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                            {requests.map(req => (
                                <button key={req._id} onClick={() => viewTimeline(req)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${selectedReq?._id === req._id ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                                        {req.bloodGroup}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{req.patientName}</p>
                                        <p className="text-[10px] text-slate-400 font-medium truncate">{req.hospital}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusColor(req.status)}`}>
                                            {req.status === 'Completed' || req.status === 'resolved' ? 'Done' : req.status}
                                        </span>
                                        <ChevronRight size={12} className="text-slate-300" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right — Timeline View */}
                <div className="lg:col-span-2">
                    {!selectedReq ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Eye className="w-12 h-12 text-slate-200 mb-3" />
                            <p className="text-lg font-black text-slate-300">Select a request</p>
                            <p className="text-sm text-slate-400">Click on a request to view its journey timeline</p>
                        </div>
                    ) : timelineLoading ? (
                        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                            <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                        </div>
                    ) : timeline ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
                            {/* Request Header */}
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                    {timeline.request.bloodGroup}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{timeline.request.patientName}</h3>
                                    <p className="text-sm text-slate-400 font-medium">{timeline.request.hospital} • {timeline.request.units} unit(s) • {timeline.request.urgency}</p>
                                </div>
                            </div>

                            {/* Journey Stages */}
                            <div className="relative">
                                {timeline.stages.map((stage, idx) => {
                                    const meta = STAGE_META[stage.stage] || STAGE_META["Request Created"];
                                    const Icon = meta.icon;
                                    const isLast = idx === timeline.stages.length - 1;
                                    return (
                                        <div key={idx} className="flex gap-4 pb-8 relative">
                                            {/* Vertical line */}
                                            {!isLast && (
                                                <div className="absolute left-[22px] top-[44px] bottom-0 w-0.5"
                                                    style={{ backgroundColor: stage.completed ? '#0d9488' : '#e2e8f0' }} />
                                            )}
                                            {/* Icon */}
                                            <div className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${stage.completed ? `${meta.bg} ${meta.color} ring-2 ${meta.ring} shadow-md` : 'bg-slate-100 text-slate-300'}`}>
                                                {stage.completed ? <Icon size={18} /> : <Clock size={18} />}
                                            </div>
                                            {/* Content */}
                                            <div className={`flex-1 ${stage.completed ? '' : 'opacity-50'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-400">{stage.icon}</span>
                                                    <h4 className="text-sm font-black text-slate-800">{stage.stage}</h4>
                                                    {stage.completed && <CheckCircle size={12} className="text-rose-500" />}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium">{stage.message}</p>
                                                {stage.timestamp && (
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                        {new Date(stage.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Donor info for fulfilled */}
                            {timeline.request.fulfilledBy && (
                                <div className="mt-4 bg-rose-50 rounded-2xl p-4 flex items-center gap-4 border border-rose-100">
                                    <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                                        {timeline.request.fulfilledBy.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-rose-800">Fulfilled by {timeline.request.fulfilledBy.name}</p>
                                        <p className="text-xs text-rose-600 font-medium">{timeline.request.fulfilledBy.bloodGroup} donor</p>
                                    </div>
                                    <Heart className="ml-auto text-rose-500" size={20} fill="currentColor" />
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
