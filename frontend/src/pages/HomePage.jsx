import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Heart, Search, Users, Activity, ArrowRight,
    ShieldCheck, Clock, Droplets, Menu, X,
    MapPin, Bell, BarChart2, ChevronRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthContext";

gsap.registerPlugin(ScrollTrigger);

/* ─── Blood Type Badge ────────────────────────────────────────── */
const BloodBadge = ({ type, urgency }) => {
    const colors = {
        critical: "bg-red-600 text-white shadow-lg shadow-red-300",
        normal: "bg-white text-red-600 border-2 border-red-200",
    };
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black ${colors[urgency ?? "normal"]}`}>
            <Droplets size={14} className={urgency === "critical" ? "fill-white" : "fill-red-500"} />
            {type}
        </div>
    );
};

/* ─── Feature Card ───────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, gradient, iconColor }) => (
    <div className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
        <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconColor} bg-opacity-10`}>
                <Icon size={28} className={iconColor.replace("bg-", "text-")} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ value, label, color }) => (
    <div className="text-center space-y-2">
        <div className={`text-4xl lg:text-5xl font-black ${color}`}>{value}</div>
        <div className="text-slate-400 font-semibold text-sm uppercase tracking-widest">{label}</div>
    </div>
);

/* ─── Step Card ──────────────────────────────────────────────── */
const StepCard = ({ number, icon: Icon, title, desc }) => (
    <div className="flex flex-col items-center text-center gap-5">
        <div className="relative">
            <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200">
                <Icon size={36} />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-black">
                {number}
            </div>
        </div>
        <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">{desc}</p>
        </div>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
export default function HomePage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const stepsRef = useRef(null);
    const statsRef = useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);

    useEffect(() => {
        // Hero animation
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".hero-badge", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 })
                .fromTo(".hero-h1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
                .fromTo(".hero-p", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
                .fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, "-=0.4")
                .fromTo(".hero-stats", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
                .fromTo(".hero-card", { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12 }, "-=0.5");

            // Timeline progress line
            gsap.to(".timeline-progress", {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: "#workflow",
                    start: "top center",
                    end: "bottom center",
                    scrub: 0.5,
                },
            });

            // Timeline nodes highlight
            gsap.utils.toArray(".timeline-node").forEach((node) => {
                const dot = node.querySelector(".node-dot");
                const box = node.querySelector(".stat-box");

                ScrollTrigger.create({
                    trigger: node,
                    start: "top center+=150",
                    onEnter: () => {
                        gsap.to(dot, { backgroundColor: "#e53935", color: "#fff", borderColor: "#e53935", duration: 0.3 });
                        if (box) gsap.to(box, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)", delay: 0.1 });
                    },
                    onLeaveBack: () => {
                        gsap.to(dot, { backgroundColor: "#fff", color: "#94a3b8", borderColor: "#e2e8f0", duration: 0.3 });
                        if (box) gsap.to(box, { opacity: 0, y: 32, duration: 0.4 });
                    }
                });
            });

        });

        return () => ctx.revert();
    }, []);

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/dashboard");
        } else {
            navigate("/register");
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Google Font ─────────────────────────────────────────── */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* ── Navbar ──────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                            <Droplets size={20} className="text-white fill-white" />
                        </div>
                        <span className="font-black text-lg tracking-tight text-slate-900">
                            Blood<span className="text-red-600">Connect</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                        <a href="#workflow" className="hover:text-red-600 transition-colors">How it Works</a>
                        <Link to="/register" className="hover:text-red-600 transition-colors">Become a Donor</Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/dashboard"
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                                Go to Dashboard <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-red-600 transition-colors px-4 py-2">
                                    Sign In
                                </Link>
                                <Link to="/register"
                                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2">
                                    Get Started <ArrowRight size={14} />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Btn */}
                    <button onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-red-600 transition-colors">
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 py-6 space-y-4 shadow-xl">
                        <a href="#workflow" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-slate-600 hover:text-red-600 py-2">How it Works</a>
                        <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-slate-600 hover:text-red-600 py-2">Become a Donor</Link>
                        <div className="pt-2 flex flex-col gap-3">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="w-full py-3 bg-red-600 text-white font-bold rounded-xl text-center text-sm">Dashboard</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-center text-sm hover:bg-slate-50">Sign In</Link>
                                    <Link to="/register" className="w-full py-3 bg-red-600 text-white font-bold rounded-xl text-center text-sm hover:bg-red-700">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* ── Hero Section ────────────────────────────────────────── */}
            <header ref={heroRef} className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 px-4 overflow-hidden bg-[#fafafa]">
                {/* Background Blobs & Gradients */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-red-100/80 to-pink-50/40 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-50/60 to-slate-100/50 rounded-full blur-[80px] pointer-events-none" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        {/* Urgent Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-red-100 shadow-[0_4px_20px_rgba(229,57,53,0.1)] hover:shadow-[0_4px_25px_rgba(229,57,53,0.15)] transition-shadow">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                            </span>
                            <span className="text-red-700 text-sm font-bold tracking-wide">Live Request: O- Blood needed in Mumbai</span>
                        </div>

                        <h1 className="hero-h1 text-6xl lg:text-[80px] font-black tracking-tighter leading-[0.9] text-slate-900 drop-shadow-sm">
                            Save a Life,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Be a Hero.</span>
                        </h1>

                        <p className="hero-p text-lg lg:text-xl text-slate-600 font-medium max-w-lg leading-relaxed mix-blend-multiply">
                            Connect directly with verified blood donors in your area. Fast, secure, and completely free — because every second counts in an emergency.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleGetStarted}
                                className="hero-cta flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-base rounded-2xl hover:from-red-700 hover:to-red-600 transition-all shadow-[0_8px_30px_rgba(229,57,53,0.3)] hover:shadow-[0_8px_30px_rgba(229,57,53,0.4)] hover:-translate-y-1 group border border-red-400/50">
                                <Heart size={20} className="fill-white/80 group-hover:scale-110 group-hover:fill-white transition-all duration-300" />
                                {isAuthenticated ? "Go to Dashboard" : "Start Donating"}
                            </button>
                            <Link to="/login"
                                className="hero-cta flex items-center justify-center gap-3 px-8 py-4 bg-white/60 backdrop-blur-md text-slate-700 border border-slate-200/60 font-bold rounded-2xl hover:bg-white hover:border-red-200 hover:text-red-600 transition-all text-base shadow-sm hover:shadow-md">
                                <Search size={20} className="text-red-500" />
                                Find Blood Near Me
                            </Link>
                        </div>

                        {/* Donor Avatars + Count */}
                        <div className="hero-stats flex items-center gap-5 pt-4">
                            <div className="flex -space-x-3">
                                {["#e53935", "#ef5350", "#e57373", "#ffcdd2"].map((bg, i) => (
                                    <div key={i}
                                        className="w-12 h-12 rounded-full border-[3px] border-[#fafafa] flex items-center justify-center text-white text-sm font-black shadow-sm"
                                        style={{ backgroundColor: bg }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-600">
                                <span className="text-red-600 text-xl tracking-tight pr-1">12,482</span><br />
                                Active Donors Ready
                            </p>
                        </div>
                    </div>

                    {/* Right Visual ── Floating Cards */}
                    <div className="relative h-[550px] hidden lg:block perspective-1000">
                        {/* Center dynamic glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-red-200/40 to-red-400/40 rounded-full blur-3xl animate-pulse" />

                        {/* Request Card  (Glassmorphism) */}
                        <div className="hero-card absolute top-8 left-0 w-72 bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/50 z-20 hover:-translate-y-2 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center shadow-inner border border-red-50">
                                    <Bell size={22} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest leading-none mb-1">Live Request</p>
                                    <p className="text-base font-black text-slate-900 leading-none">Emergency Ward</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <BloodBadge type="A+" urgency="critical" />
                                <BloodBadge type="O+" />
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100">
                                <MapPin size={14} className="text-red-500" />
                                AIIMS Hospital, New Delhi
                            </div>
                        </div>

                        {/* Donor Found Card (Dark rich mode) */}
                        <div className="hero-card absolute bottom-12 left-12 w-64 bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-slate-700 z-30 hover:-translate-y-2 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(229,57,53,0.4)] border border-red-400/50">
                                    R
                                </div>
                                <div>
                                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Match Found
                                    </p>
                                    <p className="text-white font-black text-sm">Rahul K. • O+</p>
                                    <p className="text-slate-400 text-xs font-medium focus:outline-none">Verified Donor</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-3 flex items-center justify-center gap-2 text-white font-bold text-sm hover:bg-slate-700 transition-colors cursor-pointer group">
                                <Heart size={16} className="text-red-500 group-hover:fill-red-500 transition-all" /> Message Donor
                            </div>
                        </div>

                        {/* Enhanced Stats Card (Glassmorphism + Gradients) */}
                        <div className="hero-card absolute top-16 right-0 w-72 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/60 z-10 hover:-translate-y-2 transition-transform duration-500">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 border border-emerald-100 bg-emerald-50 rounded-xl relative">
                                        <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                        <BarChart2 size={18} className="text-emerald-500" />
                                    </div>
                                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Live Activity</p>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                                </div>
                            </div>

                            <div className="space-y-5">
                                {[
                                    { label: "Matches Today", value: "142", bar: "w-[85%]", color: "from-emerald-400 to-emerald-500", suffix: "↑12%" },
                                    { label: "Active Requests", value: "18", bar: "w-[30%]", color: "from-amber-400 to-orange-400", suffix: "Urgent" },
                                    { label: "New Donors", value: "45", bar: "w-[60%]", color: "from-blue-400 to-blue-500", suffix: "Today" },
                                ].map((s, idx) => (
                                    <div key={s.label} className="group relative">
                                        <div className="flex justify-between text-[11px] mb-2 uppercase font-bold items-center">
                                            <span className="text-slate-500 group-hover:text-slate-800 transition-colors">{s.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{s.suffix}</span>
                                                <span className="text-slate-800 text-sm">{s.value}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50 shadow-inner">
                                            <div
                                                className={`bg-gradient-to-r ${s.color} h-full rounded-full relative overflow-hidden`}
                                                style={{ width: s.bar.match(/w-\[(.*?)\]/)[1] }}
                                            >
                                                {/* Shimmer effect inside the bar */}
                                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" style={{ animationDelay: `${idx * 0.2}s` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                <span>Network Status</span>
                                <span className="text-emerald-500">Optimum (99.8%)</span>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            {/* ── Workflow Timeline Section ───────────────────────────── */}
            <section id="workflow" ref={stepsRef} className="relative py-32 px-4 bg-slate-50 overflow-hidden">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center md:text-left mb-20 md:ml-32">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100 mb-4">
                            ✦ How BloodConnect Works
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            Three Steps to <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Save a Life.</span>
                        </h2>
                    </div>

                    <div className="relative">
                        {/* The Vertical Line */}
                        <div className="absolute left-[28px] md:left-[58px] top-6 bottom-16 w-1.5 bg-slate-200 rounded-full" />
                        {/* The Active Line (we'll animate its height via GSAP) */}
                        <div className="timeline-progress absolute left-[28px] md:left-[58px] top-6 w-1.5 bg-gradient-to-b from-red-400 to-red-600 rounded-full h-0 shadow-[0_0_15px_rgba(229,57,53,0.5)] z-10" />

                        <div className="space-y-24 md:space-y-36">
                            {/* Point 1 */}
                            <div className="timeline-node relative flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center min-h-[250px]">
                                {/* Node Indicator */}
                                <div className="absolute left-[8px] md:left-[38px] top-2 md:top-1/2 md:-translate-y-1/2 w-11 h-11 bg-white border-[3px] border-slate-200 rounded-full z-20 flex items-center justify-center font-black text-slate-400 transition-colors duration-300 node-dot">
                                    1
                                </div>
                                {/* Content Offset */}
                                <div className="ml-20 md:ml-44 w-full flex flex-col lg:flex-row items-center gap-10">
                                    <div className="flex-1 space-y-5">
                                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-red-50">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Join the Community</h3>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                                            Sign up and get verified instantly. Join over <strong className="text-red-500">12,000+ donors</strong> across 320 cities who are ready to respond to emergencies. Your profile helps us match you accurately.
                                        </p>
                                    </div>
                                    <div className="flex-1 w-full lg:max-w-md bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 stat-box opacity-0 translate-y-8">
                                        <div className="flex gap-6 mb-6">
                                            <div className="flex-1 text-center">
                                                <div className="text-4xl font-black text-red-500 mb-1">45k+</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lives Saved</div>
                                            </div>
                                            <div className="w-px bg-slate-100" />
                                            <div className="flex-1 text-center">
                                                <div className="text-4xl font-black text-emerald-500 mb-1">98%</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fulfillment</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <Users size={20} className="text-slate-400" />
                                            <p className="text-sm font-semibold text-slate-600">All donors are 100% ID verified for safety.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Point 2 */}
                            <div className="timeline-node relative flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center min-h-[250px]">
                                {/* Node Indicator */}
                                <div className="absolute left-[8px] md:left-[38px] top-2 md:top-1/2 md:-translate-y-1/2 w-11 h-11 bg-white border-[3px] border-slate-200 rounded-full z-20 flex items-center justify-center font-black text-slate-400 transition-colors duration-300 node-dot">
                                    2
                                </div>
                                <div className="ml-20 md:ml-44 w-full flex flex-col lg:flex-row-reverse items-center gap-10 lg:pl-10">
                                    <div className="flex-1 space-y-5 lg:pl-8">
                                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-blue-50">
                                            <MapPin size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Real-time Location Match</h3>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                                            When an emergency strikes, our algorithm instantly finds the nearest available donors with the precise blood type. Get pinged or browse active requests directly on your dashboard.
                                        </p>
                                    </div>
                                    <div className="flex-1 w-full lg:max-w-md bg-slate-900 p-6 md:p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-800 stat-box opacity-0 translate-y-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                                <Activity className="text-emerald-400" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-1">
                                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Radar
                                                </p>
                                                <p className="text-white font-bold text-sm">Searching donors...</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 relative bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                                            {/* Dummy radar dots */}
                                            <div className="absolute right-6 top-3 text-white/50 text-xs font-semibold">📍 1.2km away</div>
                                            <div className="absolute right-4 bottom-3 text-white/50 text-xs font-semibold">📍 3.5km away</div>
                                            <div className="w-4/5 h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                <div className="w-full h-full bg-blue-500 rounded-full" />
                                            </div>
                                            <div className="w-2/3 h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                <div className="w-full h-full bg-emerald-400 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Point 3 */}
                            <div className="timeline-node relative flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center min-h-[250px]">
                                {/* Node Indicator */}
                                <div className="absolute left-[8px] md:left-[38px] top-2 md:top-1/2 md:-translate-y-1/2 w-11 h-11 bg-white border-[3px] border-slate-200 rounded-full z-20 flex items-center justify-center font-black text-slate-400 transition-colors duration-300 node-dot">
                                    3
                                </div>
                                <div className="ml-20 md:ml-44 w-full flex flex-col lg:flex-row items-center gap-10">
                                    <div className="flex-1 space-y-5">
                                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-emerald-50">
                                            <Heart size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Secure Chat & Connect</h3>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                                            Found a match? Communicate directly and privately using our <strong className="text-emerald-500 font-bold">end-to-end Secure Chat</strong>. Coordinate the hospital visit, give blood, and mark the life-saving mission as complete.
                                        </p>
                                    </div>
                                    <div className="flex-1 w-full lg:max-w-md bg-white p-6 rounded-3xl shadow-xl border border-slate-100 stat-box opacity-0 translate-y-8">
                                        <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 shadow border border-red-400 rounded-full flex items-center justify-center text-white font-black text-sm">P</div>
                                            <div>
                                                <p className="text-base font-black text-slate-800 leading-tight">Priya M.</p>
                                                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Online Now</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 text-sm font-medium">
                                            <div className="bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%] border border-slate-200">
                                                Hi, I need O- blood at AIIMS immediately. Are you available?
                                            </div>
                                            <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm w-fit max-w-[85%] ml-auto shadow-md">
                                                Yes! I'm 10 mins away. Sending my details now.
                                            </div>
                                            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400 justify-center">
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ──────────────────────────────────────────── */}
            <section className="py-24 px-4 bg-red-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-800 rounded-full blur-3xl" />
                </div>
                <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
                    <div className="text-6xl">🩸</div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                        Every Drop Counts.<br />Be Someone's Hero.
                    </h2>
                    <p className="text-red-100 font-medium text-lg leading-relaxed">
                        Register as a donor today and get notified when someone in your area urgently needs blood that matches yours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={handleGetStarted}
                            className="px-10 py-4 bg-white text-red-600 font-black rounded-2xl hover:bg-red-50 transition-all shadow-xl text-base flex items-center justify-center gap-2 group">
                            <Heart size={20} className="fill-red-600 group-hover:scale-110 transition-transform" />
                            {isAuthenticated ? "View Dashboard" : "Become a Donor"}
                        </button>
                        <Link to="/login"
                            className="px-10 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-base flex items-center justify-center gap-2">
                            <Search size={20} />
                            Request Blood
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="bg-slate-900 text-slate-400 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900">
                                    <Droplets size={20} className="text-white fill-white" />
                                </div>
                                <span className="font-black text-xl text-white tracking-tight">
                                    Blood<span className="text-red-500">Connect</span>
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                                Bridging the gap between blood donors and patients across India. Fast, free, and verified.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                                </span>
                                432 Donors Online Right Now
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Platform</h4>
                            <ul className="space-y-2.5 text-sm font-medium">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                                <li><a href="#impact" className="hover:text-white transition-colors">Impact</a></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Register as Donor</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Legal</h4>
                            <ul className="space-y-2.5 text-sm font-medium">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-medium">© 2024 BloodConnect. Made with ❤️ to save lives.</p>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <Droplets size={12} className="text-red-500" />
                            Every donation saves up to 3 lives.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ─── needed as used in StepCard but imported from lucide-react ─ */
function UserPlus({ size, ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
    );
}
