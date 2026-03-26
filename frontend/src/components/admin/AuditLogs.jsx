import React, { useState, useEffect } from 'react';
import { FileText, Shield, ChevronLeft, ChevronRight, Loader2, Filter, Clock } from 'lucide-react';
import { getAuditLogs } from '../../services/api';

const ACTION_COLORS = {
    USER_BANNED: 'bg-red-100 text-red-700',
    USER_UNBANNED: 'bg-rose-100 text-rose-700',
    USER_DELETED: 'bg-red-100 text-red-700',
    USER_UPDATED: 'bg-red-50 text-red-600',
    USER_ROLE_CHANGED: 'bg-amber-100 text-amber-700',
    REQUEST_UPDATED: 'bg-red-50 text-red-600',
    REQUEST_DELETED: 'bg-red-100 text-red-700',
    REQUEST_FORCE_FULFILLED: 'bg-rose-100 text-rose-700',
    CAMP_CREATED: 'bg-rose-100 text-rose-700',
    CAMP_UPDATED: 'bg-red-50 text-red-600',
    CAMP_DELETED: 'bg-red-100 text-red-700',
    BROADCAST_SENT: 'bg-rose-100 text-rose-700',
};

const TARGET_FILTERS = ["User", "Request", "Camp", "Payment", "System", "Broadcast"];

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [targetFilter, setTargetFilter] = useState('');
    const [actionSearch, setActionSearch] = useState('');

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (targetFilter) params.targetType = targetFilter;
            if (actionSearch) params.action = actionSearch;
            const res = await getAuditLogs(params);
            if (res?.success) { setLogs(res.data); setPagination(res.pagination); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [targetFilter]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchLogs();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <FileText size={24} className="text-slate-600" /> Audit Logs
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">{pagination.total} total admin actions recorded</p>
                </div>
                <div className="flex items-center gap-2">
                    <input value={actionSearch} onChange={e => setActionSearch(e.target.value)} onKeyDown={handleSearch}
                        placeholder="Search action..."
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none w-48" />
                    <select value={targetFilter} onChange={e => setTargetFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">All Targets</option>
                        {TARGET_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-slate-400 animate-spin" /></div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-lg font-black text-slate-300">No audit logs yet</p>
                        <p className="text-sm text-slate-400 mt-1">Admin actions will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {logs.map(log => (
                            <div key={log._id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                                    <Shield size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {log.targetType}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{log.details || 'No details'}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <Shield size={10} /> {log.admin?.name || 'System'}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400">Page {pagination.page} of {pagination.pages}</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30"><ChevronLeft size={16} /></button>
                        <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
