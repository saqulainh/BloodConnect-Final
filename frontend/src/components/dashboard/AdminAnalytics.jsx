import React, { useState, useEffect } from "react";
import {
    TrendingUp, DollarSign, Users, GitBranch,
    Droplets, ArrowUpRight, Clock, Building2,
    Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getAdminMissionStats } from "../../services/api";

// ── Stat Card ─────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = "red" }) => {
    const colorMap = {
        red: "bg-red-50 text-red-600",
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
                <Icon size={22} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
                <p className="text-2xl font-black text-slate-800 leading-tight mt-0.5">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

// ── Custom Tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-xs">
            <p className="font-bold text-slate-600 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-bold">
                    {p.name}: {p.name === "Revenue" ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
                </p>
            ))}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────
export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getAdminMissionStats();
                if (res?.success) setData(res.data);
                else throw new Error(res?.message || "Failed to load");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="text-red-500 animate-spin" />
                <p className="text-sm font-bold text-slate-400">Loading Mission Intelligence...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle size={36} className="text-red-400" />
                <p className="text-sm font-bold text-slate-600">Access Denied or Error</p>
                <p className="text-xs text-slate-400">{error}</p>
            </div>
        </div>
    );

    const { summary, donorGrowth, revenueTrend, bloodGroupStats, topCities, recentTransactions } = data;

    const formatINR = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

    return (
        <div className="space-y-8">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">🛡️ Mission Intelligence</h2>
                    <p className="text-sm text-slate-400 mt-1">Real-time platform analytics — Admin access only.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-red-600 uppercase tracking-wider">Live Data</span>
                </div>
            </div>

            {/* ── Summary Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={formatINR(summary.totalRevenue)}
                    sub={`${summary.successfulDonations} successful donations`}
                    color="emerald"
                />
                <StatCard
                    icon={Users}
                    label="Total Donors"
                    value={summary.totalDonors.toLocaleString()}
                    sub={`+${summary.newUsersThisWeek} this week`}
                    color="blue"
                />
                <StatCard
                    icon={Droplets}
                    label="Requests Fulfilled"
                    value={`${summary.fulfillmentRate}%`}
                    sub={`${summary.fulfilledRequests} of ${summary.totalRequests} requests`}
                    color="red"
                />
                <StatCard
                    icon={GitBranch}
                    label="Platform Users"
                    value={summary.totalUsers.toLocaleString()}
                    sub="All registered users"
                    color="amber"
                />
            </div>

            {/* ── Charts Row ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donor Growth */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Donor Growth</h3>
                            <p className="text-xs text-slate-400">Last 30 days</p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={12} />
                            Growing
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={donorGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} width={30} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="donors" name="New Donors" stroke="#DC2626" strokeWidth={2.5} dot={{ fill: "#DC2626", r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Revenue Trend</h3>
                            <p className="text-xs text-slate-400">Last 30 days</p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} />
                            ₹{(summary.totalRevenue || 0).toLocaleString("en-IN")}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} width={40} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" name="Revenue" fill="#DC2626" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Blood Groups + Top Cities Row ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blood Group Demand */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 mb-4">Top Requested Blood Groups</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={bloodGroupStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} />
                            <YAxis type="category" dataKey="bloodGroup" tick={{ fontSize: 11, fill: "#1E293B", fontWeight: 700 }} width={35} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="requests" name="Requests" fill="#FCA5A5" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Donor Cities */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 mb-4">Top Donor Cities</h3>
                    {topCities.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No city data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topCities.map((city, i) => (
                                <div key={city.city} className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-slate-700">{city.city}</span>
                                            <span className="text-xs font-black text-slate-500">{city.donors} donors</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div
                                                className="h-1.5 bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                                style={{ width: `${(city.donors / topCities[0].donors) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Recent Transactions ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-black text-slate-800">Recent Successful Transactions</h3>
                </div>
                {recentTransactions.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No transactions yet</p>
                ) : (
                    <div className="space-y-2">
                        {recentTransactions.map((tx) => (
                            <div key={tx._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate">{tx.donorName || "Anonymous"}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{tx.receiptNumber}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-black text-emerald-600">₹{(tx.amount || 0).toLocaleString("en-IN")}</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-0.5 justify-end">
                                        <Clock size={9} />
                                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
