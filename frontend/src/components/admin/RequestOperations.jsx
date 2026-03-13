import React, { useState, useEffect } from 'react';
import {
    Ticket, Search, Trash2, Edit, CheckCircle, ChevronLeft, ChevronRight,
    Loader2, AlertCircle, X, Filter, Zap, DownloadCloud
} from 'lucide-react';
import { getAdminRequests, adminUpdateRequest, adminDeleteRequest, adminForceFulfill, exportAdminRequestsCSV } from '../../services/api';

const STATUS_OPTIONS = ["Active", "Completed", "Cancelled", "resolved", "active"];
const URGENCY_OPTIONS = ["Normal", "Urgent", "Critical"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RequestOperations() {
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');
    const [bgFilter, setBgFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [editReq, setEditReq] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            if (urgencyFilter) params.urgency = urgencyFilter;
            if (bgFilter) params.bloodGroup = bgFilter;
            const res = await getAdminRequests(params);
            if (res?.success) { setRequests(res.data); setPagination(res.pagination); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRequests(); }, [statusFilter, urgencyFilter, bgFilter]);

    const showFeedback = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

    const handleForceFulfill = async (id) => {
        setActionLoading(id);
        try {
            const res = await adminForceFulfill(id);
            if (res?.success) { showFeedback('Request force-fulfilled!'); fetchRequests(pagination.page); }
        } catch (err) { showFeedback('Failed'); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this request permanently?')) return;
        setActionLoading(id);
        try {
            const res = await adminDeleteRequest(id);
            if (res?.success) { showFeedback('Request deleted.'); fetchRequests(pagination.page); }
        } catch (err) { showFeedback('Failed'); }
        finally { setActionLoading(null); }
    };

    const handleEditSave = async () => {
        if (!editReq) return;
        setActionLoading(editReq._id);
        try {
            const res = await adminUpdateRequest(editReq._id, editForm);
            if (res?.success) { showFeedback('Request updated!'); setEditReq(null); fetchRequests(pagination.page); }
        } catch (err) { showFeedback('Update failed'); }
        finally { setActionLoading(null); }
    };

    const urgencyBadge = (urgency) => {
        const map = { Critical: 'bg-red-100 text-red-700', Urgent: 'bg-amber-100 text-amber-700', Normal: 'bg-slate-100 text-slate-600' };
        return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${map[urgency] || 'bg-slate-100 text-slate-500'}`}>{urgency}</span>;
    };

    const statusBadge = (status) => {
        const map = { Active: 'bg-blue-100 text-blue-700', active: 'bg-blue-100 text-blue-700', Completed: 'bg-emerald-100 text-emerald-700', resolved: 'bg-emerald-100 text-emerald-700', Cancelled: 'bg-slate-100 text-slate-500' };
        return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${map[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Ticket size={24} className="text-red-600" /> Request Operations
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">{pagination.total} total blood requests</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={async () => {
                        try {
                            setFeedback('Exporting...');
                            await exportAdminRequestsCSV();
                            setFeedback('Export Successful!');
                        } catch (err) {
                            showFeedback('Export Failed.');
                        }
                    }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-100 transition-colors border border-emerald-200">
                        <DownloadCloud size={16} /> Export CSV
                    </button>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">All Status</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">All Urgency</option>
                        {URGENCY_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <select value={bgFilter} onChange={e => setBgFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">All Blood</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
            </div>

            {feedback && (
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-slate-400 animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Patient', 'Blood', 'Hospital', 'Urgency', 'Status', 'Requester', 'Date', 'Actions'].map(h => (
                                        <th key={h} className={`px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-800">{r.patientName}</td>
                                        <td className="px-4 py-3"><span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{r.bloodGroup}</span></td>
                                        <td className="px-4 py-3 text-xs text-slate-500 font-medium max-w-[150px] truncate">{r.hospital}</td>
                                        <td className="px-4 py-3">{urgencyBadge(r.urgency)}</td>
                                        <td className="px-4 py-3">{statusBadge(r.status)}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{r.requester?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {(r.status === 'Active' || r.status === 'active') && (
                                                    <button onClick={() => handleForceFulfill(r._id)} disabled={actionLoading === r._id}
                                                        className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors" title="Force Fulfill">
                                                        <Zap size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => { setEditReq(r); setEditForm({ status: r.status, urgency: r.urgency, hospital: r.hospital, units: r.units }); }}
                                                    className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors" title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(r._id)} disabled={actionLoading === r._id}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400">Page {pagination.page} of {pagination.pages}</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => fetchRequests(pagination.page - 1)} disabled={pagination.page <= 1} className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30"><ChevronLeft size={16} /></button>
                        <button onClick={() => fetchRequests(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editReq && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditReq(null)} />
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800">Edit Request</h3>
                            <button onClick={() => setEditReq(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
                                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Urgency</label>
                                <select value={editForm.urgency} onChange={e => setEditForm({ ...editForm, urgency: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                                    {URGENCY_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Hospital</label>
                                <input value={editForm.hospital || ''} onChange={e => setEditForm({ ...editForm, hospital: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none" />
                            </div>
                            <button onClick={handleEditSave} disabled={actionLoading === editReq._id}
                                className="w-full py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                                {actionLoading === editReq._id ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
