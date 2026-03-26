import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Loader2, AlertCircle, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAdminRevenue } from '../../services/api';

const COLORS = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-xs">
            <p className="font-bold text-slate-600 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-bold">
                    {p.name}: {p.name.includes('Revenue') || p.name === 'Total' ? `₹${(p.value || 0).toLocaleString('en-IN')}` : p.value}
                </p>
            ))}
        </div>
    );
};

export default function RevenuePanel() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getAdminRevenue(period);
                if (res?.success) setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, [period]);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 size={36} className="text-red-500 animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="text-center py-32">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Failed to load revenue data</p>
        </div>
    );

    const { summary, revenueTrend, topDonors, paymentStatus, recentPayments } = data;
    const fmt = (v) => `₹${(v || 0).toLocaleString('en-IN')}`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <DollarSign size={24} className="text-rose-600" /> Revenue & Donations
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Financial overview and donor analytics</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                    {[7, 30, 90].map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${period === p ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                            {p}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-2">Total Revenue</p>
                    <p className="text-3xl font-black">{fmt(summary.totalRevenue)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-100 mb-2">Transactions</p>
                    <p className="text-3xl font-black">{summary.totalTransactions}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-2">Success Rate</p>
                    <p className="text-3xl font-black">{summary.successRate}%</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={v => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} width={40} tickFormatter={v => `₹${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" name="Revenue" fill="#DC2626" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Status Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 mb-4">Payment Status</h3>
                    {paymentStatus.length > 0 ? (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie data={paymentStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} strokeWidth={2}>
                                        {paymentStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {paymentStatus.map((s, i) => (
                                    <div key={s.status} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-600 capitalize">{s.status}</span>
                                        <span className="text-xs font-black text-slate-800">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <p className="text-sm text-slate-400 text-center py-8">No payment data</p>}
                </div>
            </div>

            {/* Top Donors + Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 mb-4">🏆 Top Donors by Amount</h3>
                    {topDonors.length > 0 ? (
                        <div className="space-y-2">
                            {topDonors.map((d, i) => (
                                <div key={d.email || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <span className="w-6 h-6 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full flex items-center justify-center">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate">{d.name || d.email || 'Anonymous'}</p>
                                        <p className="text-[10px] text-slate-400">{d.count} donations</p>
                                    </div>
                                    <p className="text-sm font-black text-rose-600">{fmt(d.totalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 text-center py-8">No donors yet</p>}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 mb-4">Recent Payments</h3>
                    {recentPayments.length > 0 ? (
                        <div className="space-y-2">
                            {recentPayments.slice(0, 8).map(tx => (
                                <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.status === 'success' ? 'bg-rose-100 text-rose-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate">{tx.donorName || 'Anonymous'}</p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={8} />{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p className={`text-sm font-black ${tx.status === 'success' ? 'text-rose-600' : 'text-red-500'}`}>{fmt(tx.amount)}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 text-center py-8">No payments yet</p>}
                </div>
            </div>
        </div>
    );
}
