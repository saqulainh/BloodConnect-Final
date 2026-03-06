import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Clock, Users, Droplets, CheckCircle2,
    AlertCircle, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import { getReceiverAnalytics } from '../../services/api';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#6366f1'];

const ReceiverAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getReceiverAnalytics();
                if (res?.success) setData(res.data);
            } catch (err) { console.error("Analytics error:", err); }
            finally { setLoading(false); }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-lg font-black text-slate-300">No analytics data yet</p>
            <p className="text-sm text-slate-400 mt-1">Create blood requests to see your analytics.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-black text-slate-800">Personal Analytics</h2>
                <p className="text-sm text-slate-400 font-medium">Deep insights into your blood request patterns and fulfillment stats.</p>
            </div>

            {/* ── Key Metrics ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Requests", value: data.totalRequests, icon: Droplets, color: "text-teal-600", bg: "bg-teal-50" },
                    { label: "Fulfilled", value: data.totalFulfilled, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Fulfillment Rate", value: `${data.fulfillmentRate}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Unique Donors", value: data.uniqueDonors, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
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

            {/* ── Avg Response Time ── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Clock size={22} />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-800">{data.avgResponseHours}h</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Response Time</p>
                </div>
                <p className="ml-auto text-xs text-slate-400 font-medium max-w-[200px] text-right">
                    Average time from request creation to fulfillment
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Monthly Trend Chart ── */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Monthly Trend</h3>
                    <div className="h-[280px] w-full">
                        {data.monthlyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorReqR" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFulR" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="requests" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorReqR)" name="Requests" />
                                    <Area type="monotone" dataKey="fulfilled" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorFulR)" name="Fulfilled" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                <p className="text-sm font-bold text-slate-400">No trend data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Blood Group Demand ── */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Blood Group Demand</h3>
                    <div className="h-[280px] w-full">
                        {data.bloodGroupDemand.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.bloodGroupDemand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#0d9488" radius={[8, 8, 0, 0]} name="Requests" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                <p className="text-sm font-bold text-slate-400">No data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Urgency Distribution ── */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-slate-800 text-lg mb-6 w-full text-left">Urgency Distribution</h3>
                    <div className="h-[240px] w-full relative">
                        {data.urgencyDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.urgencyDistribution}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={85}
                                        paddingAngle={5} dataKey="value"
                                        cornerRadius={4}
                                    >
                                        {data.urgencyDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
                                <p className="text-sm font-bold text-slate-400">No data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Fulfillment Rate Card ── */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Fulfillment Summary</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">Total Requests</span>
                            <span className="text-lg font-black text-slate-800">{data.totalRequests}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">Fulfilled</span>
                            <span className="text-lg font-black text-emerald-600">{data.totalFulfilled}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-500">Pending</span>
                            <span className="text-lg font-black text-amber-600">{data.totalRequests - data.totalFulfilled}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-500">Rate</span>
                                <span className="text-2xl font-black text-teal-600">{data.fulfillmentRate}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${data.fulfillmentRate}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiverAnalytics;
