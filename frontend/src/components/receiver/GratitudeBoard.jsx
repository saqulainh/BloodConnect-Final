import React, { useState, useEffect } from 'react';
import {
    Heart, Users, Gift, MessageCircle, Loader2, AlertCircle,
    CheckCircle, Send, X, Star, Sparkles, Clock, Droplets
} from 'lucide-react';
import { getMyReceiverRequests, sendGratitudeTodonor, getReceiverWallet } from '../../services/api';

const PRESET_MESSAGES = [
    "Thank you for saving a life! 🙏",
    "You are a true hero! Your donation made all the difference. 💚",
    "God bless you! My family is forever grateful. 🌟",
    "Words cannot express how thankful we are. You saved us! ❤️",
    "Your kindness gives us hope. Thank you, dear donor! 🙏✨",
    "You restored our faith in humanity. Forever grateful! 🫶",
];

// Star Rating Component
const StarRating = ({ value, onChange, size = 24 }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(star)}
                    className="transition-transform hover:scale-110 active:scale-95">
                    <Star
                        size={size}
                        className={`transition-colors ${(hover || value) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                    />
                </button>
            ))}
        </div>
    );
};

// Gratitude Modal
const GratitudeModal = ({ req, onClose, onSend, sending }) => {
    const [message, setMessage] = useState('');
    const [rating,  setRating]  = useState(5);
    const [error,   setError]   = useState('');
    const charLimit = 300;

    const handleSend = async () => {
        if (!message.trim()) { setError('Please write or select a message.'); return; }
        setError('');
        onSend(req, message, rating);
    };

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 border-b border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                            <Heart size={18} color="white" fill="white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Send Gratitude</h3>
                            <p className="text-xs text-slate-400 font-medium">To {req.fulfilledBy?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Donor info */}
                    <div className="flex items-center gap-3 bg-rose-50 rounded-xl p-3 border border-rose-100">
                        <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center text-white font-black">
                            {req.fulfilledBy?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-sm font-black text-rose-800">{req.fulfilledBy?.name}</p>
                            <p className="text-xs text-rose-500 font-medium">{req.fulfilledBy?.bloodGroup} donor · {req.hospital}</p>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Rate Your Experience</label>
                        <div className="flex items-center gap-3">
                            <StarRating value={rating} onChange={setRating} size={28} />
                            <span className="text-sm font-bold text-slate-600">
                                {rating === 5 ? 'Excellent! 🌟' : rating === 4 ? 'Great! 😊' : rating === 3 ? 'Good 👍' : rating === 2 ? 'Fair 😐' : 'Poor 😔'}
                            </span>
                        </div>
                    </div>

                    {/* Quick messages */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quick Messages</label>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {PRESET_MESSAGES.map((msg, idx) => (
                                <button key={idx} type="button" onClick={() => setMessage(msg)}
                                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all ${message === msg ? 'bg-rose-50 text-rose-700 border-2 border-rose-300 ring-1 ring-rose-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                                    {msg}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom message textarea */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Or Write Your Own</label>
                            <span className={`text-[10px] font-bold ${message.length > charLimit * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                                {message.length}/{charLimit}
                            </span>
                        </div>
                        <textarea
                            value={message} onChange={e => { if (e.target.value.length <= charLimit) setMessage(e.target.value); }}
                            rows={3} placeholder="Write a heartfelt message from your heart..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-none transition" />
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl flex items-center gap-2">
                            <AlertCircle size={12} />{error}
                        </p>
                    )}

                    <button onClick={handleSend} disabled={sending}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black rounded-xl hover:from-rose-700 hover:to-rose-800 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50">
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Send Gratitude 💚
                    </button>
                </div>
            </div>
        </div>
    );
};

