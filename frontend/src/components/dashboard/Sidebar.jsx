import React from 'react';
import {
    LayoutDashboard, Users, Ticket, Tent,
    BarChart3, Settings, LogOut, X, Droplets, Search, MessageSquare, ShieldAlert,
    Navigation, Wallet, Siren, Route, Heart, Map, Eye,
    Shield, UserCog, Activity, Megaphone, DollarSign, FileText
} from 'lucide-react';

// ── Donor Navigation ──────────────────────────────────────────────────
const DONOR_NAV_ITEMS = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "donors", icon: Users, label: "Donors" },
    { id: "requests", icon: Ticket, label: "Blood Requests" },
    { id: "proximity", icon: Navigation, label: "Nearby Donors", badge: "AI" },
    { id: "camps", icon: Tent, label: "Blood Camps" },
    { id: "chat", icon: MessageSquare, label: "Secure Chat", badge: "New" },
];
const DONOR_MGMT_ITEMS = [
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "health-wallet", icon: Wallet, label: "Health Wallet" },
    { id: "blood-journey", icon: Route, label: "Blood Journey", badge: "New" },
    { id: "sos", icon: Siren, label: "SOS Broadcast", badge: "🚨" },
    { id: "settings", icon: Settings, label: "Settings" },
];

// ── Receiver Navigation ───────────────────────────────────────────────
const RECEIVER_NAV_ITEMS = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "my-requests", icon: Ticket, label: "My Requests", badge: "Live" },
    { id: "find-donors", icon: Navigation, label: "Find Donors", badge: "AI" },
    { id: "live-map", icon: Map, label: "Live Map", badge: "EIMS" },
    { id: "camps", icon: Tent, label: "Blood Camps" },
    { id: "chat", icon: MessageSquare, label: "Secure Chat" },
];
const RECEIVER_MGMT_ITEMS = [
    { id: "receiver-wallet", icon: Wallet, label: "My Wallet" },
    { id: "request-timeline", icon: Route, label: "Request Timeline", badge: "New" },
    { id: "receiver-analytics", icon: BarChart3, label: "Analytics" },
    { id: "gratitude", icon: Heart, label: "Gratitude Board", badge: "💚" },
    { id: "sos", icon: Siren, label: "SOS Broadcast", badge: "🚨" },
    { id: "settings", icon: Settings, label: "Settings" },
];

const ADMIN_ITEMS = [
    { id: "admin-home", icon: Shield, label: "Admin Dashboard" },
    { id: "admin-users", icon: UserCog, label: "User Management" },
    { id: "admin-requests", icon: Ticket, label: "Request Ops" },
    { id: "admin-camps", icon: Tent, label: "Camp Management" },
    { id: "admin-health", icon: Activity, label: "System Health" },
    { id: "admin-broadcast", icon: Megaphone, label: "Broadcast" },
    { id: "admin-revenue", icon: DollarSign, label: "Revenue" },
    { id: "admin-audit", icon: FileText, label: "Audit Logs" },
    { id: "admin-analytics", icon: ShieldAlert, label: "Mission Intel" },
];

