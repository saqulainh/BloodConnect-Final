import React, { useState, useEffect } from 'react';
import {
    Users,
    AlertCircle,
    Clock,
    Tent,
    Plus,
    Bell,
    CheckCircle,
    Droplets as BloodIcon,
    Heart as HeartIcon,
    X
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { getAnalytics } from '../../services/api';
import QuickActionButton from './QuickActionButton';
import { recentActivity as fallbackRecentActivity, COLORS } from '../../data/dashboardData';
import LiveMap from './LiveMap';
import DonateModal from './DonateModal';

const DashboardHome = ({ setActiveTab, user }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';

    const [analytics, setAnalytics] = useState({
        totalDonors: "...",
        totalRequests: "...",
        fulfilledRequests: "...",
        urgentRequests: "...",
        recentActivityChart: [],
        recentActivityLogs: [],
        bloodGroupDistribution: []
    });

    const [timeframe, setTimeframe] = useState('week');
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [showDonateModal, setShowDonateModal] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getAnalytics(timeframe);
                if (res && res.success) {
                    setAnalytics(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchAnalytics();
    }, [timeframe]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Greeting Banner ── */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-red-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-red-900/30 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                        <p className="text-red-200 text-sm font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            {greeting}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                            {firstName}! {user?.bloodGroup && <span className="text-red-200">({user.bloodGroup})</span>}
                        </h2>
                        <p className="text-red-200 text-sm font-medium">
                            You have <span className="text-white font-black">{analytics.totalRequests} active requests</span> waiting for donors near you.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setActiveTab('requests')}
                            className="px-5 py-2.5 bg-white text-red-600 text-sm font-black rounded-xl hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap">
                            🩸 View Requests
                        </button>
                        <button onClick={() => setActiveTab('donors')}
                            className="px-5 py-2.5 bg-red-700/60 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors border border-red-500/40 flex items-center gap-2 whitespace-nowrap">
                            👥 Find Donors
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Donors', value: analytics.totalDonors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Requests', value: analytics.totalRequests, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Urgent Pendings', value: analytics.urgentRequests, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Upcoming Camps', value: '03', icon: Tent, color: 'text-green-600', bg: 'bg-green-50' },
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

            {/* ── Support & Mission Promotion ── */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                        <HeartIcon className="animate-pulse" fill="currentColor" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Support Our National Mission</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-md">
                            Your contributions help us scale BloodConnect across every city in India, ensuring no life is lost due to blood unavailability.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowDonateModal(true)}
                    className="relative z-10 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-2 whitespace-nowrap"
                >
                    <CreditCard size={18} />
                    CONTRIBUTE NOW
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column (Charts & Map) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ── Interactive Live Map ── */}
                    <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Live Heatmap</h3>
                                <p className="text-sm font-medium text-slate-500">Real-time geographic view of requests and available donors.</p>
                            </div>
                        </div>
                        <LiveMap />
                    </div>

                    {/* Analytics Section */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-800 text-lg">Request vs Donations</h3>
                            <div className="relative">
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="appearance-none text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 pr-8 cursor-pointer hover:bg-slate-100 transition-colors"
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            {analytics.recentActivityChart.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={analytics.recentActivityChart}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}
                                        />
                                        <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                                        <Area type="monotone" dataKey="donations" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDon)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                                    <Clock className="w-8 h-8 text-slate-200 mb-2" />
                                    <p className="text-sm font-bold text-slate-400">No activity data found for this period.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions - matching styles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton icon={Plus} label="Add Donor" onClick={() => setActiveTab('donors')} colorClass="border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100" />
                        <QuickActionButton icon={AlertCircle} label="Create Request" onClick={() => setActiveTab('requests')} colorClass="border-red-100 text-red-600 bg-red-50 hover:bg-red-100" />
                        <QuickActionButton icon={Tent} label="Create Camp" onClick={() => setActiveTab('camps')} colorClass="border-green-100 text-green-600 bg-green-50 hover:bg-green-100" />
                        <QuickActionButton icon={Bell} label="Send Alert" onClick={() => { }} colorClass="border-amber-100 text-amber-600 bg-amber-50 hover:bg-amber-100" />
                    </div>
                </div>

                {/* Right Panel (Recent Activity & Pie Chart) */}
                <div className="space-y-6">
                    {/* Blood Distribution */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 w-full text-left">Blood Groups</h3>
                        <div className="h-[220px] w-full relative">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-slate-800">{analytics.totalDonors}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Total Donors</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.bloodGroupDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={4}
                                    >
                                        {analytics.bloodGroupDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                            <button
                                onClick={() => setShowAllActivity(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-5">
                            {analytics.recentActivityLogs.length > 0 ? (
                                analytics.recentActivityLogs.map((item) => {
                                    const isRequest = item.type === 'request';
                                    const Icon = isRequest ? BloodIcon : HeartIcon;
                                    const color = isRequest
                                        ? (item.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')
                                        : 'bg-emerald-100 text-emerald-600';

                                    return (
                                        <div key={item.id} className="flex items-start gap-3 group cursor-pointer">
                                            <div className={`mt-0.5 min-w-[32px] h-8 rounded-full flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-red-600 transition-colors truncate">
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
                                    <p className="text-xs font-bold text-slate-400">No activity yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── View All Activity Modal ── */}
            {showAllActivity && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAllActivity(false)} />
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <h3 className="text-xl font-black text-slate-800">Complete Activity Log</h3>
                            <button onClick={() => setShowAllActivity(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {analytics.recentActivityLogs.map((item) => {
                                const isRequest = item.type === 'request';
                                const Icon = isRequest ? BloodIcon : HeartIcon;
                                const color = isRequest
                                    ? (item.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')
                                    : 'bg-emerald-100 text-emerald-600';

                                return (
                                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                        <div className={`mt-0.5 min-w-[40px] h-10 rounded-full flex items-center justify-center ${color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 leading-tight mb-1">{item.message}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(item.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {/* ── Donation Modal ── */}
            {showDonateModal && <DonateModal closeModal={() => setShowDonateModal(false)} />}
        </div>
    );
};

export default DashboardHome;
