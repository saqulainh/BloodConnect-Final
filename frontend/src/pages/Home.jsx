import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Droplets, Heart } from "lucide-react";
import gsap from "gsap";

export default function Home() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".hero-drop",
                { scale: 0.8, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 1, ease: "elastic.out(1, 0.5)", delay: 0.2 }
            );
            gsap.fromTo(".stats-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.8 }
            );
            gsap.fromTo(".cta-btn",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 1.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

            {/* ── RED BACKGROUND SHAPE ── */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "65vh", background: "#e53935", borderRadius: "0 0 50% 50% / 0 0 40px 40px", zIndex: 0 }} />

            {/* ── HEADER ── */}
            <div style={{ position: "relative", zIndex: 1, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <ChevronRight size={24} style={{ transform: "rotate(180deg)" }} />
                </button>
            </div>

            {/* ── HERO DROP IMAGE ── */}
            <div className="hero-drop" style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center", marginTop: 20 }}>
                <div style={{ width: 320, height: 380, background: "#fff", borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", overflow: "hidden", border: "8px solid rgba(255,255,255,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative" }}>
                    <img src="https://images.unsplash.com/photo-1615461066841-6116e61058f5?auto=format&fit=crop&q=80&w=600" alt="donate" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(229,57,53,0.4))" }} />
                </div>
                {/* Pagination Dots */}
                <div style={{ position: "absolute", bottom: -30, display: "flex", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
                    <div style={{ width: 24, height: 8, borderRadius: 4, background: "#fff" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
                </div>
            </div>

            {/* ── CONTENT CARD ── */}
            <div style={{ flex: 1, marginTop: 60, padding: "0 24px 40px", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", zIndex: 1 }}>

                {/* Stats Row */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 32 }}>
                    {[
                        { label: "Blood Type", val: "A+", icon: null },
                        { label: "Donate", val: "4", icon: null },
                        { label: "Request", val: "3", icon: null }
                    ].map((s, i) => (
                        <div key={i} className="stats-card" style={{ flex: 1, background: "#fff", padding: "16px 10px", borderRadius: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#333" }}>{s.val}</p>
                            <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600 }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Headline */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#333", margin: "0 0 12px" }}>One Drop Can Save a Life</h2>
                    <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                        Easily save lives with a tap. Find drives, connect instantly, and donate fast.
                    </p>
                </div>

                {/* CTA Slider Button */}
                <button className="cta-btn" onClick={() => navigate("/register")}
                    style={{ width: "100%", height: 64, background: "#e53935", borderRadius: 32, border: "none", color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 24px", boxShadow: "0 8px 24px rgba(229,57,53,0.3)", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                    <span style={{ zIndex: 2 }}>
                        <Droplets size={18} style={{ marginRight: 8, display: "inline-block", verticalAlign: "middle" }} />
                        Donate Now
                    </span>
                    <div style={{ width: 48, height: 48, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, color: "#e53935" }}>
                        <ChevronRight size={24} />
                    </div>
                </button>

            </div>
        </div>
    );
}
