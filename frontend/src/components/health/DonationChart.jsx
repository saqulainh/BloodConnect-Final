import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2">
                <p className="text-xs font-black text-slate-600">{label}</p>
                <p className="text-sm font-black text-red-600">{payload[0].value} unit{payload[0].value !== 1 ? "s" : ""}</p>
            </div>
        );
    }
    return null;
}

export default function DonationChart({ chartData = [] }) {
    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                        <TrendingUp size={15} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-800">Your Contribution Growth</p>
                        <p className="text-xs text-slate-400 font-medium">Units donated over time</p>
                    </div>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <TrendingUp size={28} className="text-slate-300 mb-3" />
                    <p className="text-sm font-black text-slate-400">No donation data yet</p>
                    <p className="text-xs text-slate-300 mt-1 max-w-xs">
                        Log your first donation to see your contribution timeline grow here. Every unit counts! 💪
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="units"
                            stroke="#e53935"
                            strokeWidth={2.5}
                            fill="url(#redGradient)"
                            dot={{ fill: "#e53935", r: 4, strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, fill: "#e53935", stroke: "#fff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