const NavItem = ({ id, icon: Icon, label, badge, activeTab, setActiveTab, setIsSidebarOpen }) => {
    const active = activeTab === id;
    const accentClass = (active ? 'bg-red-600 text-white shadow-lg shadow-red-200/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800');
    const barColor = 'bg-red-900';
    const badgeInactive = 'bg-red-100 text-red-600';

    return (
        <button
            onClick={() => {
                setActiveTab(id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-bold transition-all duration-200 relative ${accentClass}`}
        >
            {active && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 ${barColor} rounded-r-full -ml-4`} />}
            <Icon size={18} className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : badgeInactive}`}>
                    {badge}
                </span>
            )}
        </button>
    );
};

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, user, logout }) {
    const name = user?.name || '';
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    const bloodGroup = user?.bloodGroup || '';
    const isReceiver = user?.role === 'receiver';
    const roleLabel = user?.role === 'donor' ? 'Donor' : isReceiver ? 'Receiver' : 'Member';

    const navItems = isReceiver ? RECEIVER_NAV_ITEMS : DONOR_NAV_ITEMS;
    const mgmtItems = isReceiver ? RECEIVER_MGMT_ITEMS : DONOR_MGMT_ITEMS;

    const brandGradient = 'from-red-500 to-red-700';
    const brandShadow = 'shadow-red-200';
    const brandAccent = 'text-red-600';
    const avatarGradient = 'from-red-500 to-red-700';
    const avatarShadow = 'shadow-red-200';
    const roleBg = 'bg-red-50';
    const roleText = 'text-red-600';

    return (
        <aside className={`
            fixed top-0 left-0 z-50 h-screen w-[270px] bg-white border-r border-slate-100 flex flex-col
            transition-transform duration-300 ease-in-out shadow-2xl shadow-slate-200/50
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            {/* ── Brand ── */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
                <div className={`w-9 h-9 bg-gradient-to-br ${brandGradient} rounded-xl flex items-center justify-center shadow-lg ${brandShadow}`}>
                    <Droplets size={18} className="text-white fill-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-base font-black tracking-tight text-slate-900">Blood<span className={brandAccent}>Connect</span></h1>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isReceiver ? 'Receiver Hub' : 'Dashboard'}</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* ── User Card ── */}
            <div className="mx-3 mt-4 p-3.5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {user?.profilePicture ? (
                            <div className="w-11 h-11 rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                <img src={user.profilePicture} alt={user?.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-black text-sm shadow-md ${avatarShadow}`}>
                                {initials}
                            </div>
                        )}
                        {bloodGroup && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-red-100 rounded-full flex items-center justify-center text-[7px] font-black ${roleText}`}>
                                {bloodGroup}
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate leading-tight">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{user?.email || ''}</p>
                        <div className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 ${roleBg} rounded-full`}>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className={`text-[9px] font-bold ${roleText} uppercase tracking-widest`}>{roleLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Nav ── */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
                {navItems.map(item => (
                    <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
                ))}

                <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6">
                    {isReceiver ? 'My Hub' : 'Management'}
                </p>
                {mgmtItems.map(item => (
                    <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
                ))}

                {/* Admin-only section */}
                {user?.role === "admin" && (
                    <>
                        <p className="px-4 text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 mt-6">🛡️ Admin Control</p>
                        {ADMIN_ITEMS.map(item => (
                            <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
                        ))}
                    </>
                )}
            </div>

            {/* ── Command Center ── */}
            <div className="mx-3 mb-3 relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={13} className="text-slate-400 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Command Center..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-200 focus:bg-white transition-all shadow-inner"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                            const val = e.target.value.toLowerCase();
                            if (isReceiver) {
                                if (val.includes("request")) setActiveTab("my-requests");
                                else if (val.includes("donor") || val.includes("find")) setActiveTab("find-donors");
                                else if (val.includes("map")) setActiveTab("live-map");
                                else if (val.includes("wallet")) setActiveTab("receiver-wallet");
                                else if (val.includes("timeline") || val.includes("journey")) setActiveTab("request-timeline");
                                else if (val.includes("analytics")) setActiveTab("receiver-analytics");
                                else if (val.includes("gratitude") || val.includes("thank")) setActiveTab("gratitude");
                                else if (val.includes("sos") || val.includes("emergen")) setActiveTab("sos");
                                else if (val.includes("camp")) setActiveTab("camps");
                                else if (val.includes("chat")) setActiveTab("chat");
                                else setActiveTab("dashboard");
                            } else {
                                if (val.includes("donor") || val.includes("find")) setActiveTab("proximity");
                                else if (val.includes("request")) setActiveTab("requests");
                                else if (val.includes("health") || val.includes("wallet")) setActiveTab("health-wallet");
                                else if (val.includes("camp")) setActiveTab("camps");
                                else if (val.includes("sos") || val.includes("emergen")) setActiveTab("sos");
                                else if (val.includes("chat")) setActiveTab("chat");
                                else if (val.includes("journey")) setActiveTab("blood-journey");
                                // Admin commands
                                else if (val.includes("admin") && val.includes("user")) setActiveTab("admin-users");
                                else if (val.includes("admin") && val.includes("req")) setActiveTab("admin-requests");
                                else if (val.includes("admin") && val.includes("rev")) setActiveTab("admin-revenue");
                                else if (val.includes("admin") && val.includes("audit")) setActiveTab("admin-audit");
                                else if (val.includes("admin") && val.includes("health")) setActiveTab("admin-health");
                                else if (val.includes("broadcast")) setActiveTab("admin-broadcast");
                                else if (val.includes("admin")) setActiveTab("admin-home");
                                else setActiveTab("dashboard");
                            }
                            e.target.value = "";
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }
                    }}
                />
            </div>

            {/* ── Logout ── */}
            <div className="border-t border-slate-100 px-3 py-4">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all group"
                >
                    <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
