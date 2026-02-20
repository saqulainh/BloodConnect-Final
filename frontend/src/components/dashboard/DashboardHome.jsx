import React from 'react';
import {
    Users,
    AlertCircle,
    Clock,
    Tent,
    Plus,
    Bell
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
import QuickActionButton from './QuickActionButton';
import { lineChartData, pieChartData, recentActivity, COLORS } from '../../data/dashboardData';

const DashboardHome = ({ setActiveTab, user }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = user?.name?.split(' ')[0] || 'there';

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
                            You have <span className="text-white font-black">12 active requests</span> waiting for donors near you.
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

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Donors', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Requests', value: '12', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Pending Reviews', value: '45', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column (Charts) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Analytics Section */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-800 text-lg">Request vs Donations</h3>
                            <div className="relative">
                                <select className="appearance-none text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 pr-8 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <option>This Week</option>
                                    <option>This Month</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            {/* Center Text Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-slate-800">1,240</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Total Donors</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={4}
                                    >
                                        {pieChartData.map((entry, index) => (
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
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">View All</button>
                        </div>
                        <div className="space-y-5">
                            {recentActivity.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 group cursor-pointer">
                                    <div className={`mt-0.5 min-w-[32px] h-8 rounded-full flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                        <item.icon size={14} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-red-600 transition-colors">{item.message}</p>
                                        <p className="text-[11px] text-slate-400 font-bold mt-1">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
