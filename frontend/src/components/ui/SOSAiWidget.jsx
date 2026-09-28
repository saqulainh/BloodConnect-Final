import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    MapPin,
    Phone,
    Send,
    ShieldAlert,
    Siren,
    Sparkles,
    X,
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const parseEmergencyText = (text) => {
    const normalizedText = text.trim().replace(/\s+/g, " ");
    if (!normalizedText) return {};

    const bloodGroupMatch = normalizedText.match(/\b(A|B|AB|O)\s*([+-]|positive|negative)\b/i);
    const bloodGroup = bloodGroupMatch
        ? `${bloodGroupMatch[1].toUpperCase()}${bloodGroupMatch[2].toLowerCase() === "positive" ? "+" : bloodGroupMatch[2].toLowerCase() === "negative" ? "-" : bloodGroupMatch[2]}`
        : undefined;
    const unitsMatch = normalizedText.match(/\b(\d+)\s*(?:units?|bags?)\b/i);
    const urgency = /critical|immediately|emergency|urgent/i.test(normalizedText)
        ? (/critical|immediately|emergency/i.test(normalizedText) ? "Critical" : "Urgent")
        : undefined;
    const hospitalMatch = normalizedText.match(/\b(?:at|in|near)\s+([\w .'-]+?)(?=\s+(?:for|needs?|requires?|urgent(?:ly)?|immediately|critical|emergency)\b|[,.]|$)/i);

    return {
        ...(bloodGroup && BLOOD_GROUPS.includes(bloodGroup) ? { bloodGroup } : {}),
        ...(unitsMatch ? { units: Number(unitsMatch[1]) } : {}),
        ...(urgency ? { urgency } : {}),
        ...(hospitalMatch ? { hospital: hospitalMatch[1].trim() } : {}),
    };
};

export default function SOSAiWidget() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);

    const analyzeMessage = () => {
        const details = parseEmergencyText(message);
        if (!Object.keys(details).length) {
            setResult({ error: "Try adding a blood group, hospital, units, or urgency." });
            return;
        }
        setResult(details);
    };

    return (
        <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end gap-3">
            {open && (
                <section className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl shadow-red-950/20">
                    <div className="bg-linear-to-br from-red-700 to-red-950 p-5 text-white">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-red-200">
                                    <Sparkles size={13} /> AI emergency assistant
                                </div>
                                <h2 className="text-lg font-black">Need blood urgently?</h2>
                                <p className="mt-1 text-xs leading-relaxed text-red-100">Describe the situation and we will organize the next safe step.</p>
                            </div>
                            <button onClick={() => setOpen(false)} aria-label="Close emergency assistant" className="rounded-xl p-2 text-red-100 hover:bg-white/10">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 p-4">
                        <div className="flex items-start gap-2 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-[11px] font-semibold leading-relaxed text-amber-800">
                            <ShieldAlert size={15} className="mt-0.5 shrink-0" />
                            AI suggests details only. Confirm with a hospital or blood bank before action.
                        </div>

                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={(event) => {
                                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") analyzeMessage();
                            }}
                            rows={3}
                            placeholder="e.g. 2 units O-negative needed at AIIMS Delhi urgently"
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                        />
                        <button onClick={analyzeMessage} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-xs font-black text-white transition hover:bg-red-700">
                            <Sparkles size={15} /> Analyze emergency
                        </button>

                        {result?.error && <p className="text-xs font-bold text-red-600">{result.error}</p>}
                        {result && !result.error && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">Detected details</p>
                                <div className="flex flex-wrap gap-2 text-xs font-black text-emerald-800">
                                    {result.bloodGroup && <span className="rounded-lg bg-white px-2 py-1">{result.bloodGroup}</span>}
                                    {result.units && <span className="rounded-lg bg-white px-2 py-1">{result.units} units</span>}
                                    {result.hospital && <span className="rounded-lg bg-white px-2 py-1">{result.hospital}</span>}
                                    {result.urgency && <span className="rounded-lg bg-white px-2 py-1">{result.urgency}</span>}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button onClick={() => navigate("/blood-banks")} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-[11px] font-black text-slate-700 hover:border-red-200 hover:text-red-600">
                                <Building2 size={14} /> Blood banks
                            </button>
                            <button onClick={() => navigate("/find-donors")} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-[11px] font-black text-slate-700 hover:border-red-200 hover:text-red-600">
                                <MapPin size={14} /> Find donors
                            </button>
                            <button onClick={() => navigate("/dashboard")} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-2 py-2.5 text-[11px] font-black text-white hover:bg-slate-800">
                                <Send size={14} /> Open SOS
                            </button>
                            <a href="tel:108" className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2 py-2.5 text-[11px] font-black text-white hover:bg-emerald-700">
                                <Phone size={14} /> Call 108
                            </a>
                        </div>
                    </div>
                </section>
            )}

            <button
                onClick={() => setOpen((isOpen) => !isOpen)}
                aria-label={open ? "Close emergency assistant" : "Open emergency assistant"}
                className="group flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-white shadow-xl shadow-red-600/30 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-300/40" />
                    <Siren size={16} className="relative" />
                </span>
                <span className="text-xs font-black">SOS AI</span>
            </button>
        </div>
    );
}
