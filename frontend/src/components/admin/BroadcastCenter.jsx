import React, { useState } from 'react';
import { Send, Megaphone, Loader2, CheckCircle, AlertCircle, Users, Radio } from 'lucide-react';
import { adminBroadcast } from '../../services/api';

const TYPES = [
    { value: 'info', label: '📢 Info', color: 'bg-blue-100 text-blue-700' },
    { value: 'warning', label: '⚠️ Warning', color: 'bg-amber-100 text-amber-700' },
    { value: 'critical', label: '🚨 Critical', color: 'bg-red-100 text-red-700' },
    { value: 'success', label: '✅ Success', color: 'bg-rose-100 text-rose-700' },
];

export default function BroadcastCenter() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [targetRole, setTargetRole] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) return;
        setSending(true);
        setResult(null);
        try {
            const res = await adminBroadcast({ title, message, type, targetRole: targetRole || undefined });
            if (res?.success) {
                setResult({ success: true, msg: res.message, data: res.data });
                setHistory(prev => [{ title, message, type, targetRole, time: new Date(), recipientCount: res.data?.recipientCount }, ...prev]);
                setTitle('');
                setMessage('');
            } else {
                setResult({ success: false, msg: res?.message || 'Failed' });
            }
        } catch (err) {
            setResult({ success: false, msg: 'Broadcast failed' });
        }
        finally { setSending(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Megaphone size={24} className="text-purple-600" /> Broadcast Center
                </h2>
                <p className="text-sm text-slate-400 mt-1">Send announcements and alerts to users</p>
            </div>

            {/* Compose */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <Radio size={18} className="text-purple-500" />
                    <span className="text-sm font-black text-slate-800">Compose Broadcast</span>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Emergency Blood Drive — Mumbai"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                        placeholder="Write your announcement here..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {TYPES.map(t => (
                                <button key={t.value} onClick={() => setType(t.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${type === t.value ? `${t.color} ring-2 ring-slate-300` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Target Audience</label>
                        <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                            <option value="">All Users</option>
                            <option value="donor">Donors Only</option>
                            <option value="receiver">Receivers Only</option>
                            <option value="admin">Admins Only</option>
                        </select>
                    </div>
                </div>

                <button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Send Broadcast
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className={`px-5 py-4 rounded-2xl flex items-center gap-3 ${result.success ? 'bg-rose-50 border border-rose-200' : 'bg-red-50 border border-red-200'}`}>
                    {result.success ? <CheckCircle size={20} className="text-rose-600" /> : <AlertCircle size={20} className="text-red-600" />}
                    <p className={`text-sm font-bold ${result.success ? 'text-rose-700' : 'text-red-700'}`}>{result.msg}</p>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-800 mb-4">Recent Broadcasts (This Session)</h3>
                    <div className="space-y-3">
                        {history.map((h, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-800 text-sm">{h.title}</span>
                                    <span className="text-[10px] font-black text-slate-400">
                                        {h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1">{h.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${TYPES.find(t => t.value === h.type)?.color || 'bg-slate-100'}`}>{h.type}</span>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <Users size={10} /> {h.recipientCount || '?'} recipients • {h.targetRole || 'all'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
