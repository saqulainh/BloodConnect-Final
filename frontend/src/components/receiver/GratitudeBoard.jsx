import React, { useState, useEffect } from 'react';
import {
    Heart, Users, Gift, MessageCircle, Loader2, AlertCircle,
    CheckCircle, Send, X, Star
} from 'lucide-react';
import { getMyReceiverRequests, sendGratitudeTodonor, getReceiverWallet } from '../../services/api';

const GratitudeBoard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);
    const [showModal, setShowModal] = useState(null);
    const [message, setMessage] = useState('');
    const [sentIds, setSentIds] = useState(new Set());
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch fulfilled requests
                const reqRes = await getMyReceiverRequests();
                if (reqRes?.success) {
                    const fulfilled = reqRes.data.filter(r =>
                        (r.status === 'Completed' || r.status === 'resolved') && r.fulfilledBy
                    );
                    setRequests(fulfilled);
                }

                // Preload already-sent gratitudes from wallet (server-side tracking)
                const walletRes = await getReceiverWallet();
                if (walletRes?.success && walletRes.data.gratitudes) {
                    const alreadySent = new Set(
                        walletRes.data.gratitudes.map(g => g.request).filter(Boolean)
                    );
                    setSentIds(alreadySent);
                }
            } catch (err) { console.error("Error:", err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleSend = async (req) => {
        if (!req.fulfilledBy?._id) return;
        setSendingId(req._id);
        setErrorMsg('');
        try {
            const res = await sendGratitudeTodonor({
                requestId: req._id,
                donorId: req.fulfilledBy._id,
                message: message || "Thank you for saving a life! 🙏"
            });
            if (res?.success) {
                setSentIds(prev => new Set([...prev, req._id]));
                setShowModal(null);
                setMessage('');
            } else {
                setErrorMsg(res?.message || 'Failed to send gratitude');
            }
        } catch (err) {
            const msg = err?.message || 'Failed to send gratitude';
            if (msg.includes('already sent')) {
                setSentIds(prev => new Set([...prev, req._id]));
                setShowModal(null);
            }
            setErrorMsg(msg);
            console.error("Gratitude error:", err);
        }
        finally { setSendingId(null); }
    };

    const PRESET_MESSAGES = [
        "Thank you for saving a life! 🙏",
        "You are a true hero! Your donation made all the difference. 💚",
        "God bless you! My family is forever grateful. 🌟",
        "Words cannot express how thankful we are. You saved us! ❤️",
        "Your kindness gives us hope. Thank you, dear donor! 🙏✨",
    ];

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Heart size={32} fill="white" className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Gratitude Board 💚</h2>
                        <p className="text-pink-200 text-sm font-medium">Say thank you to the heroes who donated blood for you.</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-pink-600">{requests.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Donations Received</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-rose-600">{sentIds.size}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thanks Sent Today</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-purple-600">{[...new Set(requests.map(r => r.fulfilledBy?._id).filter(Boolean))].length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Donors</p>
                </div>
            </div>

            {/* Donor Cards */}
            {requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <Gift className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-lg font-black text-slate-300">No fulfilled requests yet</p>
                    <p className="text-sm text-slate-400 mt-1">Once donors fulfill your requests, you can thank them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map(req => {
                        const donor = req.fulfilledBy;
                        const alreadySent = sentIds.has(req._id);
                        return (
                            <div key={req._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            {donor?.profilePicture ? (
                                                <img src={donor.profilePicture} alt={donor.name} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                                            ) : (
                                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
                                                    {donor?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border-2 border-pink-100 rounded-full flex items-center justify-center text-[8px] font-black text-pink-600">
                                                {donor?.bloodGroup || '?'}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-800">{donor?.name || 'Anonymous Donor'}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{donor?.bloodGroup} donor • {req.hospital}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 mb-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-500">For: {req.patientName}</span>
                                            <span className="font-bold text-slate-400">{req.units} unit(s) • {req.bloodGroup}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(req.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>

                                    {alreadySent ? (
                                        <div className="flex items-center gap-2 py-3 bg-rose-50 rounded-xl px-4">
                                            <CheckCircle size={16} className="text-rose-500" />
                                            <span className="text-sm font-black text-rose-600">Gratitude Sent! 💚</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setShowModal(req); setMessage(''); }}
                                            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2">
                                            <Heart size={16} fill="white" /> Send Thanks
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Gratitude Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(null)} />
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Heart className="text-pink-500" size={20} fill="currentColor" />
                                Send Gratitude
                            </h3>
                            <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3">
                                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white font-black">
                                    {showModal.fulfilledBy?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-pink-800">{showModal.fulfilledBy?.name}</p>
                                    <p className="text-xs text-pink-500">{showModal.fulfilledBy?.bloodGroup} donor</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quick Messages</label>
                                <div className="space-y-2">
                                    {PRESET_MESSAGES.map((msg, idx) => (
                                        <button key={idx} onClick={() => setMessage(msg)}
                                            className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all ${message === msg ? 'bg-pink-100 text-pink-700 ring-2 ring-pink-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                            {msg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Or write your own</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Write a heartfelt message..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/30 resize-none" />
                            </div>

                            {errorMsg && (
                                <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">{errorMsg}</p>
                            )}

                            <button onClick={() => handleSend(showModal)} disabled={sendingId === showModal._id}
                                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50">
                                {sendingId === showModal._id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Send Gratitude 💚
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GratitudeBoard;
