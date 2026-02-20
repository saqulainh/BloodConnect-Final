import React from 'react';
import {
    LayoutDashboard, Users, Ticket, Tent,
    BarChart3, Settings, LogOut, X, Droplets, Search
} from 'lucide-react';

const NAV_ITEMS = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "donors", icon: Users, label: "Donors" },
    { id: "requests", icon: Ticket, label: "Blood Requests" },
    { id: "camps", icon: Tent, label: "Blood Camps" },
];

const MGMT_ITEMS = [
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "settings", icon: Settings, label: "Settings" },
];

const NavItem = ({ id, icon: Icon, label, badge, activeTab, setActiveTab, setIsSidebarOpen }) => {
    const active = activeTab === id;
    return (
        <button
            onClick={() => {
                setActiveTab(id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-bold transition-all duration-200 relative
                ${active ? 'bg-red-600 text-white shadow-lg shadow-red-200/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
            `}
        >
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-900 rounded-r-full -ml-4" />}
            <Icon size={18} className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400'}`} />
            <span className="flex-1 text-left">{label}</span>
            {badge && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                    {badge}
                </span>
            )}
        </button>
    );
};

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, user, logout }) {
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const bloodGroup = user?.bloodGroup || '';
    const roleLabel = user?.role === 'donor' ? 'Donor' : user?.role === 'receiver' ? 'Receiver' : 'Member';

    return (
        <aside className={`
            fixed top-0 left-0 z-50 h-screen w-[270px] bg-white border-r border-slate-100 flex flex-col
            transition-transform duration-300 ease-in-out shadow-2xl shadow-slate-200/50
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            {/* ── Brand ── */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                    <Droplets size={18} className="text-white fill-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-base font-black tracking-tight text-slate-900">Blood<span className="text-red-600">Connect</span></h1>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dashboard</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* ── User Card ── */}
            <div className="mx-3 mt-4 p-3.5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-200">
                            {initials}
                        </div>
                        {bloodGroup && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-red-100 rounded-full flex items-center justify-center text-[7px] font-black text-red-600">
                                {bloodGroup}
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate leading-tight">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{user?.email || ''}</p>
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">{roleLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Nav ── */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
                {NAV_ITEMS.map(item => (
                    <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
                ))}

                <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6">Management</p>
                {MGMT_ITEMS.map(item => (
                    <NavItem key={item.id} {...item} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
                ))}
            </div>

            {/* ── Quick search hint ── */}
            <div className="mx-3 mb-3 flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs font-semibold cursor-default">
                <Search size={13} />
                <span>Find a donor nearby...</span>
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
