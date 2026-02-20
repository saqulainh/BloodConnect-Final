import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, Droplets, LogIn, LayoutDashboard, UserPlus } from "lucide-react";
import gsap from "gsap";

export default function Home() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".hero-content",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
            );
            gsap.fromTo(".nav-card",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)", delay: 0.8 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const NavCard = ({ to, icon: Icon, title, desc, color }) => (
        <Link to={to} className="nav-card group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white mb-2 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">{desc}</p>
            <div className="mt-2 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
            </div>
        </Link>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">

            {/* Left Hero Section */}
            <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                <div className="hero-content relative z-10 max-w-lg mx-auto md:mx-0">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                            <Droplets size={22} />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900">BLOOD<span className="text-red-600">CONNECT</span></span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                        Donate Blood,<br />
                        <span className="text-red-600">Save a Life.</span>
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
                        Your single donation can save up to three lives. Join our community of heroes today and make a difference.
                    </p>

                    <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                            ))}
                        </div>
                        <span>1,200+ Donors Joined</span>
                    </div>
                </div>

                {/* Decorative Blob */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
            </div>

            {/* Right Navigation Section */}
            <div className="flex-1 bg-slate-50 p-8 md:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full grid gap-4">
                    <NavCard
                        to="/login"
                        icon={LogIn}
                        title="Login"
                        desc="Access your account to manage donations"
                        color="bg-slate-800"
                    />
                    <NavCard
                        to="/register"
                        icon={UserPlus}
                        title="Register"
                        desc="New here? Create an account to start"
                        color="bg-red-600"
                    />
                    <NavCard
                        to="/dashboard"
                        icon={LayoutDashboard}
                        title="Dashboard"
                        desc="Go directly to your dashboard if logged in"
                        color="bg-blue-600"
                    />
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Powered by BloodConnect</p>
                </div>
            </div>

        </div>
    );
}
