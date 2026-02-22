import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, CheckCircle, Fingerprint } from "lucide-react";
import { verifyAadhaar, getUser } from "../services/api";

export default function AadhaarVerifyPage() {
    const navigate = useNavigate();
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const user = getUser();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (aadhaarNumber.length !== 12) {
            setError("Aadhaar number must be 12 digits.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await verifyAadhaar({ email: user.email, aadhaarNumber });
            setSuccess("Aadhaar verified successfully! Your profile now has the Verified Badge.");
            setTimeout(() => navigate("/profile"), 2000);
        } catch (err) {
            setError(err.message || "Verification failed. Please check the number and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)", padding: "20px", color: "#fff" }}>
                <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => navigate("/profile")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", padding: 8, color: "#fff", cursor: "pointer" }}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Aadhaar Verification</h1>
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <div style={{ maxWidth: 440, width: "100%", background: "#fff", borderRadius: 24, padding: 32, boxShadow: "0 10px 40px rgba(0,0,0,0.05)", textAlign: "center" }}>

                    <div style={{ width: 64, height: 64, background: "#fff5f5", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                        <Fingerprint size={32} color="#e53935" />
                    </div>

                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111", margin: "0 0 10px" }}>Identity Verification</h2>
                    <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
                        Verify your identity to earn the <span style={{ color: "#2e7d32", fontWeight: 700 }}>Aadhaar Verified</span> badge.
                        This increases trust and prioritizing you in urgent donation requests.
                    </p>

                    <form onSubmit={handleVerify} style={{ textAlign: "left" }}>
                        <label style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                            12-Digit Aadhaar Number
                        </label>
                        <input
                            type="text"
                            maxLength={12}
                            placeholder="0000 0000 0000"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                            style={{ width: "100%", padding: "14px 18px", borderRadius: 12, border: "2px solid #eee", fontSize: 18, fontWeight: 700, letterSpacing: "0.1em", outline: "none", marginBottom: 20, transition: "border-color 0.2s" }}
                            onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                            onBlur={(e) => (e.target.style.borderColor = "#eee")}
                        />

                        {error && (
                            <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", color: "#e53935", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ background: "#f0fff4", border: "1px solid #c8e6c9", color: "#2e7d32", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                                <CheckCircle size={16} /> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || aadhaarNumber.length !== 12}
                            style={{ width: "100%", padding: 16, background: (loading || aadhaarNumber.length !== 12) ? "#f5f5f5" : "linear-gradient(135deg, #e53935, #b71c1c)", color: (loading || aadhaarNumber.length !== 12) ? "#ccc" : "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}
                        >
                            {loading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <ShieldCheck size={20} />}
                            {loading ? "Verifying..." : "Verify & Get Badge"}
                        </button>
                    </form>

                    <p style={{ marginTop: 24, fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
                        🛡️ Your data is encrypted and used only for verification purposes.
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
