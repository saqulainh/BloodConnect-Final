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

            // Features scroll trigger
            gsap.fromTo(".feature-card",
                { opacity: 0, y: 50 },
                {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.15,
                    scrollTrigger: { trigger: ".features-section", start: "top 75%", once: true }
                }
            );

            // Steps scroll trigger
            gsap.fromTo(".step-card",
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.2,
                    scrollTrigger: { trigger: ".steps-section", start: "top 75%", once: true }
                }
            );

            // Stats counter animation
            gsap.fromTo(".stat-card",
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1, duration: 0.6, stagger: 0.15,
                    scrollTrigger: { trigger: ".stats-section", start: "top 80%", once: true }
                }
            );

            // Blood type badges float animation
            gsap.to(".blood-badge-float", {
                y: -8,
                duration: 2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                stagger: 0.3
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
                        <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-red-600 transition-colors">How it Works</a>
                        <a href="#impact" className="hover:text-red-600 transition-colors">Impact</a>
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
                        <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-slate-600 hover:text-red-600 py-2">Features</a>
                        <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-slate-600 hover:text-red-600 py-2">How it Works</a>
                        <a href="#impact" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-slate-600 hover:text-red-600 py-2">Impact</a>
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
            <header ref={heroRef} className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 px-4 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-red-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-50 rounded-full blur-3xl opacity-80 pointer-events-none" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 relative z-10">
                        {/* Urgent Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                            </span>
                            <span className="text-red-700 text-sm font-bold">Urgent: O- Blood needed · Mumbai</span>
                        </div>

                        <h1 className="hero-h1 text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-slate-900">
                            Save a Life,<br />
                            <span className="text-red-600">Be a Hero.</span>
                        </h1>

                        <p className="hero-p text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
                            Connect directly with blood donors in your area. Fast, verified, and free — because every second counts.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={handleGetStarted}
                                className="hero-cta flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 text-base group">
                                <Heart size={20} className="fill-white transition-transform group-hover:scale-125" />
                                {isAuthenticated ? "Go to Dashboard" : "Start Donating"}
                            </button>
                            <Link to="/login"
                                className="hero-cta flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 font-bold rounded-2xl hover:border-red-200 hover:text-red-600 transition-all text-base">
                                <Search size={20} />
                                Find Blood Near Me
                            </Link>
                        </div>

                        {/* Donor Avatars + Count */}
                        <div className="hero-stats flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {["#e53935", "#ef5350", "#e57373", "#ffcdd2"].map((bg, i) => (
                                    <div key={i}
                                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black"
                                        style={{ backgroundColor: bg }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-slate-500">
                                <span className="text-red-600 text-base">12,000+</span> Active Donors
                            </p>
                        </div>
                    </div>

                    {/* Right Visual ── Floating Cards */}
                    <div className="relative h-[500px] hidden lg:block">
                        {/* Center glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-60" />

                        {/* Request Card */}
                        <div className="hero-card absolute top-4 left-4 w-64 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Bell size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Request</p>
                                    <p className="text-sm font-black text-slate-900">Blood Needed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <BloodBadge type="A+" urgency="critical" />
                                <BloodBadge type="O+" />
                                <BloodBadge type="B+" />
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
                                <MapPin size={12} className="text-red-500" />
                                AIIMS Hospital, New Delhi
                            </div>
                        </div>

                        {/* Donor Found Card */}
                        <div className="hero-card absolute bottom-8 left-8 w-60 bg-red-600 rounded-2xl p-5 shadow-2xl shadow-red-300">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow">
                                    R
                                </div>
                                <div>
                                    <p className="text-red-200 text-xs font-bold uppercase tracking-widest">Donor Found!</p>
                                    <p className="text-white font-black text-sm">Rahul K. • O+</p>
                                    <p className="text-red-200 text-xs font-medium mt-0.5">2.3 km away</p>
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-red-500 rounded-lg py-2 flex items-center justify-center gap-2 text-white font-bold text-sm hover:bg-red-400 transition-colors cursor-pointer">
                                <Heart size={14} className="fill-white" /> Connect Now
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="hero-card absolute top-16 right-0 w-52 bg-slate-900 rounded-2xl p-5 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart2 size={20} className="text-emerald-400" />
                                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Live Stats</p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Requests Today", value: "142", bar: "w-full" },
                                    { label: "Fulfilled", value: "98", bar: "w-3/4" },
                                    { label: "Donors Online", value: "432", bar: "w-4/5" },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400 font-semibold">{s.label}</span>
                                            <span className="text-white font-black">{s.value}</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div className={`${s.bar} bg-red-500 h-1.5 rounded-full`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Blood type badges floating */}
                        <div className="absolute bottom-28 right-4 flex flex-col gap-3">
                            {["A+", "B+", "O-", "AB+"].map((type) => (
                                <div key={type} className="blood-badge-float">
                                    <BloodBadge type={type} urgency="normal" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Features Section ────────────────────────────────────── */}
            <section id="features" ref={featuresRef} className="features-section py-24 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100">
                            ✦ Why BloodConnect
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                            Built for <span className="text-red-600">Moments</span> That Matter
                        </h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                            Every feature designed to connect donors and patients as fast as possible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Activity, title: "Real-time Matching",
                                desc: "Get matched with compatible donors in your area within seconds using live location data.",
                                gradient: "bg-gradient-to-br from-red-50 to-orange-50",
                                iconColor: "bg-red-100"
                            },
                            {
                                icon: ShieldCheck, title: "Verified Donors",
                                desc: "All donors go through ID and health verification. Your safety is our top priority.",
                                gradient: "bg-gradient-to-br from-blue-50 to-sky-50",
                                iconColor: "bg-blue-100"
                            },
                            {
                                icon: Clock, title: "24/7 Availability",
                                desc: "Emergencies don't wait. Our platform operates round the clock with instant alerts.",
                                gradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
                                iconColor: "bg-emerald-100"
                            },
                            {
                                icon: MapPin, title: "Location-Based Search",
                                desc: "Find donors nearest to you filtered by blood type, distance, and availability.",
                                gradient: "bg-gradient-to-br from-violet-50 to-purple-50",
                                iconColor: "bg-violet-100"
                            },
                            {
                                icon: Bell, title: "Instant Notifications",
                                desc: "Be the first to know when a request matches your blood type in your locality.",
                                gradient: "bg-gradient-to-br from-amber-50 to-yellow-50",
                                iconColor: "bg-amber-100"
                            },
                            {
                                icon: Users, title: "Community Network",
                                desc: "Join a growing network of 12,000+ donors committed to saving lives across India.",
                                gradient: "bg-gradient-to-br from-pink-50 to-rose-50",
                                iconColor: "bg-pink-100"
                            },
                        ].map((f, i) => (
                            <div key={i} className="feature-card">
                                <FeatureCard {...f} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Impact / Stats Section ──────────────────────────────── */}
            <section id="impact" className="stats-section py-24 px-4 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-red-800 rounded-full blur-3xl" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/50 text-red-300 text-xs font-bold uppercase tracking-widest border border-red-800 mb-4">
                            ✦ Our Impact
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white">
                            Numbers That <span className="text-red-500">Save Lives</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 stat-card">
                        <StatCard value="12,000+" label="Registered Donors" color="text-red-400" />
                        <StatCard value="45,000+" label="Lives Saved" color="text-emerald-400" />
                        <StatCard value="98%" label="Request Fulfillment" color="text-blue-400" />
                        <StatCard value="320+" label="Cities Covered" color="text-amber-400" />
                    </div>
                </div>
            </section>

            {/* ── How It Works Section ────────────────────────────────── */}
            <section id="how-it-works" ref={stepsRef} className="steps-section py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest border border-red-100">
                            ✦ How It Works
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                            Simple as <span className="text-red-600">1, 2, 3</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                            From signup to saving a life in under 5 minutes.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-10 left-[calc(33%+40px)] right-[calc(33%+40px)] h-0.5 bg-gradient-to-r from-red-200 via-red-400 to-red-200" />
                        {[
                            { icon: UserPlus, title: "Create Your Profile", desc: "Sign up with your blood type, location, and contact details in 2 minutes." },
                            { icon: Search, title: "Find or Request Blood", desc: "Search nearby donors or post an urgent request — instantly visible to donors around you." },
                            { icon: Heart, title: "Connect & Save Lives", desc: "Chat directly, coordinate, and complete the donation. Track your impact over time." },
                        ].map((step, i) => (
                            <div key={i} className="step-card">
                                <StepCard number={i + 1} icon={step.icon} title={step.title} desc={step.desc} />
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-16">
                        <button onClick={handleGetStarted}
                            className="inline-flex items-center gap-2 px-10 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 text-base group">
                            {isAuthenticated ? "Go to Dashboard" : "Join BloodConnect Free"}
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
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