// Donor Card
const DonorCard = ({ req, alreadySent, onThank, onStartChat }) => {
    const donor = req.fulfilledBy;
    const timeAgo = (d) => {
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    return (
        <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${alreadySent ? 'border-rose-100 bg-rose-50/30' : 'border-slate-100'}`}>
            {alreadySent && <div className="h-0.5 w-full bg-gradient-to-r from-rose-400 to-pink-400" />}
            <div className="p-5">
                {/* Donor info */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        {donor?.profilePicture ? (
                            <img src={donor.profilePicture} alt={donor.name} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                        ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                                {donor?.name?.charAt(0) || '?'}
                            </div>
                        )}
                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-[9px] font-black text-red-600 shadow-sm">
                            {donor?.bloodGroup || '?'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-slate-800">{donor?.name || 'Anonymous Donor'}</h4>
                        <p className="text-xs text-slate-400 font-medium">{donor?.bloodGroup} donor</p>
                    </div>
                    {alreadySent && (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 rounded-full border border-rose-200">
                            <CheckCircle size={12} className="text-rose-600" />
                            <span className="text-[10px] font-black text-rose-700">Thanked!</span>
                        </div>
                    )}
                </div>

                {/* Request info */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-600 flex items-center gap-1">
                            <Droplets size={10} className="text-red-500" /> For: {req.patientName}
                        </span>
                        <span className="font-bold text-slate-400">{req.units} unit{req.units > 1 ? 's' : ''} · {req.bloodGroup}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={9} /> {timeAgo(req.createdAt)} · {req.hospital}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {!alreadySent && (
                        <button onClick={() => onThank(req)}
                            className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-black rounded-xl hover:from-rose-700 hover:to-rose-800 transition shadow-lg shadow-rose-200 flex items-center justify-center gap-1.5">
                            <Heart size={12} fill="white" /> Send Thanks
                        </button>
                    )}
                    {onStartChat && donor && (
                        <button onClick={() => onStartChat(donor)}
                            className={`${alreadySent ? 'flex-1' : ''} py-2.5 px-4 bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1.5`}>
                            <MessageCircle size={12} /> Chat
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Component
const GratitudeBoard = ({ onStartChat }) => {
    const [requests,    setRequests]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [sendingId,   setSendingId]   = useState(null);
    const [showModal,   setShowModal]   = useState(null);
    const [sentIds,     setSentIds]     = useState(new Set());
    const [successId,   setSuccessId]   = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [reqRes, walletRes] = await Promise.all([
                    getMyReceiverRequests({ status: 'Fulfilled' }),
                    getReceiverWallet(),
                ]);

                if (reqRes?.success) {
                    const fulfilled = (reqRes.data || []).filter(r =>
                        (r.status === 'Completed' || r.status === 'resolved') && r.fulfilledBy
                    );
                    setRequests(fulfilled);
                }

                if (walletRes?.success && walletRes.data.gratitudes) {
                    const alreadySent = new Set(
                        walletRes.data.gratitudes.map(g => g.request).filter(Boolean)
                    );
                    setSentIds(alreadySent);
                }
            } catch (err) { console.error("Error:", err); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleSend = async (req, message, rating) => {
        if (!req.fulfilledBy?._id) return;
        setSendingId(req._id);
        try {
            const res = await sendGratitudeTodonor({
                requestId: req._id,
                donorId:   req.fulfilledBy._id,
                message,
                rating,
            });
            if (res?.success) {
                setSentIds(prev => new Set([...prev, req._id]));
                setShowModal(null);
                // Celebrate animation
                setSuccessId(req._id);
                setTimeout(() => setSuccessId(null), 3000);
            }
        } catch (err) {
            const msg = err?.message || '';
            if (msg.includes('already sent')) setSentIds(prev => new Set([...prev, req._id]));
            console.error("Gratitude error:", err);
        } finally { setSendingId(null); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">Loading your donors...</p>
        </div>
    );

    const thankedCount  = sentIds.size;
    const uniqueDonors  = [...new Set(requests.map(r => r.fulfilledBy?._id).filter(Boolean))].length;
    const pendingThanks = requests.filter(r => !sentIds.has(r._id)).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-rose-600 to-red-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-red-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-red-900/20 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                        <Heart size={30} fill="white" className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Gratitude Board 💚</h2>
                        <p className="text-red-200 text-sm font-medium mt-0.5">Thank the heroes who donated blood and saved lives.</p>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-red-600">{requests.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Donations Received</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-rose-600">{thankedCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Thank-Yous Sent</p>
                </div>
                <div className={`p-4 rounded-2xl border shadow-sm text-center ${pendingThanks > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                    <p className={`text-2xl font-black ${pendingThanks > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{pendingThanks}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending Thanks</p>
                </div>
            </div>

            {/* Success toast */}
            {successId && (
                <div className="bg-emerald-600 text-white rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300 shadow-lg shadow-emerald-200">
                    <CheckCircle size={20} />
                    <span className="font-bold">Gratitude sent successfully! 💚 The donor will love your message.</span>
                </div>
            )}

            {/* Pending Thanks Banner */}
            {pendingThanks > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                    <Sparkles size={18} className="text-amber-600 shrink-0" />
                    <p className="text-sm font-bold text-amber-800">
                        You have <span className="text-amber-600">{pendingThanks}</span> donor{pendingThanks > 1 ? 's' : ''} waiting to be thanked!
                    </p>
                </div>
            )}

            {/* Donor Cards */}
            {requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Gift className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                    <p className="text-xl font-black text-slate-300">No fulfilled requests yet</p>
                    <p className="text-sm text-slate-400 mt-1">Once donors fulfill your requests, you can thank them here.</p>
                </div>
            ) : (
                <>
                    {/* Pending thanks first */}
                    {requests.filter(r => !sentIds.has(r._id)).length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Sparkles size={12} /> Thank These Donors
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {requests.filter(r => !sentIds.has(r._id)).map(req => (
                                    <DonorCard key={req._id} req={req} alreadySent={false}
                                        onThank={() => setShowModal(req)} onStartChat={onStartChat} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Already thanked */}
                    {requests.filter(r => sentIds.has(r._id)).length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <CheckCircle size={12} /> Already Thanked
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {requests.filter(r => sentIds.has(r._id)).map(req => (
                                    <DonorCard key={req._id} req={req} alreadySent={true}
                                        onThank={() => {}} onStartChat={onStartChat} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Gratitude Modal */}
            {showModal && (
                <GratitudeModal
                    req={showModal}
                    onClose={() => setShowModal(null)}
                    onSend={handleSend}
                    sending={sendingId === showModal._id}
                />
            )}
        </div>
    );
};

export default GratitudeBoard;
