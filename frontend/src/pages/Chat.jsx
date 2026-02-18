import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Phone, Video, MoreHorizontal, ArrowLeft, Droplets } from "lucide-react";

const INITIAL_MESSAGES = [
    { id: 1, from: "other", text: "Hello! Thank you for registering as a blood donor. We currently need A- blood urgently. Are you available now?", time: "10:25 am" },
    { id: 2, from: "me", text: "Hi! Yes, I'm A- and available right now. Where should I come for the blood donation process to begin?", time: "10:30 am" },
    { id: 3, from: "other", text: "Thank you, Sara. Please visit our Blood Bank at City Hospital Main Building 2nd Floor. Can you come today?", time: "10:25 am" },
];

export default function Chat() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages((prev) => [...prev, {
            id: Date.now(), from: "me", text: input.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        setInput("");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f5f5f5", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* ── HEADER ── */}
            <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", padding: 4 }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ width: 40, height: 40, background: "#fce4ec", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#c2185b", flexShrink: 0 }}>
                    MJ
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, color: "#111", margin: 0 }}>Mr. Jukarbark</p>
                    <p style={{ fontSize: 12, color: "#4caf50", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, background: "#4caf50", borderRadius: "50%", display: "inline-block" }} /> Online
                    </p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {[Video, Phone, MoreHorizontal].map((Icon, i) => (
                        <button key={i} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#e53935"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#888"; }}>
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── DATE DIVIDER ── */}
            <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                <span style={{ fontSize: 12, color: "#bbb", fontWeight: 600, background: "#f5f5f5", padding: "3px 12px", borderRadius: 20 }}>Today, May 10</span>
            </div>

            {/* ── MESSAGES ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "me" ? "flex-end" : "flex-start", gap: 4 }}>
                        {msg.from === "other" && (
                            <div style={{ width: 28, height: 28, background: "#fce4ec", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#c2185b" }}>MJ</div>
                        )}
                        <div style={{
                            maxWidth: "72%", padding: "12px 16px", borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            background: msg.from === "me" ? "#e53935" : "#fff",
                            color: msg.from === "me" ? "#fff" : "#111",
                            fontSize: 14, lineHeight: 1.5, fontWeight: 500,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}>
                            {msg.text}
                        </div>
                        <span style={{ fontSize: 11, color: "#bbb" }}>{msg.time}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* ── INPUT ── */}
            <form onSubmit={sendMessage} style={{ background: "#fff", borderTop: "1px solid #f0f0f0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 24, padding: "0 16px", gap: 8 }}>
                    <Droplets size={14} color="#e53935" />
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                        placeholder="Type Here..."
                        style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, padding: "11px 0", fontFamily: "inherit", color: "#111" }} />
                </div>
                <button type="submit"
                    style={{ width: 44, height: 44, background: "#e53935", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(229,57,53,0.35)", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#b71c1c")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#e53935")}>
                    <Send size={16} color="#fff" />
                </button>
            </form>
        </div>
    );
}
