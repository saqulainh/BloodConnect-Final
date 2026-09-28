import React, { useEffect, useState } from "react";
import { Bug, X, Trash2 } from "lucide-react";

const DEBUG_EVENT = "bloodconnect:api-error";

export default function DebugApiPopup() {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(true);

    const enabled = new URLSearchParams(window.location.search).get("debug") === "1";

    useEffect(() => {
        if (!enabled) return undefined;

        const handleApiError = (event) => {
            setEvents((previous) => [
                {
                    id: `${Date.now()}-${Math.random()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    ...event.detail,
                },
                ...previous,
            ].slice(0, 8));
            setOpen(true);
        };

        window.addEventListener(DEBUG_EVENT, handleApiError);
        return () => window.removeEventListener(DEBUG_EVENT, handleApiError);
    }, [enabled]);

    if (!enabled || !open) {
        return enabled ? (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-4 left-4 z-[10000] rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xl"
            >
                <Bug size={14} className="mr-2 inline" /> Show API issues ({events.length})
            </button>
        ) : null;
    }

    return (
        <aside className="fixed bottom-4 left-4 z-[10000] w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-2xl border-2 border-red-300 bg-white shadow-2xl">
            <header className="flex items-center justify-between bg-red-600 px-4 py-3 text-white">
                <div>
                    <p className="flex items-center gap-2 text-sm font-black"><Bug size={16} /> Temporary API Debug</p>
                    <p className="text-[10px] font-medium text-red-100">Debug mode • no passwords or tokens shown</p>
                </div>
                <div className="flex gap-1">
                    <button type="button" onClick={() => setEvents([])} aria-label="Clear API issues" className="rounded p-1 hover:bg-red-500"><Trash2 size={15} /></button>
                    <button type="button" onClick={() => setOpen(false)} aria-label="Close API debug popup" className="rounded p-1 hover:bg-red-500"><X size={17} /></button>
                </div>
            </header>
            <div className="max-h-72 overflow-y-auto p-3">
                {events.length === 0 ? (
                    <p className="py-5 text-center text-xs font-semibold text-slate-500">No API errors captured yet.</p>
                ) : events.map((item) => (
                    <div key={item.id} className="mb-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2 font-black text-red-700">
                            <span>{item.status ? `HTTP ${item.status}` : "NETWORK ERROR"}</span>
                            <span className="font-medium text-red-400">{item.timestamp}</span>
                        </div>
                        <p className="mt-1 break-all font-bold text-slate-700">{item.method} {item.endpoint}</p>
                        <p className="mt-1 break-words text-slate-600">{item.message}</p>
                    </div>
                ))}
            </div>
        </aside>
    );
}
