import React, { useState, useEffect } from 'react';
import {
    Wallet, Heart, Award, Users, Droplets, TrendingUp,
    CheckCircle2, Gift, Clock, Star, Shield, Zap, Activity, Calendar
} from 'lucide-react';
import { getReceiverWallet } from '../../services/api';

const BADGE_ORDER  = ["Newcomer", "Survivor", "Recovery Champion", "Life Warrior", "Miracle Hero"];
const BADGE_META   = {
    "Newcomer":          { emoji: "🌱", from: "from-slate-400", to: "to-slate-500", bg: "bg-slate-50",  text: "text-slate-600", ring: "ring-slate-300",  desc: "Just getting started" },
    "Survivor":          { emoji: "💪", from: "from-amber-400", to: "to-amber-500", bg: "bg-amber-50",  text: "text-amber-700", ring: "ring-amber-300",  desc: "2+ fulfilled requests" },
    "Recovery Champion": { emoji: "🏆", from: "from-red-400",   to: "to-red-600",   bg: "bg-red-50",   text: "text-red-700",   ring: "ring-red-300",    desc: "5+ fulfilled requests" },
    "Life Warrior":      { emoji: "⚔️", from: "from-rose-500",  to: "to-rose-700",  bg: "bg-rose-50",  text: "text-rose-700", ring: "ring-rose-300",   desc: "10+ fulfilled requests" },
    "Miracle Hero":      { emoji: "✨", from: "from-purple-500", to: "to-pink-600",  bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-300", desc: "20+ fulfilled requests" },
};

// SVG circular progress ring
const ProgressRing = ({ pct, size = 120, stroke = 8, color = "#DC2626" }) => {
    const r   = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
                strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
    );
};

