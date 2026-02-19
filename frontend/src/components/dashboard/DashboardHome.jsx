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

const DashboardHome = ({ setActiveTab }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { label: 'Total Donors', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Requests', value: '12', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Pending Reviews', value: '45', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Upcoming Camps', value: '03', icon: Tent, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
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
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Request vs Donations</h3>
                        <select className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1 font-semibold text-slate-600 focus:ring-0">
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineChartData}>
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
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                                <Area type="monotone" dataKey="donations" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDon)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton icon={Plus} label="Add Donor" onClick={() => setActiveTab('donors')} colorClass="border-blue-200 text-blue-600" />
                    <QuickActionButton icon={AlertCircle} label="Create Request" onClick={() => setActiveTab('requests')} colorClass="border-red-200 text-red-600" />
                    <QuickActionButton icon={Tent} label="Create Camp" onClick={() => setActiveTab('camps')} colorClass="border-green-200 text-green-600" />
                    <QuickActionButton icon={Bell} label="Send Alert" onClick={() => { }} colorClass="border-amber-200 text-amber-600" />
                </div>
            </div>

            {/* Right Panel (Recent Activity & Pie Chart) */}
            <div className="space-y-6">
                {/* Blood Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 w-full text-left">Blood Groups</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                        <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((item) => (
                            <div key={item.id} className="flex items-start gap-3">
                                <div className={`mt-0.5 min-w-[32px] h-8 rounded-full flex items-center justify-center ${item.color}`}>
                                    <item.icon size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 leading-tight">{item.message}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default DashboardHome;
