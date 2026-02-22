import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Phone, Video, MoreHorizontal, ArrowLeft, Droplets, Check, CheckCheck } from "lucide-react";
import { getConversations, getMessages, sendMessage, getUser } from "../services/api";
import { subscribeToUserChannel, unsubscribeFromUserChannel } from "../services/pusher";

// Optional: A helper to format dates nicely
const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Chat({ preselectedUser }) {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [currentChatUser, setCurrentChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);

    const bottomRef = useRef(null);
    const currentUser = getUser(); // Ensure we have the current user

    // ── Pre-Select User if passed ──
    useEffect(() => {
        if (preselectedUser) {
            setCurrentChatUser(preselectedUser);
            setConversations(prev => {
                const exists = prev.find(c => c.user._id === preselectedUser._id);
                if (!exists) {
                    return [{ user: preselectedUser, lastMessage: null }, ...prev];
                }
                return prev;
            });
        }
    }, [preselectedUser]);

    // ── Fetch Conversations on Mount ──
    useEffect(() => {
        const fetchConvos = async () => {
            try {
                const res = await getConversations();
                let fetchedConvos = res.conversations || [];

                // Merge preselected if missing
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

    // ── Subscription to Pusher ──
    useEffect(() => {
        if (!currentUser) return;

        let channel = null;

        const handlePusherEvent = (eventName, data) => {
            if (eventName === "new-message") {
                // If it's a message for the currently opened chat
                if (currentChatUser && (data.senderId === currentChatUser._id || data.receiverId === currentChatUser._id)) {
                    setMessages(prev => [...prev, data]);
                }

                // Update conversation list
                setConversations(prev => {
                    const otherUserId = data.senderId === currentUser._id ? data.receiverId : data.senderId;
                    const existingIndex = prev.findIndex(c => c.user._id === otherUserId);

                    if (existingIndex > -1) {
                        const newConvos = [...prev];
                        newConvos[existingIndex].lastMessage = data;
                        return newConvos.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
                    } else {
                        // If it's a brand new conversation, we need to fetch the user details to add to the list
                        // This is a naive refresh for now, you can optimize this
                        getConversations().then(res => setConversations(res.conversations || []));
                        return prev;
                    }
                });
            }
        };

        channel = subscribeToUserChannel(currentUser._id, handlePusherEvent);

        return () => {
            if (channel) unsubscribeFromUserChannel(channel, currentUser._id);
        };
    }, [currentUser, currentChatUser]);

    // ── Fetch Messages when Chat Selected ──
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!currentChatUser) return;
            try {
                const res = await getMessages(currentChatUser._id);
                setMessages(res.messages || []);
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        fetchChatHistory();
    }, [currentChatUser]);

    // Scroll to bottom when messages update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Handle Sending Message ──
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
        setInput("");

        try {
            const res = await sendMessage(currentChatUser._id, newMessage.text);
            // Replace temporary message with actual saved one
            setMessages(prev => prev.map(m => m._id === tempId ? res.message : m));

            // Update conversation list with my new message
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
            console.error("Failed to send", err);
            // Revert message on failure
            setMessages(prev => prev.filter(m => m._id !== tempId));
            alert("Failed to send message.");
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#f5f5f5", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* ── SIDEBAR (Conversations) ── */}
            <div style={{ width: 320, background: "#fff", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "#555" }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Messages</h2>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loadingConversations ? (
                        <p style={{ padding: 16, color: "#888", textAlign: "center" }}>Loading...</p>
                    ) : conversations.length === 0 ? (
                        <p style={{ padding: 16, color: "#888", textAlign: "center", fontSize: 14 }}>No conversations yet.</p>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.user._id}
                                onClick={() => setCurrentChatUser(conv.user)}
                                style={{
                                    padding: "16px",
                                    display: "flex",
                                    gap: 12,
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f9f9f9",
                                    background: currentChatUser?._id === conv.user._id ? "#fff5f5" : "#fff",
                                    transition: "background 0.2s"
                                }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: "#fce4ec", color: "#c2185b",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, flexShrink: 0,
                                    backgroundImage: conv.user.profilePicture ? `url(${conv.user.profilePicture})` : "none",
                                    backgroundSize: "cover", backgroundPosition: "center"
                                }}>
                                    {!conv.user.profilePicture && (conv.user.name?.substring(0, 2).toUpperCase() || "U")}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {conv.user.name}
                                        </h4>
                                        <span style={{ fontSize: 11, color: "#999", flexShrink: 0 }}>
                                            {formatTime(conv.lastMessage?.createdAt)}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {conv.lastMessage?.senderId === currentUser?._id ? "You: " : ""}{conv.lastMessage?.text || "Started conversation"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── MAIN CHAT AREA ── */}
            {currentChatUser ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: "50%", background: "#fce4ec", color: "#c2185b",
                            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                            backgroundImage: currentChatUser.profilePicture ? `url(${currentChatUser.profilePicture})` : "none",
                            backgroundSize: "cover", backgroundPosition: "center"
                        }}>
                            {!currentChatUser.profilePicture && (currentChatUser.name?.substring(0, 2).toUpperCase() || "U")}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: 16, color: "#111", margin: 0 }}>{currentChatUser.name}</p>
                            <p style={{ fontSize: 12, color: "#4caf50", fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 6, height: 6, background: "#4caf50", borderRadius: "50%", display: "inline-block" }} /> Online
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[Video, Phone, MoreHorizontal].map((Icon, i) => (
                                <button key={i} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", transition: "all 0.15s" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#e53935"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#666"; }}>
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages List */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                        {messages.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>
                                Send a message to start chatting with {currentChatUser.name}
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?._id;
                                return (
                                    <div key={msg._id || idx} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 4 }}>
                                        <div style={{
                                            maxWidth: "70%", padding: "12px 16px",
                                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                            background: isMe ? "#e53935" : "#fff",
                                            color: isMe ? "#fff" : "#222",
                                            fontSize: 14, lineHeight: 1.5,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                            opacity: msg.isSending ? 0.7 : 1
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#999" }}>
                                            <span>{formatTime(msg.createdAt)}</span>
                                            {isMe && !msg.isSending && <CheckCheck size={14} color="#4caf50" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ background: "#fff", borderTop: "1px solid #f0f0f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 24, padding: "0 16px", gap: 10 }}>
                            <Droplets size={16} color="#e53935" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 15, padding: "12px 0", fontFamily: "inherit", color: "#111" }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            style={{
                                width: 48, height: 48, background: input.trim() ? "#e53935" : "#f0f0f0",
                                border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: input.trim() ? "pointer" : "default", flexShrink: 0,
                                transition: "all 0.2s"
                            }}
                        >
                            <Send size={18} color={input.trim() ? "#fff" : "#aaa"} />
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#aaa", background: "#f9f9f9" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <Droplets size={32} color="#e53935" />
                    </div>
                    <h3 style={{ fontSize: 20, color: "#555", margin: "0 0 8px 0" }}>BloodConnect Chat</h3>
                    <p style={{ margin: 0, fontSize: 14 }}>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    );
}
