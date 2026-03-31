import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Clock, Users, Droplets, CheckCircle2,
    AlertCircle, Loader2, Calendar, XCircle, Activity, Target
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    BarChart, Bar, LineChart, Line
} from 'recharts';
import { getReceiverAnalytics } from '../../services/api';

const COLORS_PIE   = ['#DC2626', '#F59E0B', '#10B981'];
const COLORS_BG    = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#E11D48', '#BE123C', '#FB7185', '#FDA4AF'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-3 text-xs min-w-[120px]">
            <p className="font-black text-slate-600 mb-1 uppercase tracking-wider">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-bold" style={{ color: p.color }}>
                    {p.name}: <span className="text-slate-800">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

const ReceiverAnalytics = () => {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab,     setTab]     = useState('overview'); // 'overview' | 'trends' | 'breakdown'

    useEffect(() => {
        (async () => {
            try {
                const res = await getReceiverAnalytics();
                if (res?.success) setData(res.data);
            } catch (err) { console.error("Analytics error:", err); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">Crunching your data...</p>
        </div>
    );

    if (!data) return (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <BarChart3 className="w-14 h-14 text-slate-200 mx-auto mb-3" />
            <p className="text-xl font-black text-slate-300">No analytics data yet</p>
            <p className="text-sm text-slate-400 mt-1">Create blood requests to see your analytics.</p>
        </div>
    );

    const TABS = [
        { k: 'overview',   label: '📊 Overview' },
        { k: 'trends',     label: '📈 Trends' },
        { k: 'breakdown',  label: '🔍 Breakdown' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Personal Analytics</h2>
                    <p className="text-sm text-slate-400 font-medium">Deep insights into your blood request patterns.</p>
                </div>
                {/* Tab Switcher */}
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    {TABS.map(({ k, label }) => (
                        <button key={k} onClick={() => setTab(k)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${tab === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ──────────── OVERVIEW TAB ──────────── */}
            {tab === 'overview' && (
                <>
                    {/* KPI Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Requests",   value: data.totalRequests,   icon: Droplets,     color: "text-red-600",   bg: "bg-red-50" },
                            { label: "Fulfilled",        value: data.totalFulfilled,  icon: CheckCircle2, color: "text-blue-600",  bg: "bg-blue-50" },
                            { label: "Cancellation %",   value: `${data.cancellationRate}%`, icon: XCircle, color: "text-amber-600", bg: "bg-amber-50" },
                            { label: "Unique Donors",    value: data.uniqueDonors,    icon: Users,        color: "text-rose-600",  bg: "bg-rose-50" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={22} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Fulfillment + Avg Response */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">Fulfillment Rate</p>
                                        <p className="text-xs text-slate-400">{data.totalFulfilled} of {data.totalRequests} requests</p>
                                    </div>
                                </div>
                                <span className="text-3xl font-black text-blue-600">{data.fulfillmentRate}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${data.fulfillmentRate}%` }} />
                            </div>
                            <div className="flex items-center justify-between mt-3 text-xs font-medium text-slate-400">
                                <span>Pending: {data.totalRequests - data.totalFulfilled - data.totalCancelled}</span>
                                <span>Cancelled: {data.totalCancelled}</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-4xl font-black text-slate-800">{data.avgResponseHours}<span className="text-lg text-slate-400 font-bold">h</span></p>
                                <p className="text-sm font-black text-slate-600 mt-0.5">Average Response Time</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">From request creation to fulfillment</p>
                            </div>
                        </div>
                    </div>

                    {/* Fulfillment Summary Table */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-red-500" /> Fulfillment Summary
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Total Requests',  value: data.totalRequests,   bar: 100,                   color: 'bg-slate-300' },
                                { label: 'Fulfilled',       value: data.totalFulfilled,  bar: data.fulfillmentRate,   color: 'bg-blue-500'  },
                                { label: 'Pending/Active',  value: data.totalRequests - data.totalFulfilled - data.totalCancelled, bar: data.totalRequests > 0 ? Math.round(((data.totalRequests - data.totalFulfilled - data.totalCancelled) / data.totalRequests) * 100) : 0, color: 'bg-amber-400' },
                                { label: 'Cancelled',       value: data.totalCancelled,  bar: data.cancellationRate, color: 'bg-red-300'   },
                            ].map(({ label, value, bar, color }) => (
                                <div key={label} className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-slate-500 w-32 shrink-0">{label}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${bar}%` }} />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 w-8 text-right">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ──────────── TRENDS TAB ──────────── */}
            {tab === 'trends' && (
                <>
                    {/* Monthly Trend */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                            <Calendar size={18} className="text-red-500" /> Monthly Trend
                        </h3>
                        <div className="h-[280px]">
                            {data.monthlyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradFul" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradCan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="requests"  stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#gradReq)" name="Requests" />
                                        <Area type="monotone" dataKey="fulfilled" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#gradFul)" name="Fulfilled" />
                                        <Area type="monotone" dataKey="cancelled" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#gradCan)" name="Cancelled" strokeDasharray="4 4" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                    <p className="text-sm font-bold text-slate-400">No trend data yet — create requests to see trends.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-4 justify-center">
                            {[{ c: '#EF4444', l: 'Requests' }, { c: '#3B82F6', l: 'Fulfilled' }, { c: '#F59E0B', l: 'Cancelled' }].map(({ c, l }) => (
                                <div key={l} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <div className="w-3 h-3 rounded-full" style={{ background: c }}></div>{l}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Heatmap (bar chart) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-red-500" /> Weekly Activity (Last 12 Weeks)
                        </h3>
                        <div className="h-[200px]">
                            {data.weeklyData?.some(w => w.requests > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.weeklyData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="requests" fill="#EF4444" radius={[6, 6, 0, 0]} name="Requests" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                    <p className="text-sm font-bold text-slate-400">No weekly data yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ──────────── BREAKDOWN TAB ──────────── */}
            {tab === 'breakdown' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Blood Group Demand */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                            <Droplets size={18} className="text-red-500" /> Blood Group Demand
                        </h3>
                        <div className="h-[260px]">
                            {data.bloodGroupDemand.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.bloodGroupDemand} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Requests">
                                            {data.bloodGroupDemand.map((_, idx) => (
                                                <Cell key={idx} fill={COLORS_BG[idx % COLORS_BG.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                    <p className="text-sm font-bold text-slate-400">No data yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Urgency Distribution */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" /> Urgency Distribution
                        </h3>
                        <div className="h-[200px]">
                            {data.urgencyDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.urgencyDistribution} cx="50%" cy="50%"
                                            innerRadius={55} outerRadius={80}
                                            paddingAngle={5} dataKey="value" cornerRadius={4}>
                                            {data.urgencyDistribution.map((_, idx) => (
                                                <Cell key={idx} fill={COLORS_PIE[idx % COLORS_PIE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8}
                                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                    <p className="text-sm font-bold text-slate-400">No data yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Time Distribution */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-blue-500" /> Response Time Distribution
                        </h3>
                        <div className="h-[200px]">
                            {data.responseTimeDistribution?.some(d => d.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.responseTimeDistribution} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Requests" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                    <p className="text-sm font-bold text-slate-400">No fulfilled requests yet to show response time.</p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-2 text-center">
                            Time from request creation to fulfillment
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiverAnalytics;
