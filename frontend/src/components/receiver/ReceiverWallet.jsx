import React, { useState, useEffect } from 'react';
import {
    Wallet, Heart, Award, Users, Droplets, TrendingUp,
    CheckCircle2, Gift, Clock, Star, Shield
} from 'lucide-react';
import { getReceiverWallet } from '../../services/api';

const BADGE_COLORS = {
    "Newcomer": { from: "from-slate-400", to: "to-slate-600", bg: "bg-slate-50", text: "text-slate-600", ring: "ring-slate-200" },
    "Survivor": { from: "from-amber-400", to: "to-amber-600", bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
    "Recovery Champion": { from: "from-red-400", to: "to-red-600", bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" },
    "Life Warrior": { from: "from-blue-400", to: "to-blue-600", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200" },
    "Miracle Hero": { from: "from-purple-400", to: "to-purple-600", bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-200" },
};

const ReceiverWallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await getReceiverWallet();
                if (res?.success) setWallet(res.data);
            } catch (err) { console.error("Wallet fetch error:", err); }
            finally { setLoading(false); }
        };
        fetchWallet();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
    );

    if (!wallet) return (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-lg font-black text-slate-300">No wallet data yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first blood request to initialize your wallet.</p>
        </div>
    );

    const badge = wallet.badge || {};
    const colors = BADGE_COLORS[badge.badgeName] || BADGE_COLORS["Newcomer"];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Badge Hero Card ── */}
            <div className={`relative overflow-hidden bg-gradient-to-br ${colors.from} ${colors.to} rounded-3xl p-8 text-white shadow-xl`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center text-5xl backdrop-blur-sm border border-white/20 shadow-inner">
                        {badge.badgeEmoji || '🌱'}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Current Rank</p>
                        <h2 className="text-3xl font-black tracking-tight">{badge.badgeName || 'Newcomer'}</h2>
                        {badge.nextBadge && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs font-bold text-white/80 mb-1">
                                    <span>Progress to {badge.nextBadge}</span>
                                    <span>{badge.progressPercentage}%</span>
                                </div>
                                <div className="w-full max-w-xs bg-white/20 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${badge.progressPercentage}%` }} />
                                </div>
                                <p className="text-xs text-white/60 font-medium mt-1">{badge.requestsToNext} more fulfilled requests to next rank</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Units Received", value: wallet.totalUnitsReceived, icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
                    { label: "Requests Made", value: wallet.totalRequestsMade, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Lives Impacted", value: wallet.livesImpacted, icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
                    { label: "Donors Helped You", value: wallet.uniqueDonors, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
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

            {/* ── Gratitude Stats ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Gift className="text-pink-500" size={20} /> Gratitude Sent
                </h3>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl font-black text-pink-600">{wallet.gratitudesSent}</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-600">Thank-you messages sent to donors</p>
                        <p className="text-xs text-slate-400 mt-1">Every gratitude strengthens the donor community 💚</p>
                    </div>
                </div>
            </div>

            {/* ── Gratitude Log ── */}
            {wallet.gratitudes && wallet.gratitudes.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Recent Gratitudes</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {wallet.gratitudes.slice().reverse().map((g, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                                    <Heart size={14} fill="currentColor" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate">{g.message}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(g.sentAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Badge Journey ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Star className="text-amber-500" size={20} /> Badge Evolution
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {Object.entries(BADGE_COLORS).map(([name, c], idx) => {
                        const isActive = name === badge.badgeName;
                        const isPast = ["Newcomer", "Survivor", "Recovery Champion", "Life Warrior", "Miracle Hero"]
                            .indexOf(name) <= ["Newcomer", "Survivor", "Recovery Champion", "Life Warrior", "Miracle Hero"].indexOf(badge.badgeName);
                        return (
                            <div key={name} className="flex items-center gap-3 shrink-0">
                                <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isActive ? `${c.bg} ring-2 ${c.ring} shadow-md scale-110` : isPast ? 'opacity-60' : 'opacity-30'}`}>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center text-white text-lg shadow-md`}>
                                        {isPast || isActive ? <CheckCircle2 size={20} /> : <Shield size={20} />}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? c.text : 'text-slate-400'}`}>{name}</span>
                                </div>
                                {idx < 4 && <div className={`w-8 h-0.5 ${isPast ? 'bg-red-300' : 'bg-slate-200'} rounded-full shrink-0`} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReceiverWallet;
