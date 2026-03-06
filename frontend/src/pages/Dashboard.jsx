import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Settings, Menu, Bell, Droplets, Search, Activity, Phone, X, AlertTriangle } from "lucide-react";

import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/DashboardHome";
import getPusher, { subscribeToUserChannel, unsubscribeFromUserChannel } from "../services/pusher";
import DonorManagement from "../components/dashboard/DonorManagement";
import RequestManagement from "../components/dashboard/RequestManagement";
import BloodCamps from "../components/dashboard/BloodCamps";
import SettingsPanel from "../components/dashboard/Settings";
import Analytics from "../components/dashboard/Analytics";
import NotificationBell from "../components/ui/NotificationBell";
import AdminAnalytics from "../components/dashboard/AdminAnalytics";
import ProximityFinder from "../components/dashboard/ProximityFinder";
import HealthWallet from "../components/dashboard/HealthWallet";
import SOSBroadcast from "../components/dashboard/SOSBroadcast";
import Chat from "./Chat";
import BloodJourney from "../components/dashboard/BloodJourney";

// ── Receiver Dashboard Components ──
import ReceiverDashboardHome from "../components/receiver/ReceiverDashboardHome";
import MyRequests from "../components/receiver/MyRequests";
import FindDonorsReceiver from "../components/receiver/FindDonorsReceiver";
import ReceiverWallet from "../components/receiver/ReceiverWallet";
import ReceiverTimeline from "../components/receiver/ReceiverTimeline";
import ReceiverAnalytics from "../components/receiver/ReceiverAnalytics";
import GratitudeBoard from "../components/receiver/GratitudeBoard";
import LiveMap from "../components/dashboard/LiveMap";

// ── Admin Components ──
import AdminHome from "../components/admin/AdminHome";
import UserManagement from "../components/admin/UserManagement";
import RequestOperations from "../components/admin/RequestOperations";
import CampAdmin from "../components/admin/CampAdmin";
import SystemHealth from "../components/admin/SystemHealth";
import BroadcastCenter from "../components/admin/BroadcastCenter";
import RevenuePanel from "../components/admin/RevenuePanel";
import AuditLogs from "../components/admin/AuditLogs";
import BloodInventory from "../components/admin/BloodInventory";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";

// ── Donor Tab Titles ──
const DONOR_TAB_TITLES = {
    dashboard: "Overview",
    donors: "Donors",
    requests: "Blood Requests",
    proximity: "Nearby Donors",
    camps: "Blood Camps",
    chat: "Secure Chat",
    analytics: "Analytics",
    "health-wallet": "Health Wallet",
    "blood-journey": "Blood Journey",
    sos: "SOS Broadcast",
    settings: "Settings",
    "admin-analytics": "Mission Intel",
    "admin-home": "Admin Dashboard",
    "admin-users": "User Management",
    "admin-requests": "Request Operations",
    "admin-camps": "Camp Management",
    "admin-inventory": "Blood Inventory",
    "admin-health": "System Health",
    "admin-broadcast": "Broadcast Center",
    "admin-revenue": "Revenue & Donations",
    "admin-audit": "Audit Logs",
};
const DONOR_TAB_SUBTITLES = {
    dashboard: "Welcome back! Here's today's summary.",
    donors: "Manage registered donors and their availability.",
    requests: "Track and fulfill urgent blood requests.",
    proximity: "AI-powered geo-matching with drive-time estimates.",
    camps: "Organize and monitor blood donation camps.",
    chat: "Communicate securely with donors and patients.",
    analytics: "Deep insights into donation patterns.",
    "health-wallet": "Your donation history, badges, and recovery tracker.",
    "blood-journey": "Track your donation from collection to life saved.",
    sos: "Broadcast critical requests to nearby donors instantly.",
    settings: "Configure your account preferences.",
    "admin-analytics": "Platform intelligence — revenue, growth, and impact metrics.",
    "admin-home": "Full control center — users, requests, revenue, system.",
    "admin-users": "View, edit, ban/unban, promote, and delete users.",
    "admin-requests": "Manage all blood requests — force-fulfill, edit, delete.",
    "admin-camps": "Create, edit, and manage blood donation camps.",
    "admin-health": "Server, database, and system health monitoring.",
    "admin-broadcast": "Send announcements and alerts to all users.",
    "admin-revenue": "Financial overview — revenue trends, top donors, payments.",
    "admin-audit": "Track all admin actions for accountability.",
};

