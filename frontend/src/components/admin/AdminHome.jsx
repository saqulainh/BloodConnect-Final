import React, { useState, useEffect } from 'react';
import {
    Users, Ticket, Droplets, DollarSign, Shield, TrendingUp, Activity,
    Calendar, Loader2, AlertCircle, Clock, ChevronRight, Tent
} from 'lucide-react';
import { getAdminDashboard } from '../../services/api';
import LiveMap from '../dashboard/LiveMap';

const StatCard = ({ icon: Icon, label, value, sub, color = 'bg-slate-800', accent = 'text-white' }) => (
    <div className={`${color} rounded-2xl p-5 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-center gap-3 mb-3">
            <Icon size={18} className={accent} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</span>
        </div>
        <p className="text-3xl font-black">{value}</p>
        {sub && <p className="text-xs font-medium text-white/50 mt-1">{sub}</p>}
    </div>
);

export default function AdminHome({ setActiveTab }) {
    // const [data, setData] = useState(null);
    // const [loading, setLoading] = useState(true);
    
    // TEMPORARY MOCK FOR SCREENSHOTS
    const data = {
        kpi: {
            totalUsers: 1458,
            activeRequests: 42,
            criticalCases: 12,
            totalRevenue: 85240
        },
        inventory: [
            { group: "A+", units: 15 },
            { group: "O-", units: 4 },
            { group: "B+", units: 28 },
            { group: "AB-", units: 2 }
        ],
        recentActions: [
            { _id: 1, action: "USER_BANNED", details: "Spam behavior detected", createdAt: new Date() },
            { _id: 2, action: "REQUEST_FULFILLED", details: "AB+ request 492 fulfilled", createdAt: new Date() }
        ]
    };
    const loading = false;

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="text-slate-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400">Loading Admin Dashboard...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="text-center py-32">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Failed to load dashboard</p>
        </div>
    );

    const { users, requests, registrations, revenue, totalDonations, totalCamps, recentAuditLogs } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header (Red/Rose theme for consistency) */}
            <div className="bg-gradient-to-br from-red-700 via-red-600 to-rose-900 rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={20} className="text-rose-200" />
                            <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Admin Control Center</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Platform Command</h2>
                        <p className="text-red-100/80 text-sm font-medium mt-1">
                            Managing {users.total.toLocaleString()} users • {requests.total.toLocaleString()} requests • ₹{(revenue.total || 0).toLocaleString("en-IN")} revenue
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-xl">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">All Systems Online</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={users.total.toLocaleString()}
                    sub={`${users.donors} donors • ${users.receivers} receivers`} color="bg-gradient-to-br from-red-600 to-red-800" />
                <StatCard icon={Ticket} label="Active Requests" value={requests.active.toLocaleString()}
                    sub={`${requests.fulfillmentRate}% fulfillment rate`} color="bg-gradient-to-br from-rose-600 to-rose-800" />
                <StatCard icon={DollarSign} label="Revenue" value={`₹${(revenue.total || 0).toLocaleString("en-IN")}`}
                    sub={`₹${(revenue.today || 0).toLocaleString("en-IN")} today`} color="bg-gradient-to-br from-red-500 to-red-700" />
                <StatCard icon={TrendingUp} label="Today's Signups" value={registrations.today}
                    sub={`${registrations.thisWeek} this week`} color="bg-gradient-to-br from-rose-500 to-rose-700" />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Donations", value: totalDonations, icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
                    { label: "Fulfilled Requests", value: requests.fulfilled, icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
                    { label: "Blood Camps", value: totalCamps, icon: Tent, color: "text-red-700", bg: "bg-red-50" },
                    { label: "Admin Accounts", value: users.admins, icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-800">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Map */}
                <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-4">🗺️ EIMS Live Map</h3>
                    <LiveMap setActiveTab={setActiveTab} />
                </div>

                {/* Recent Admin Actions */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-slate-800">Recent Admin Actions</h3>
                        <button onClick={() => setActiveTab('admin-audit')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {recentAuditLogs && recentAuditLogs.length > 0 ? recentAuditLogs.map(log => (
                            <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                    <Shield size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{log.details || log.action}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                        {log.admin?.name || 'Admin'} • {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-sm text-slate-400 py-8">No admin actions yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Manage Users", tab: "admin-users", icon: Users, color: "from-red-500 to-red-700" },
                    { label: "Manage Requests", tab: "admin-requests", icon: Ticket, color: "from-rose-500 to-rose-700" },
                    { label: "System Health", tab: "admin-health", icon: Activity, color: "from-red-600 to-red-800" },
                    { label: "Revenue", tab: "admin-revenue", icon: DollarSign, color: "from-rose-600 to-rose-800" },
                ].map(item => (
                    <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                        className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg hover:scale-105 transition-transform`}>
                        <item.icon size={20} />
                        <span className="font-black text-sm">{item.label}</span>
                        <ChevronRight size={16} className="ml-auto opacity-50" />
                    </button>
                ))}
            </div>
        </div>
    );
}
