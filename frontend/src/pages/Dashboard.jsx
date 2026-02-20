import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Settings, Menu, Bell, Droplets, Search } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/DashboardHome";
import DonorManagement from "../components/dashboard/DonorManagement";
import RequestManagement from "../components/dashboard/RequestManagement";
import ComingSoon from "../components/dashboard/ComingSoon";

import { useAuth } from "../context/AuthContext";

const TAB_TITLES = {
    dashboard: "Overview",
    donors: "Donors",
    requests: "Blood Requests",
    camps: "Blood Camps",
    analytics: "Analytics",
    settings: "Settings",
};

const TAB_SUBTITLES = {
    dashboard: "Welcome back! Here's today's summary.",
    donors: "Manage registered donors and their availability.",
    requests: "Track and fulfill urgent blood requests.",
    camps: "Organize and monitor blood donation camps.",
    analytics: "Deep insights into donation patterns.",
    settings: "Configure your account preferences.",
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout, loading, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
        }
    }, [loading, isAuthenticated]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardHome setActiveTab={setActiveTab} user={user} />;
            case "donors": return <DonorManagement />;
            case "requests": return <RequestManagement />;
            case "camps": return <ComingSoon title="Blood Camps" icon={BarChart3} />;
            case "analytics": return <ComingSoon title="Analytics" icon={BarChart3} />;
            case "settings": return <ComingSoon title="Settings" icon={Settings} />;
            default: return <DashboardHome setActiveTab={setActiveTab} user={user} />;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 animate-pulse">Loading BloodConnect...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                logout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-[270px] transition-all duration-300">

                {/* ── Top Bar (both mobile + desktop) ── */}
                <header className="bg-white border-b border-slate-100 px-5 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu btn */}
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 leading-none">
                                {TAB_TITLES[activeTab]}
                            </h2>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block">
                                {TAB_SUBTITLES[activeTab]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search bar - desktop */}
                        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 w-48 cursor-pointer hover:bg-slate-100 transition-colors">
                            <Search size={13} />
                            <span>Search...</span>
                        </div>

                        {/* Notification bell */}
                        <div className="relative">
                            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                                <Bell size={20} />
                            </button>
                            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[9px] text-white font-black">
                                3
                            </div>
                        </div>

                        {/* User avatar */}
                        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-xl px-3 py-1.5 transition-colors border border-transparent hover:border-slate-100">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-none">{user?.name?.split(' ')[0] || 'User'}</p>
                                {user?.bloodGroup && (
                                    <p className="text-[10px] text-red-600 font-bold">{user.bloodGroup} • {user.role}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-24">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
