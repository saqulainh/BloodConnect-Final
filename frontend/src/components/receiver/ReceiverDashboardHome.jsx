import React, { useState, useEffect } from 'react';
import {
    Ticket, CheckCircle2, Droplets, Clock, Plus, Bell,
    Heart as HeartIcon, CreditCard, X, AlertCircle, TrendingUp
} from 'lucide-react';
import { getReceiverStats } from '../../services/api';
import QuickActionButton from '../dashboard/QuickActionButton';
import LiveMap from '../dashboard/LiveMap';
import DonateModal from '../dashboard/DonateModal';

const ReceiverDashboardHome = ({ setActiveTab, user }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';

    const [stats, setStats] = useState({
        totalRequests: "...",
        activeRequests: "...",
        fulfilledRequests: "...",
        avgResponseHours: "...",
        fulfillmentRate: 0,
        recentActivity: [],
    });
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [showAllActivity, setShowAllActivity] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getReceiverStats();
                if (res?.success) setStats(res.data);
            } catch (err) { console.error("Failed to fetch receiver stats", err); }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Greeting Banner (Teal/Blue for Receiver) ── */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-blue-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-blue-900/30 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                        <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            {greeting}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                            {firstName}! {user?.bloodGroup && <span className="text-blue-200">({user.bloodGroup})</span>}
                        </h2>
                        <p className="text-blue-200 text-sm font-medium">
                            You have <span className="text-white font-black">{stats.activeRequests} active requests</span> — we're finding donors for you.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setActiveTab('my-requests')}
                            className="px-5 py-2.5 bg-white text-teal-700 text-sm font-black rounded-xl hover:bg-teal-50 transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap">
                            🩸 My Requests
                        </button>
                        <button onClick={() => setActiveTab('find-donors')}
                            className="px-5 py-2.5 bg-blue-700/60 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors border border-blue-500/40 flex items-center gap-2 whitespace-nowrap">
                            🔍 Find Donors
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Requests', value: stats.activeRequests, icon: Ticket, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Fulfilled', value: stats.fulfilledRequests, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Units Received', value: stats.totalUnitsFulfilled || 0, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg Response', value: `${stats.avgResponseHours || 0}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Fulfillment Rate Banner ── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800">Request Fulfillment Rate</p>
                            <p className="text-xs text-slate-400 font-medium">How many of your requests have been fulfilled</p>
                        </div>
                    </div>
                    <span className="text-2xl font-black text-emerald-600">{stats.fulfillmentRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.fulfillmentRate || 0}%` }}
                    />
                </div>
            </div>

            {/* ── Support & Mission Promotion ── */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner">
                        <HeartIcon className="animate-pulse" fill="currentColor" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Support Our National Mission</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-md">
                            Your contributions help us scale BloodConnect across every city in India.
                        </p>
                    </div>
                </div>
                <button onClick={() => setShowDonateModal(true)}
                    className="relative z-10 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-2 whitespace-nowrap">
                    <CreditCard size={18} /> CONTRIBUTE NOW
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ── Interactive Live Map ── */}
                    <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Live Heatmap</h3>
                                <p className="text-sm font-medium text-slate-500">Real-time view of requests and available donors near you.</p>
                            </div>
                        </div>
                        <LiveMap setActiveTab={setActiveTab} />
                    </div>

                    {/* ── Quick Actions ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton icon={Plus} label="New Request" onClick={() => setActiveTab('my-requests')} colorClass="border-teal-100 text-teal-600 bg-teal-50 hover:bg-teal-100" />
                        <QuickActionButton icon={AlertCircle} label="Find Donors" onClick={() => setActiveTab('find-donors')} colorClass="border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100" />
                        <QuickActionButton icon={HeartIcon} label="Gratitude" onClick={() => setActiveTab('gratitude')} colorClass="border-pink-100 text-pink-600 bg-pink-50 hover:bg-pink-100" />
                        <QuickActionButton icon={Bell} label="SOS Alert" onClick={() => setActiveTab('sos')} colorClass="border-amber-100 text-amber-600 bg-amber-50 hover:bg-amber-100" />
                    </div>
                </div>

                {/* Right Panel — Recent Activity */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                            {stats.recentActivity.length > 5 && (
                                <button onClick={() => setShowAllActivity(true)} className="text-xs font-bold text-teal-600 hover:underline">View All</button>
                            )}
                        </div>
                        <div className="space-y-5">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.slice(0, 5).map((item) => {
                                    const statusColor = item.status === 'Active' || item.status === 'active'
                                        ? 'bg-teal-100 text-teal-600'
                                        : item.status === 'Completed' || item.status === 'resolved'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-slate-100 text-slate-500';
                                    return (
                                        <div key={item.id} className="flex items-start gap-3 group cursor-pointer">
                                            <div className={`mt-0.5 min-w-[32px] h-8 rounded-full flex items-center justify-center ${statusColor} group-hover:scale-110 transition-transform`}>
                                                <Droplets size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-teal-600 transition-colors truncate">
                                                    {item.message}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-bold mt-1">
                                                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                                    {new Date(item.time).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10">
                                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-400">No activity yet — create your first request!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── All Activity Modal ── */}
            {showAllActivity && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAllActivity(false)} />
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <h3 className="text-xl font-black text-slate-800">Complete Activity Log</h3>
                            <button onClick={() => setShowAllActivity(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {stats.recentActivity.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                    <div className="mt-0.5 min-w-[40px] h-10 rounded-full flex items-center justify-center bg-teal-100 text-teal-600">
                                        <Droplets size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 leading-tight mb-1">{item.message}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(item.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {showDonateModal && <DonateModal closeModal={() => setShowDonateModal(false)} />}
        </div>
    );
};

export default ReceiverDashboardHome;
