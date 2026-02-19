import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Settings, Menu } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/DashboardHome";
import DonorManagement from "../components/dashboard/DonorManagement";
import RequestManagement from "../components/dashboard/RequestManagement";
import ComingSoon from "../components/dashboard/ComingSoon";

import { isLoggedIn, logoutUser, getMe } from "../services/api";

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await getMe();
            setUser(data.data?.user || data.data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardHome setActiveTab={setActiveTab} />;
            case "donors": return <DonorManagement />;
            case "requests": return <RequestManagement />;
            case "camps": return <ComingSoon title="Blood Camps" icon={BarChart3} />;
            case "analytics": return <ComingSoon title="Analytics" icon={BarChart3} />;
            case "settings": return <ComingSoon title="Settings" icon={Settings} />;
            default: return <DashboardHome setActiveTab={setActiveTab} />;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
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

                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                        <span className="font-black text-slate-900">BloodFlow</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Dashboard Header (Desktop) - Optional info bar */}
                <div className="hidden lg:flex items-center justify-between px-8 py-5 bg-white/50 backdrop-blur-sm sticky top-0 z-30 ml-4 mr-4 mt-4 rounded-2xl border border-white shadow-sm">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 capitalize">{activeTab}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Overview</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-24">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
