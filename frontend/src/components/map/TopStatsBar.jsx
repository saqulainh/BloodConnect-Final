import React from "react";
import { Activity, AlertTriangle, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TopStatsBar = ({ stats }) => {
    // stats: { activeRequests, criticalCases, availableDonors, avgResponseTime }

    const items = [
        { label: "Active Requests", value: stats?.activeRequests || 0, icon: Activity, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Critical Cases", value: stats?.criticalCases || 0, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-600/20", animate: true },
        { label: "Donors Online", value: stats?.availableDonors || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Avg Rescue Time", value: `${stats?.avgResponseTime || 14}m`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-4xl">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-wrap lg:flex-nowrap items-center justify-around gap-2"
            >
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:bg-white/5 group min-w-[140px]">
                        <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.animate ? 'animate-pulse' : ''}`}>
                            <item.icon size={20} className={item.color} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                            <span className="text-lg font-black text-white leading-none">{item.value}</span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default React.memo(TopStatsBar);
