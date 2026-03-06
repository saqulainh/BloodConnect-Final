import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, Loader2, AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import { getSystemHealth } from '../../services/api';

export default function SystemHealth() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await getSystemHealth();
            if (res?.success) { setData(res.data); setLastRefresh(new Date()); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHealth(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="text-emerald-500 animate-spin" />
                <p className="text-sm font-bold text-slate-400">Checking system health...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="text-center py-32">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Failed to load system health</p>
        </div>
    );

    const { server, database, environment, timestamp } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Activity size={24} className="text-emerald-600" /> System Health
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Server & database monitoring</p>
                </div>
                <button onClick={fetchHealth} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Status Banner */}
            <div className={`rounded-2xl p-5 flex items-center gap-4 ${database.connected ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                {database.connected ? <CheckCircle size={24} className="text-emerald-600" /> : <AlertCircle size={24} className="text-red-600" />}
                <div>
                    <p className={`font-black ${database.connected ? 'text-emerald-700' : 'text-red-700'}`}>
                        {database.connected ? 'All Systems Operational' : 'Database Connection Issue'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Last checked: {lastRefresh?.toLocaleTimeString() || timestamp} • Environment: {environment}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5">
                        <Server size={18} className="text-blue-600" /> Server
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Node Version', value: server.nodeVersion },
                            { label: 'Platform', value: `${server.platform} (${server.arch})` },
                            { label: 'Uptime', value: server.uptime },
                            { label: 'CPUs', value: server.cpus },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                <span className="text-sm font-black text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Memory */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5">
                        <Cpu size={18} className="text-purple-600" /> Memory
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'RSS', value: server.memory.rss },
                            { label: 'Heap Used', value: server.memory.heapUsed },
                            { label: 'Heap Total', value: server.memory.heapTotal },
                            { label: 'System Total', value: server.totalMemory },
                            { label: 'System Free', value: server.freeMemory },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                                <span className="text-sm font-black text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Database */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5">
                        <Database size={18} className="text-emerald-600" /> Database
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-xs font-bold text-slate-500">Status</span>
                            <span className={`text-sm font-black ${database.connected ? 'text-emerald-600' : 'text-red-600'}`}>{database.status}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-xs font-bold text-slate-500">Host</span>
                            <span className="text-sm font-black text-slate-800">{database.host}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-xs font-bold text-slate-500">Database</span>
                            <span className="text-sm font-black text-slate-800">{database.name}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-xs font-bold text-slate-500">Total Documents</span>
                            <span className="text-sm font-black text-slate-800">{database.totalDocuments?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Collections */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5">
                        <HardDrive size={18} className="text-amber-600" /> Collections
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(database.collections || {}).map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold text-slate-500 capitalize">{name}</span>
                                <span className="text-sm font-black text-slate-800">{count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
