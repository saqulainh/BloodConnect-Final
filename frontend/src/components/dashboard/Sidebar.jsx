import React from 'react';
import {
    LayoutDashboard,
    Users,
    Ticket,
    Tent,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    User
} from 'lucide-react';

const SidebarItem = ({ id, icon: Icon, label, activeTab, setActiveTab, setIsSidebarOpen }) => (
    <button
        onClick={() => {
            setActiveTab(id);
            // On mobile, close sidebar after 'navigation'
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        className={`
            flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-bold transition-all
            ${activeTab === id
                ? 'bg-red-600 text-white shadow-md shadow-red-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }
        `}
    >
        <Icon size={18} className={activeTab === id ? 'text-white' : 'text-slate-400'} />
        <span>{label}</span>
    </button>
);

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, user, logout }) => (
    <aside className={`
        fixed top-0 right-0 z-50 h-screen w-[270px] bg-white border-l border-slate-200 flex flex-col py-6 px-4
        transition-transform duration-300 ease-in-out shadow-xl
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
        <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <User size={18} />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900">BloodFlow</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Admin Portal</p>
                </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
                <ChevronRight size={20} />
            </button>
        </div>

        <div className="flex items-center gap-3 pl-2 mb-6 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 leading-none truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Super Admin</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Main Menu</p>
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem id="donors" icon={Users} label="Donors" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem id="requests" icon={Ticket} label="Requests" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem id="camps" icon={Tent} label="Camps" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />

            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Management</p>
            <SidebarItem id="analytics" icon={BarChart3} label="Analytics" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem id="settings" icon={Settings} label="Settings" activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </div>
    </aside>
);

export default Sidebar;