// ── Receiver Tab Titles ──
const RECEIVER_TAB_TITLES = {
    dashboard: "Receiver Dashboard",
    "my-requests": "My Requests",
    "find-donors": "Find Donors",
    "live-map": "Live Map",
    camps: "Blood Camps",
    chat: "Secure Chat",
    "receiver-wallet": "My Wallet",
    "request-timeline": "Request Timeline",
    "receiver-analytics": "Analytics",
    gratitude: "Gratitude Board",
    sos: "SOS Broadcast",
    settings: "Settings",
};
const RECEIVER_TAB_SUBTITLES = {
    dashboard: "Welcome back! Track your blood requests in real-time.",
    "my-requests": "Create, manage, and track all your blood requests.",
    "find-donors": "AI-powered search for compatible donors near you.",
    "live-map": "Real-time emergency intelligence map — donors & requests.",
    camps: "Find nearby blood donation camps and events.",
    chat: "Communicate securely with donors and coordinators.",
    "receiver-wallet": "Your badges, impact, and received blood history.",
    "request-timeline": "Track your request journey from creation to life saved.",
    "receiver-analytics": "Deep insights into your request patterns and fulfillment.",
    gratitude: "Thank the heroes who donated blood for you.",
    sos: "Broadcast critical requests to nearby donors instantly.",
    settings: "Configure your account preferences.",
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout, loading, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [chatTargetUser, setChatTargetUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const { addToast } = useToast();

    const handleSearch = (e) => {
        if (e.key === "Enter" && searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            if (query.includes("donor") || query.includes("find")) setActiveTab("proximity");
            else if (query.includes("request") || query.includes("urgent")) setActiveTab("requests");
            else if (query.includes("health") || query.includes("wallet") || query.includes("history")) setActiveTab("health-wallet");
            else if (query.includes("camp") || query.includes("event")) setActiveTab("camps");
            else if (query.includes("chat") || query.includes("message")) setActiveTab("chat");
            else if (query.includes("intel") || query.includes("admin")) setActiveTab("admin-analytics");
            else addToast(`No section matches "${searchTerm}". Try "health wallet", "donors", etc.`, "info");
            setSearchTerm("");
        }
    };

    const handleNotificationClick = (tab) => {
        setActiveTab(tab);
        setShowNotifications(false);
        if (unreadCount > 0) setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = () => {
        setUnreadCount(0);
        addToast("All notifications marked as read.", "success");
    };

    const handleStartChat = (targetUser) => {
        setChatTargetUser(targetUser);
        setActiveTab("chat");
    };

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?._id) {
            const handleGlobalPusher = (eventName, data) => {
                if (eventName === "incoming-call") {
                    addToast(
                        <div className="flex items-center gap-4 py-1">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-black animate-pulse">
                                {data.caller?.name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">Incoming Call</p>
                                <p className="font-bold text-sm text-slate-800">{data.caller?.name}</p>
                            </div>
                            <button onClick={() => { setChatTargetUser(data.caller); setActiveTab("chat"); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black">ANSWER</button>
                        </div>, "info", 8000
                    );
                }
            };

            const userChannel = subscribeToUserChannel(user._id, handleGlobalPusher);

            // EIMS Global Critical Alert
            const pusherInst = getPusher();
            const eimsChannel = pusherInst.subscribe('global-events');
            eimsChannel.bind('criticalAlert', (req) => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
                addToast(
                    <div className="flex flex-col gap-2 min-w-[280px]">
                        <div className="flex items-center gap-3 border-b border-red-500/20 pb-2">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">EIMS Critical Broadcast</p>
                                <p className="font-bold text-sm text-slate-100">{req.bloodGroup} Needed Urgently</p>
                            </div>
                        </div>
                        <div className="text-xs text-slate-300">
                            <p><span className="text-slate-500 font-medium">Hospital:</span> {req.hospital}</p>
                        </div>
                        <button onClick={() => setActiveTab("requests")} className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-colors">View on Map</button>
                    </div>, "error", 15000
                );
            });

            return () => {
                unsubscribeFromUserChannel(userChannel, user._id);
                eimsChannel.unbind_all();
                pusherInst.unsubscribe('global-events');
            };
        }
    }, [loading, isAuthenticated, user]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const isReceiver = user?.role === 'receiver';
    const TAB_TITLES = isReceiver ? RECEIVER_TAB_TITLES : DONOR_TAB_TITLES;
    const TAB_SUBTITLES = isReceiver ? RECEIVER_TAB_SUBTITLES : DONOR_TAB_SUBTITLES;

    const renderContent = () => {
        // ── Receiver Tabs ──
        if (isReceiver) {
            switch (activeTab) {
                case "dashboard": return <ReceiverDashboardHome setActiveTab={setActiveTab} user={user} />;
                case "my-requests": return <MyRequests onStartChat={handleStartChat} />;
                case "find-donors": return <FindDonorsReceiver onStartChat={handleStartChat} />;
                case "live-map": return <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 lg:p-6"><h3 className="text-xl font-black text-slate-800 mb-4">EIMS Live Map</h3><LiveMap setActiveTab={setActiveTab} /></div>;
                case "camps": return <BloodCamps />;
                case "chat": return <Chat preselectedUser={chatTargetUser} />;
                case "receiver-wallet": return <ReceiverWallet />;
                case "request-timeline": return <ReceiverTimeline />;
                case "receiver-analytics": return <ReceiverAnalytics />;
                case "gratitude": return <GratitudeBoard />;
                case "sos": return <SOSBroadcast />;
                case "settings": return <SettingsPanel />;
                // Admin tabs accessible from receiver role if admin
                case "admin-home": return <AdminHome setActiveTab={setActiveTab} />;
                case "admin-users": return <UserManagement />;
                case "admin-requests": return <RequestOperations />;
                case "admin-camps": return <CampAdmin />;
                case "admin-inventory": return <BloodInventory />;
                case "admin-health": return <SystemHealth />;
                case "admin-broadcast": return <BroadcastCenter />;
                case "admin-revenue": return <RevenuePanel />;
                case "admin-audit": return <AuditLogs />;
                case "admin-analytics": return <AdminAnalytics />;
                default: return <ReceiverDashboardHome setActiveTab={setActiveTab} user={user} />;
            }
        }
        // ── Donor Tabs (unchanged) ──
        switch (activeTab) {
            case "dashboard": return <DashboardHome setActiveTab={setActiveTab} user={user} />;
            case "donors": return <DonorManagement onStartChat={handleStartChat} />;
            case "requests": return <RequestManagement onStartChat={handleStartChat} currentUser={user} />;
            case "proximity": return <ProximityFinder onStartChat={handleStartChat} />;
            case "camps": return <BloodCamps />;
            case "chat": return <Chat preselectedUser={chatTargetUser} />;
            case "analytics": return <Analytics />;
            case "health-wallet": return <HealthWallet />;
            case "blood-journey": return <BloodJourney />;
            case "sos": return <SOSBroadcast />;
            case "settings": return <SettingsPanel />;
            case "admin-analytics": return <AdminAnalytics />;
            case "admin-home": return <AdminHome setActiveTab={setActiveTab} />;
            case "admin-users": return <UserManagement />;
            case "admin-requests": return <RequestOperations />;
            case "admin-camps": return <CampAdmin />;
            case "admin-inventory": return <BloodInventory />;
            case "admin-health": return <SystemHealth />;
            case "admin-broadcast": return <BroadcastCenter />;
            case "admin-revenue": return <RevenuePanel />;
            case "admin-audit": return <AuditLogs />;
            default: return <DashboardHome setActiveTab={setActiveTab} user={user} />;
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">
            Loading BloodConnect...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={handleLogout} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-[270px]">
                <header className="bg-white border-b border-slate-100 px-5 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 leading-none">{TAB_TITLES[activeTab]}</h2>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5 hidden sm:block">{TAB_SUBTITLES[activeTab]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-red-500/20">
                            <Search size={14} className="text-slate-400" />
                            <input type="text" placeholder="Search donors, camps..." className="bg-transparent border-none outline-none text-xs font-semibold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
                        </div>
                        <div className="flex items-center gap-2.5">
                            <NotificationBell userId={user?._id} />
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs">U</div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-black text-slate-800">{user?.name ? user.name.split(' ')[0] : 'User'}</p>
                                <p className="text-[10px] text-red-600 font-bold">{user?.bloodGroup} • {user?.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main Scrollable Area ── */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="max-w-7xl mx-auto pb-20">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
}
        </div >
    );
}