const ReceiverWallet = () => {
    const [wallet,  setWallet]  = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab,     setTab]     = useState('impact'); // 'impact' | 'history' | 'gratitudes'

    useEffect(() => {
        (async () => {
            try {
                const res = await getReceiverWallet();
                if (res?.success) setWallet(res.data);
            } catch (err) { console.error("Wallet fetch error:", err); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">Loading your wallet...</p>
        </div>
    );

    if (!wallet) return (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <Wallet className="w-14 h-14 text-slate-200 mx-auto mb-3" />
            <p className="text-xl font-black text-slate-300">Wallet not initialized</p>
            <p className="text-sm text-slate-400 mt-1">Create your first blood request to activate your wallet.</p>
        </div>
    );

    const badge     = wallet.badge || {};
    const badgeName = badge.badgeName || 'Newcomer';
    const meta      = BADGE_META[badgeName] || BADGE_META['Newcomer'];
    const badgeIdx  = BADGE_ORDER.indexOf(badgeName);

    const TABS = [
        { k: 'impact',     label: '⚡ Impact' },
        { k: 'history',    label: '📋 History' },
        { k: 'gratitudes', label: '💚 Gratitudes' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Badge Hero ── */}
            <div className={`relative overflow-hidden bg-gradient-to-br ${meta.from} ${meta.to} rounded-3xl p-6 lg:p-8 text-white shadow-xl`}>
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    {/* Progress Ring */}
                    <div className="relative shrink-0">
                        <ProgressRing pct={badge.progressPercentage || 0} size={110} stroke={8} color="rgba(255,255,255,0.9)" />
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl">{meta.emoji}</span>
                            <span className="text-xs font-black text-white/80 mt-0.5">{badge.progressPercentage || 0}%</span>
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Current Rank</p>
                        <h2 className="text-3xl font-black tracking-tight">{badgeName}</h2>
                        <p className="text-white/70 text-sm font-medium mt-1">{meta.desc}</p>
                        {badge.nextBadge && (
                            <div className="mt-3 max-w-xs">
                                <div className="flex items-center justify-between text-xs font-bold text-white/80 mb-1.5">
                                    <span>→ {badge.nextBadge}</span>
                                    <span>{badge.requestsToNext} more to unlock</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000"
                                        style={{ width: `${badge.progressPercentage || 0}%` }} />
                                </div>
                            </div>
                        )}
                        {!badge.nextBadge && (
                            <p className="text-white/80 text-sm font-bold mt-3">✨ Maximum rank achieved! You are a legend.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Units Received",   value: wallet.totalUnitsReceived,     icon: Droplets,     color: "text-red-600",   bg: "bg-red-50" },
                    { label: "Requests Made",    value: wallet.totalRequestsMade,      icon: CheckCircle2, color: "text-blue-600",  bg: "bg-blue-50" },
                    { label: "Lives Impacted",   value: wallet.livesImpacted,          icon: Heart,        color: "text-rose-600",  bg: "bg-rose-50" },
                    { label: "Donors Who Helped",value: wallet.uniqueDonors,           icon: Users,        color: "text-purple-600",bg: "bg-purple-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color} mb-3 group-hover:scale-110 transition-transform`}>
                            <s.icon size={20} />
                        </div>
                        <p className="text-2xl font-black text-slate-800">{s.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Avg Fulfilment Time ── */}
            {wallet.avgFulfillmentHours >= 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <Clock size={26} />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-800">
                            {wallet.avgFulfillmentHours}<span className="text-base text-slate-400 font-bold">h</span>
                        </p>
                        <p className="text-sm font-black text-slate-600">Average Fulfillment Time</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">From request creation to blood received</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs font-bold text-slate-400">Gratitudes Sent</p>
                        <p className="text-2xl font-black text-rose-600">{wallet.gratitudesSent}</p>
                    </div>
                </div>
            )}

            {/* Tab Switcher */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
                {TABS.map(({ k, label }) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${tab === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── IMPACT TAB ── */}
            {tab === 'impact' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Zap className="text-amber-500" size={20} /> Badge Evolution Journey
                    </h3>
                    <div className="flex items-center gap-0 overflow-x-auto pb-2">
                        {BADGE_ORDER.map((name, idx) => {
                            const m       = BADGE_META[name];
                            const isNow   = name === badgeName;
                            const isDone  = idx <= badgeIdx;
                            const isNext  = idx === badgeIdx + 1;
                            return (
                                <div key={name} className="flex items-center shrink-0">
                                    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isNow ? `${m.bg} ring-2 ${m.ring} shadow-md scale-110` : isDone ? 'opacity-70' : isNext ? 'opacity-40' : 'opacity-20'}`}>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.from} ${m.to} flex items-center justify-center text-xl shadow-md`}>
                                            {isDone || isNow ? m.emoji : <Shield size={18} color="white" />}
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-[9px] font-black uppercase tracking-wide ${isNow ? m.text : 'text-slate-400'}`}>{name}</p>
                                            {isNow && <p className="text-[8px] text-slate-400 font-medium">← YOU</p>}
                                        </div>
                                    </div>
                                    {idx < BADGE_ORDER.length - 1 && (
                                        <div className={`w-10 h-0.5 mx-1 rounded-full shrink-0 ${isDone ? 'bg-red-300' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Impact Statement */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        {[
                            { label: "Blood Units", value: `${wallet.totalUnitsReceived || 0} units`, sub: "received in total" },
                            { label: "Fulfilled",   value: `${wallet.totalRequestsFulfilled || 0}`,   sub: "of your requests" },
                            { label: "Success Rate", value: wallet.totalRequestsMade > 0 ? `${Math.round((wallet.totalRequestsFulfilled / wallet.totalRequestsMade) * 100)}%` : '0%', sub: "fulfillment rate" },
                        ].map(({ label, value, sub }) => (
                            <div key={label} className="text-center p-4 bg-slate-50 rounded-2xl">
                                <p className="text-xl font-black text-slate-800">{value}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── HISTORY TAB ── */}
            {tab === 'history' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="text-blue-500" size={20} /> Recent Blood Received
                    </h3>
                    {wallet.recentFulfilled?.length > 0 ? (
                        <div className="space-y-3">
                            {wallet.recentFulfilled.map((r, idx) => (
                                <div key={r._id || idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                                        {r.bloodGroup}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-800 truncate">{r.hospital}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                            {r.units} unit{r.units > 1 ? 's' : ''} received
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(r.resolvedAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </p>
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">✅ Fulfilled</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-400">No fulfilled requests yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── GRATITUDES TAB ── */}
            {tab === 'gratitudes' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Gift className="text-pink-500" size={20} /> Gratitude Messages Sent
                        </h3>
                        <span className="text-2xl font-black text-pink-600">{wallet.gratitudesSent}</span>
                    </div>
                    {wallet.gratitudes?.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {[...wallet.gratitudes].reverse().map((g, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-pink-50 rounded-2xl border border-pink-100">
                                    <div className="w-9 h-9 bg-pink-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Heart size={14} color="white" fill="white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 leading-snug">"{g.message}"</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                                            Sent {new Date(g.sentAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Gift className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-400">No gratitude sent yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Once donors fulfill your requests, thank them from the Gratitude Board!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReceiverWallet;
