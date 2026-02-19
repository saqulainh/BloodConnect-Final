import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Users, Activity, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-black text-xl tracking-tight">Blood<span className="text-red-600">Connect</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
                        <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-red-600 transition-colors">How it Works</a>
                        <a href="#impact" className="hover:text-red-600 transition-colors">Impact</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-red-600">Sign In</Link>
                        <Link to="/register" className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                            Donate Now
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ───────────────────────────────────────────── */}
            <header className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Urgent: O- Blood needed in Mumbai
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight text-slate-900">
                            Save a Life,<br />
                            <span className="text-red-600">Be a Hero.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
                            Connect directly with donors and patients. No middlemen. Just a community saving lives together.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-2">
                                <Heart className="fill-white" size={20} />
                                I Want to Donate
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <Search size={20} />
                                Find Blood
                            </Link>
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 z-${10 - i}`}>
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-500">
                                <span className="text-red-600">12,000+</span> Donors Registered
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50"></div>
                        <div className="relative grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-8">
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform">
                                    <Activity className="text-red-600 mb-4" size={32} />
                                    <h3 className="font-bold text-lg">Real-time</h3>
                                    <p className="text-slate-500 text-sm">Live updates on blood requests and nearby donors.</p>
                                </div>
                                <div className="bg-red-600 p-6 rounded-2xl shadow-xl shadow-red-200 transform hover:-translate-y-1 transition-transform text-white">
                                    <Heart className="mb-4 fill-white" size={32} />
                                    <h3 className="font-bold text-lg">Lifesaver</h3>
                                    <p className="text-red-100 text-sm">Your one donation can save up to three lives.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform">
                                    <ShieldCheck className="text-blue-600 mb-4" size={32} />
                                    <h3 className="font-bold text-lg">Verified</h3>
                                    <p className="text-slate-500 text-sm">100% verified donors and secure data protection.</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl transform hover:-translate-y-1 transition-transform text-white">
                                    <Clock className="mb-4 text-emerald-400" size={32} />
                                    <h3 className="font-bold text-lg">Fast</h3>
                                    <p className="text-slate-400 text-sm">Find donors in your area within minutes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-black text-xl text-white tracking-tight">Blood<span className="text-red-600">Connect</span></span>
                    </div>
                    <div className="flex gap-8 text-sm font-bold">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <p className="text-xs font-medium">© 2024 BloodConnect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
