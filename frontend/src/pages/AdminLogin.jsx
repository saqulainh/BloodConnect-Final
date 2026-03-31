import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, Key, AlertTriangle, Droplets, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { adminLogin as adminLoginAPI } from "../services/api";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminKey, setAdminKey] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !adminKey) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await adminLoginAPI({ email, password, adminKey });
            if (res?.success) {
                setUser(res.data);
                navigate("/dashboard");
            }
        } catch (err) {
            setAttempts((a) => a + 1);
            const msg = err.response?.data?.message || "Authentication failed.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background grid & glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />

            <div className="relative w-full max-w-md">
                {/* Back link */}
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-bold mb-6 transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to Login
                </button>

                {/* Card */}
                <div className="bg-[#111118] border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/40">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 mb-4">
                            <Shield size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Admin Access</h1>
                        <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">
                            Blood<span className="text-amber-500">Connect</span> Control Center
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mb-6">
                        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                        <p className="text-[10px] text-amber-400/80 font-bold">
                            Authorized personnel only. All access attempts are logged.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                            <p className="text-xs text-red-400 font-bold">{error}</p>
                            {attempts >= 3 && (
                                <p className="text-[10px] text-red-500/70 mt-1">
                                    ⚠️ Multiple failed attempts detected. Account may be locked.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@bloodconnect.in"
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#0d0d12] border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-700 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    className="w-full pl-11 pr-11 py-3.5 bg-[#0d0d12] border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-700 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Admin Secret Key */}
                        <div>
                            <label className="block text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-2">
                                🔑 Admin Secret Key
                            </label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600/50" />
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                    placeholder="Enter admin access key"
                                    className="w-full pl-11 pr-11 py-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-sm text-amber-200 placeholder:text-amber-800/50 font-bold focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-500 transition-colors"
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield size={16} />
                                    Access Control Panel
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-800/50 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600">
                            <Droplets size={12} />
                            <span className="text-[10px] font-bold">
                                BloodConnect Admin Portal v2.0
                            </span>
                        </div>
                        <p className="text-[9px] text-slate-700 mt-1">
                            Rate limited • 5 attempts per 15 min • All actions audited
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
