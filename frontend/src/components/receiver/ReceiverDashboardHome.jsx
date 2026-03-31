import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Ticket, CheckCircle2, Droplets, Clock, Plus, Bell,
    Heart as HeartIcon, CreditCard, X, AlertCircle, TrendingUp,
    Zap, MapPin, ArrowRight, RefreshCw, Activity, Users
} from 'lucide-react';
import { getReceiverStats, getCurrentLocation, getNearbyUrgent } from '../../services/api';
import QuickActionButton from '../dashboard/QuickActionButton';
import LiveMap from '../dashboard/LiveMap';
import DonateModal from '../dashboard/DonateModal';

// Animated counter hook
const useCountUp = (target, duration = 800) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        const step = target / (duration / 16);
        let cur = 0;
        const timer = setInterval(() => {
            cur = Math.min(cur + step, target);
            setCount(Math.floor(cur));
            if (cur >= target) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
};

const StatCard = ({ label, value, icon: Icon, color, bg, suffix = '' }) => {
    const num = parseInt(value) || 0;
    const animated = useCountUp(num);
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 group">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-800">
                    {typeof value === 'string' && isNaN(parseInt(value)) ? value : `${animated}${suffix}`}
                </h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
        </div>
    );
};

const ReceiverDashboardHome = ({ setActiveTab, user }) => {
    const hour      = new Date().getHours();
    const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';

    const [stats, setStats] = useState({
        totalRequests: 0, activeRequests: 0, fulfilledRequests: 0,
        avgResponseHours: 0, fulfillmentRate: 0, totalUnitsFulfilled: 0,
        cancelledRequests: 0, recentActivity: [], urgencyBreakdown: {},
    });
    const [nearby,         setNearby]         = useState([]);
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [lastUpdated,    setLastUpdated]     = useState(null);
    const [refreshing,     setRefreshing]      = useState(false);
    const pollRef = useRef(null);

    const fetchStats = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const res = await getReceiverStats();
            if (res?.success) {
                setStats(res.data);
                setLastUpdated(new Date());
            }
        } catch (err) { console.error('Failed to fetch receiver stats', err); }
        finally { setRefreshing(false); }
    }, []);

    const fetchNearby = useCallback(async () => {
        try {
            const loc = await getCurrentLocation();
            const res = await getNearbyUrgent(loc.lat, loc.lng, 30);
            if (res?.success) setNearby(res.data || []);
        } catch { /* geo optional — silently fail */ }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchNearby();
        // Poll every 60s
        pollRef.current = setInterval(() => { fetchStats(true); fetchNearby(); }, 60_000);
        return () => clearInterval(pollRef.current);
    }, [fetchStats, fetchNearby]);

    const criticalNearby = nearby.filter(r => r.urgency === 'Critical');

    const timeAgo = (d) => {
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60)    return `${s}s ago`;
        if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Critical Alert Banner ── */}
            {criticalNearby.length > 0 && (
                <div className="bg-red-600 rounded-2xl p-4 flex items-center justify-between text-white animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                            <Zap size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider opacity-80">Critical Alert</p>
                            <p className="text-sm font-bold">
                                {criticalNearby.length} critical blood request{criticalNearby.length > 1 ? 's' : ''} within 30km of you!
                                <span className="mx-1">·</span>
                                {criticalNearby[0]?.bloodGroup} needed at {criticalNearby[0]?.hospital}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('live-map')}
                        className="shrink-0 px-4 py-2 bg-white text-red-700 text-xs font-black rounded-xl flex items-center gap-1 hover:bg-red-50 transition">
                        View Map <ArrowRight size={12} />
                    </button>
                </div>
            )}

            {/* ── Greeting Banner ── */}
            <div className="bg-gradient-to-br from-red-600 to-rose-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-red-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-red-900/30 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                        <p className="text-red-200 text-sm font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-rose-300 rounded-full animate-pulse" />
                            {greeting}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">
                            {firstName}! {user?.bloodGroup && <span className="text-red-200">({user.bloodGroup})</span>}
                        </h2>
                        <p className="text-red-100 text-sm font-medium">
                            You have <span className="text-white font-black">{stats.activeRequests} active request{stats.activeRequests !== 1 ? 's' : ''}</span> — we're actively finding donors.
                        </p>
                        {lastUpdated && (
                            <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                                <Activity size={10} className={refreshing ? 'animate-spin' : ''} />
                                Updated {timeAgo(lastUpdated)}
                                {refreshing && ' · Refreshing...'}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => setActiveTab('my-requests')}
                            className="px-5 py-2.5 bg-white text-red-700 text-sm font-black rounded-xl hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap">
                            🩸 My Requests
                        </button>
                        <button onClick={() => setActiveTab('find-donors')}
                            className="px-5 py-2.5 bg-red-700/60 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors border border-red-500/40 flex items-center gap-2 whitespace-nowrap">
                            🔍 Find Donors
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Requests"  value={stats.activeRequests}     icon={Ticket}       color="text-red-600"  bg="bg-red-50" />
                <StatCard label="Fulfilled"        value={stats.fulfilledRequests}  icon={CheckCircle2} color="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Units Received"   value={stats.totalUnitsFulfilled || 0} icon={Droplets} color="text-red-800" bg="bg-red-50" />
                <StatCard label="Avg Response"     value={stats.avgResponseHours || 0}  icon={Clock}  color="text-rose-600" bg="bg-rose-50" suffix="h" />
            </div>

            {/* ── Fulfillment Rate + Urgency ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800">Fulfillment Rate</p>
                                <p className="text-xs text-slate-400 font-medium">Requests fulfilled successfully</p>
                            </div>
                        </div>
                        <span className="text-2xl font-black text-rose-600">{stats.fulfillmentRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-1000"
                            style={{ width: `${stats.fulfillmentRate || 0}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-2">
                        {stats.cancelledRequests > 0 && `${stats.cancelledRequests} cancelled · `}
                        {stats.totalRequests || 0} total requests
                    </p>
                </div>

                {/* Urgency Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800">Urgency Breakdown</p>
                            <p className="text-xs text-slate-400 font-medium">Your requests by priority</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[
                            { k: 'Critical', color: 'bg-red-500',    text: 'text-red-700',   label: '🔴 Critical' },
                            { k: 'Urgent',   color: 'bg-amber-400',  text: 'text-amber-700', label: '🟠 Urgent' },
                            { k: 'Normal',   color: 'bg-slate-300',  text: 'text-slate-600', label: '🟢 Normal' },
                        ].map(({ k, color, text, label }) => {
                            const cnt = stats.urgencyBreakdown?.[k] || 0;
                            const pct = stats.totalRequests > 0 ? Math.round((cnt / stats.totalRequests) * 100) : 0;
                            return (
                                <div key={k} className="flex items-center gap-3">
                                    <span className={`text-xs font-bold w-20 ${text}`}>{label}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-slate-600 w-8 text-right">{cnt}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Support Promo ── */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700" />
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                        <HeartIcon className="animate-pulse" fill="currentColor" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Support Our National Mission</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-md">
                            Help us scale BloodConnect across every city in India.
                        </p>
                    </div>
                </div>
                <button onClick={() => setShowDonateModal(true)}
                    className="relative z-10 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-2 whitespace-nowrap">
                    <CreditCard size={18} /> CONTRIBUTE NOW
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Live EIMS Heatmap</h3>
                            <p className="text-sm font-medium text-slate-500">Real-time donor & request activity near you</p>
                        </div>
                        {nearby.length > 0 && (
                            <span className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {nearby.length} nearby
                            </span>
                        )}
                    </div>
                    <LiveMap setActiveTab={setActiveTab} />
                </div>

                {/* Right Panel */}
                <div className="space-y-4">
                    {/* Quick Actions */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickActionButton icon={Plus}       label="New Request"  onClick={() => setActiveTab('my-requests')}        colorClass="border-red-100 text-red-600 bg-red-50 hover:bg-red-100" />
                            <QuickActionButton icon={AlertCircle} label="Find Donors" onClick={() => setActiveTab('find-donors')}        colorClass="border-red-100 text-red-600 bg-red-50 hover:bg-red-100" />
                            <QuickActionButton icon={HeartIcon}   label="Gratitude"   onClick={() => setActiveTab('gratitude')}          colorClass="border-rose-100 text-rose-700 bg-red-50 hover:bg-rose-100" />
                            <QuickActionButton icon={Bell}        label="SOS Alert"   onClick={() => setActiveTab('sos')}                colorClass="border-rose-100 text-rose-700 bg-red-50 hover:bg-rose-100" />
                            <QuickActionButton icon={TrendingUp}  label="Analytics"   onClick={() => setActiveTab('receiver-analytics')} colorClass="border-slate-100 text-slate-600 bg-slate-50 hover:bg-slate-100" />
                            <QuickActionButton icon={Clock}       label="Timeline"    onClick={() => setActiveTab('request-timeline')}   colorClass="border-slate-100 text-slate-600 bg-slate-50 hover:bg-slate-100" />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-800">Recent Activity</h3>
                            {stats.recentActivity.length > 4 && (
                                <button onClick={() => setShowAllActivity(true)} className="text-xs font-bold text-red-600 hover:underline">View All</button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.slice(0, 4).map((item) => {
                                    const statusIcon = item.status === 'Active' || item.status === 'active' ? '⏳'
                                        : item.status === 'Completed' || item.status === 'resolved' ? '✅' : '🚫';
                                    return (
                                        <div key={item.id} className="flex items-start gap-3 group cursor-pointer"
                                            onClick={() => setActiveTab('my-requests')}>
                                            <div className={`mt-0.5 min-w-[32px] h-8 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform bg-slate-50`}>
                                                {statusIcon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-red-600 transition-colors truncate">
                                                    {item.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                    {timeAgo(item.time)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-400">No activity yet — create your first request!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* All Activity Modal */}
            {showAllActivity && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAllActivity(false)} />
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-800">Complete Activity Log</h3>
                            <button onClick={() => setShowAllActivity(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {stats.recentActivity.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                    <div className="mt-0.5 min-w-[40px] h-10 rounded-full flex items-center justify-center bg-red-50 text-xl">
                                        {item.status === 'Completed' || item.status === 'resolved' ? '✅' : item.status === 'Cancelled' ? '🚫' : '⏳'}
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
