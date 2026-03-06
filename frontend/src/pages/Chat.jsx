import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Send, Phone, Video, MoreVertical, ArrowLeft,
    Droplets, Check, CheckCheck, Search, Filter,
    User, X, PhoneOutgoing, VideoOff, Mic, Settings,
    Trash2, Shield, UserX, Info, PhoneIncoming, Bell
} from "lucide-react";
import {
    getConversations, getMessages, sendMessage, getUser,
    clearChatHistory, initiateCall
} from "../services/api";
import { subscribeToUserChannel, unsubscribeFromUserChannel } from "../services/pusher";
import { useToast } from "../components/ui/Toast";

// ── Call Modal Component ──
const CallModal = ({ isOpen, type, targetUser, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white/10 w-full max-w-sm rounded-[3rem] p-8 text-center border border-white/20 shadow-2xl">
                <div className="relative mb-8 mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-red-500 shadow-xl">
                        {targetUser?.profilePicture ? (
                            <img src={targetUser.profilePicture} alt={targetUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl font-black text-white">
                                {targetUser?.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{targetUser?.name}</h3>
                <p className="text-red-400 font-bold uppercase tracking-widest text-xs mb-10">
                    Calling via {type === 'video' ? 'Video' : 'Voice'}...
                </p>
                <div className="flex items-center justify-center gap-6">
                    <button className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                        <Mic size={24} />
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 hover:rotate-90 transition-all shadow-lg shadow-red-900/40"
                    >
                        <X size={28} />
                    </button>
                    <button className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                        <VideoOff size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Incoming Call Alert ──
const IncomingCallAlert = ({ caller, type, onAccept, onDecline }) => {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900 text-white p-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-red-500 shrink-0">
                    {caller?.profilePicture ? (
                        <img src={caller.profilePicture} alt={caller.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-red-600 flex items-center justify-center font-black">
                            {caller?.name?.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest">Incoming {type} Call</p>
                    <h4 className="font-bold text-sm">{caller?.name}</h4>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onDecline}
                        className="w-10 h-10 bg-white/10 hover:bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={onAccept}
                        className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-all animate-pulse"
                    >
                        <Phone size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Chat Settings Drawer ──
const SettingsDrawer = ({ isOpen, onClose, settings, setSettings, onClearAll }) => {
    if (!isOpen) return null;

    const SettingToggle = ({ icon: Icon, label, description, active, onToggle }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 shadow-sm mb-3">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${active ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-sm font-black text-slate-900 leading-none mb-1">{label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-slate-50 h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chat Settings</h2>
                        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mt-1 italic">Security Preferences</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Communication</h3>
                        <SettingToggle
                            icon={Bell}
                            label="Notifications"
                            description="Sound and banner alerts"
                            active={settings.notifications}
                            onToggle={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                        />
                        <SettingToggle
                            icon={CheckCheck}
                            label="Read Receipts"
                            description="Show message delivery status"
                            active={settings.readReceipts}
                            onToggle={() => setSettings(s => ({ ...s, readReceipts: !s.readReceipts }))}
                        />
                        <SettingToggle
                            icon={User}
                            label="Active Status"
                            description="Show when you're online"
                            active={settings.activeStatus}
                            onToggle={() => setSettings(s => ({ ...s, activeStatus: !s.activeStatus }))}
                        />
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Privacy & Security</h3>
                        <SettingToggle
                            icon={Shield}
                            label="Privacy Mode"
                            description="Hide previews in sidebar"
                            active={settings.privacyMode}
                            onToggle={() => setSettings(s => ({ ...s, privacyMode: !s.privacyMode }))}
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Dangerous Area</h3>
                        <button
                            onClick={onClearAll}
                            className="w-full flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-3xl group hover:bg-red-600 transition-all"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <Trash2 size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-red-600 group-hover:text-white leading-none mb-1">Clear Communication History</p>
                                <p className="text-[10px] text-red-400 group-hover:text-red-100 font-bold uppercase tracking-tight">This cannot be undone</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-3 grayscale opacity-30 text-center justify-center">
                        <Droplets size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">BloodConnect Communication v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Chat({ preselectedUser }) {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [conversations, setConversations] = useState([]);
    const [currentChatUser, setCurrentChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [showChatSettings, setShowChatSettings] = useState(false);

    // Chat Settings States
    const [settings, setSettings] = useState({
        notifications: true,
        readReceipts: true,
        activeStatus: true,
        privacyMode: false
    });

    // Call States
    const [outgoingCall, setOutgoingCall] = useState({ active: false, type: 'voice' });
    const [incomingCall, setIncomingCall] = useState(null);

    const bottomRef = useRef(null);
    const currentUser = getUser();

    useEffect(() => {
        if (preselectedUser) {
            setCurrentChatUser(preselectedUser);
            setConversations(prev => {
                const exists = prev.find(c => c.user._id === preselectedUser._id);
                if (!exists) return [{ user: preselectedUser, lastMessage: null }, ...prev];
                return prev;
            });
        }
    }, [preselectedUser]);

    useEffect(() => {
        const fetchConvos = async () => {
            try {
                const res = await getConversations();
                let fetchedConvos = res.conversations || [];
                if (preselectedUser && !fetchedConvos.find(c => c.user._id === preselectedUser._id)) {
                    fetchedConvos = [{ user: preselectedUser, lastMessage: null }, ...fetchedConvos];
                }
                setConversations(fetchedConvos);
            } catch (err) {
                console.error("Failed to load conversations", err);
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConvos();
    }, [preselectedUser]);

    useEffect(() => {
        if (!currentUser) return;
        let channel = null;

        const handlePusherEvent = (eventName, data) => {
            if (eventName === "new-message") {
                if (currentChatUser && (data.senderId === currentChatUser._id || data.receiverId === currentChatUser._id)) {
                    setMessages(prev => [...prev, data]);
                }
                setConversations(prev => {
                    const otherUserId = data.senderId === currentUser._id ? data.receiverId : data.senderId;
                    const existingIndex = prev.findIndex(c => c.user._id === otherUserId);
                    if (existingIndex > -1) {
                        const newConvos = [...prev];
                        newConvos[existingIndex].lastMessage = data;
                        return newConvos.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
                    } else {
                        getConversations().then(res => setConversations(res.conversations || []));
                        return prev;
                    }
                });
            } else if (eventName === "incoming-call") {
                setIncomingCall(data);
                // Play sound or vibration here
                const audio = new Audio('https://assets.mixkit.net/sfx/preview/mixkit-waiting-ringtone-1354.mp3');
                audio.play().catch(() => { });
            }
        };

        channel = subscribeToUserChannel(currentUser._id, handlePusherEvent);
        return () => { if (channel) unsubscribeFromUserChannel(channel, currentUser._id); };
    }, [currentUser, currentChatUser]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!currentChatUser) return;
            try {
                const res = await getMessages(currentChatUser._id);
                setMessages(res.messages || []);
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            } catch (err) { console.error(err); }
        };
        fetchChatHistory();
        setShowOptions(false);
    }, [currentChatUser]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !currentChatUser) return;

        const tempId = Date.now().toString();
        const newMessage = {
            _id: tempId,
            senderId: currentUser._id,
            receiverId: currentChatUser._id,
            text: input.trim(),
            createdAt: new Date().toISOString(),
            isSending: true
        };

        setMessages(prev => [...prev, newMessage]);
        const currentInput = input;
        setInput("");

        try {
            const res = await sendMessage(currentChatUser._id, currentInput.trim());
            setMessages(prev => prev.map(m => m._id === tempId ? res.message : m));
            setConversations(prev => {
                const newConvos = [...prev];
                const existingIndex = prev.findIndex(c => c.user._id === currentChatUser._id);
                if (existingIndex > -1) {
                    newConvos[existingIndex].lastMessage = res.message;
                    return newConvos.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
                }
                return prev;
            });
        } catch (err) {
            setMessages(prev => prev.filter(m => m._id !== tempId));
            addToast("Failed to send message.", "error");
        }
    };

    const handleCall = async (type) => {
        if (!currentChatUser) return;
        setOutgoingCall({ active: true, type });
        try {
            await initiateCall(currentChatUser._id, type);
        } catch (err) {
            setOutgoingCall({ active: false, type: 'voice' });
            addToast("Call failed. User might be offline.", "error");
        }
    };

    const handleClearChat = async () => {
        if (!currentChatUser || !window.confirm("Clean entire chat history with " + currentChatUser.name + "?")) return;
        try {
            await clearChatHistory(currentChatUser._id);
            setMessages([]);
            setShowOptions(false);
            addToast("Chat history cleared.", "success");
        } catch (err) { addToast("Failed to clear chat.", "error"); }
    };

    const formatTime = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">

            {/* ── Call Components ── */}
            <CallModal
                isOpen={outgoingCall.active}
                type={outgoingCall.type}
                targetUser={currentChatUser}
                onCancel={() => setOutgoingCall({ active: false, type: 'voice' })}
            />
            <SettingsDrawer
                isOpen={showChatSettings}
                onClose={() => setShowChatSettings(false)}
                settings={settings}
                setSettings={setSettings}
                onClearAll={() => {
                    if (window.confirm("CRITICAL: This will clear history with everyone. Are you sure?")) {
                        window.alert("Backend integration for global clear coming soon.");
                        setShowChatSettings(false);
                    }
                }}
            />
            {incomingCall && (
                <IncomingCallAlert
                    caller={incomingCall.caller}
                    type={incomingCall.type}
                    onDecline={() => setIncomingCall(null)}
                    onAccept={() => {
                        window.alert("Connecting to encrypted room...");
                        setIncomingCall(null);
                    }}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`w-full lg:w-[380px] bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${currentChatUser ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors lg:hidden">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chats</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowChatSettings(true)}
                                className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                    {/* Search chats */}
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find conversations..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {loadingConversations ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 grayscale opacity-30">
                            <Droplets size={40} className="animate-bounce" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Syncing Encrypted Chats...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-20 px-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Info size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No active conversations found.</p>
                            <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2 font-black">All chats are end-to-end encrypted</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.user._id}
                                onClick={() => setCurrentChatUser(conv.user)}
                                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all relative group ${currentChatUser?._id === conv.user._id ? 'bg-red-50 shadow-sm' : 'hover:bg-slate-50'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                        {conv.user.profilePicture ? (
                                            <img src={conv.user.profilePicture} alt={conv.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-lg">
                                                {conv.user.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-black text-slate-900 truncate pr-2">{conv.user.name}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatTime(conv.lastMessage?.createdAt)}</span>
                                    </div>
                                    <p className={`text-xs truncate ${currentChatUser?._id === conv.user._id ? 'text-red-700 font-bold' : 'text-slate-400 font-medium'}`}>
                                        {conv.lastMessage?.senderId === currentUser?._id ? "You: " : ""}{conv.lastMessage?.text || "New conversation started"}
                                    </p>
                                </div>
                                {currentChatUser?._id === conv.user._id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* ── Chat Canvas ── */}
            <main className={`flex-1 flex flex-col bg-white overflow-hidden ${!currentChatUser ? 'hidden lg:flex' : 'flex'}`}>
                {currentChatUser ? (
                    <>
                        {/* Chat Header */}
                        <header className="p-4 lg:p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setCurrentChatUser(null)} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                                        {currentChatUser.profilePicture ? (
                                            <img src={currentChatUser.profilePicture} alt={currentChatUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black">
                                                {currentChatUser.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 tracking-tight">{currentChatUser.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Now
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCall('video')}
                                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                                >
                                    <Video size={20} />
                                </button>
                                <button
                                    onClick={() => handleCall('audio')}
                                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                                >
                                    <Phone size={20} />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowOptions(!showOptions)}
                                        className={`p-3 rounded-2xl transition-all ${showOptions ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {showOptions && (
                                        <div className="absolute right-0 mt-3 w-56 bg-slate-900 text-white rounded-[2rem] shadow-2xl overflow-hidden py-3 border border-white/5 animate-in slide-in-from-top-2 duration-300">
                                            <button
                                                onClick={() => navigate(`/profile/${currentChatUser._id}`)}
                                                className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3"
                                            >
                                                <User size={16} /> View Profile
                                            </button>
                                            <button className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-white/5 flex items-center gap-3">
                                                <Shield size={16} /> Privacy Settings
                                            </button>
                                            <div className="h-px bg-white/5 my-2 mx-5" />
                                            <button
                                                onClick={handleClearChat}
                                                className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-red-600/20 text-red-400 flex items-center gap-3"
                                            >
                                                <Trash2 size={16} /> Clear Conversation
                                            </button>
                                            <button className="w-full px-5 py-3 text-left text-xs font-bold hover:bg-red-600/20 text-red-400 flex items-center gap-3 border-b-0">
                                                <UserX size={16} /> Block Contact
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>

                        {/* Message Feed */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth bg-slate-50/30">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full grayscale opacity-20 text-center gap-4">
                                    <div className="w-20 h-20 bg-slate-200 rounded-[2.5rem] flex items-center justify-center">
                                        <MessageSquare size={32} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">Secure Peer-to-Peer Tunnel Established</p>
                                        <p className="text-xs uppercase tracking-widest font-black mt-1">Start chatting with {currentChatUser.name}</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser?._id;
                                    const nextIsMe = messages[idx + 1]?.senderId === currentUser?._id;
                                    return (
                                        <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] lg:max-w-[70%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                                            <div className={`p-4 rounded-[2rem] text-sm shadow-sm transition-all duration-300 ${isMe
                                                ? 'bg-red-600 text-white rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                } ${msg.isSending ? 'opacity-70 scale-95' : 'scale-100'}`}>
                                                <p className="font-medium leading-relaxed">{msg.text}</p>
                                            </div>
                                            {!nextIsMe && (
                                                <div className={`flex items-center gap-2 mt-2 px-2 transition-all duration-500`}>
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{formatTime(msg.createdAt)}</span>
                                                    {isMe && !msg.isSending && (
                                                        <div className="flex text-emerald-500">
                                                            <CheckCheck size={12} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Area */}
                        <footer className="p-6 bg-white border-t border-slate-50 sticky bottom-0 z-30">
                            <form onSubmit={handleSend} className="flex items-center gap-4 relative group">
                                <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-[2.5rem] px-6 py-1 group-focus-within:border-red-200 group-focus-within:ring-4 group-focus-within:ring-red-500/5 transition-all">
                                    <button type="button" className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <Droplets size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Secure message..."
                                        className="flex-1 bg-transparent py-4 text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="p-2 text-slate-400 hover:text-red-500 hidden sm:block">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${input.trim()
                                        ? 'bg-red-600 text-white hover:scale-110 shadow-red-200 rotate-0'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed rotate-45'
                                        }`}
                                >
                                    <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                                </button>
                            </form>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mt-4">
                                <Shield size={8} className="inline-block mr-1 -mt-0.5" /> Security Shield: Active • End-to-End Encrypted
                            </p>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 relative overflow-hidden">
                        {/* Decorative BG */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center text-center px-10">
                            <div className="w-24 h-24 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-8 animate-in zoom-in duration-700">
                                <Droplets size={40} className="text-red-600 animate-pulse" fill="currentColor" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Secure Donor Network</h3>
                            <p className="text-sm font-bold text-slate-400 max-w-sm leading-relaxed mb-8">
                                Connect safely with verified donors. Every message and call is protected by national-level security protocols.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 opacity-50">
                                <div className="px-4 py-2 bg-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    <Shield size={12} /> Encrypted
                                </div>
                                <div className="px-4 py-2 bg-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    <Video size={12} /> HD Proxy
                                </div>
                                <div className="px-4 py-2 bg-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    <CheckCheck size={12} /> Verified
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Helper icons
const MessageSquare = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
