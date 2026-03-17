import React, { useState, useEffect } from 'react';
import {
    Users, Search, Shield, Trash2, Ban, Edit, ChevronLeft, ChevronRight,
    Loader2, AlertCircle, CheckCircle, X, Filter, UserCog, DownloadCloud
} from 'lucide-react';
import {
    getAdminUsers, adminUpdateUser, adminDeleteUser, adminToggleBan, adminPromoteUser, exportAdminUsersCSV
} from '../../services/api';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ROLES = ["donor", "receiver", "admin"];

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [bgFilter, setBgFilter] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [actionLoading, setActionLoading] = useState(null);
    const [feedback, setFeedback] = useState('');

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            if (bgFilter) params.bloodGroup = bgFilter;
            const res = await getAdminUsers(params);
            if (res?.success) {
                setUsers(res.data);
                setPagination(res.pagination);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [roleFilter, bgFilter]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchUsers();
    };

    const showFeedback = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

    const handleBan = async (id) => {
        setActionLoading(id);
        try {
            const res = await adminToggleBan(id);
            if (res?.success) { showFeedback(res.message); fetchUsers(pagination.page); }
        } catch (err) { showFeedback('Failed'); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        setActionLoading(id);
        try {
            const res = await adminDeleteUser(id);
            if (res?.success) { showFeedback(res.message); fetchUsers(pagination.page); }
        } catch (err) { showFeedback('Failed'); }
        finally { setActionLoading(null); }
    };

    const handlePromote = async (id, role) => {
        setActionLoading(id);
        try {
            const res = await adminPromoteUser(id, role);
            if (res?.success) { showFeedback(res.message); fetchUsers(pagination.page); }
        } catch (err) { showFeedback('Failed'); }
        finally { setActionLoading(null); }
    };

    const handleEditSave = async () => {
        if (!editUser) return;
        setActionLoading(editUser._id);
        try {
            const res = await adminUpdateUser(editUser._id, editForm);
            if (res?.success) { showFeedback('User updated!'); setEditUser(null); fetchUsers(pagination.page); }
        } catch (err) { showFeedback('Update failed'); }
        finally { setActionLoading(null); }
    };

    const roleBadge = (role) => {
        const map = {
            admin: 'bg-amber-100 text-amber-700',
            donor: 'bg-red-100 text-red-600',
            receiver: 'bg-red-100 text-red-600',
        };
        return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${map[role] || 'bg-slate-100 text-slate-500'}`}>{role}</span>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <UserCog size={24} className="text-blue-600" /> User Management
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">{pagination.total} total users on platform</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={async () => {
                        try {
                            setFeedback('Exporting...');
                            await exportAdminUsersCSV();
                            setFeedback('Export Successful!');
                        } catch (err) {
                            showFeedback('Export Failed.');
                        }
                    }} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-100 transition-colors border border-rose-200">
                        <DownloadCloud size={16} /> Export CSV
                    </button>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
                            placeholder="Search name, email..."
                            className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64" />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select value={bgFilter} onChange={e => setBgFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                        <option value="">All Blood Groups</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
            </div>

            {/* Feedback */}
            {feedback && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 flex items-center gap-2">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="text-slate-400 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Blood</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${u.isBanned ? 'opacity-50 bg-red-50/30' : ''}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-xs">
                                                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{u.name}</p>
                                                    <p className="text-[11px] text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{roleBadge(u.role)}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{u.bloodGroup}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.isBanned ? (
                                                <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">BANNED</span>
                                            ) : u.isVerified ? (
                                                <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">Verified</span>
                                            ) : (
                                                <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Unverified</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400 font-medium">
                                            {new Date(u.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => { setEditUser(u); setEditForm({ name: u.name, email: u.email, phone: u.phone, bloodGroup: u.bloodGroup, city: u.city || '' }); }}
                                                    className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors" title="Edit">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleBan(u._id)} disabled={actionLoading === u._id}
                                                    className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'hover:bg-rose-50 text-rose-500' : 'hover:bg-amber-50 text-amber-500'}`} title={u.isBanned ? 'Unban' : 'Ban'}>
                                                    <Ban size={14} />
                                                </button>
                                                <select value={u.role} onChange={e => handlePromote(u._id, e.target.value)}
                                                    className="text-[10px] font-bold border border-slate-200 rounded-lg px-1 py-1 bg-white focus:outline-none">
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <button onClick={() => handleDelete(u._id)} disabled={actionLoading === u._id}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400">
                        Page {pagination.page} of {pagination.pages} • {pagination.total} users
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30 text-slate-500">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30 text-slate-500">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editUser && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditUser(null)} />
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800">Edit User</h3>
                            <button onClick={() => setEditUser(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {['name', 'email', 'phone', 'city'].map(field => (
                                <div key={field}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">{field}</label>
                                    <input value={editForm[field] || ''} onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            ))}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Blood Group</label>
                                <select value={editForm.bloodGroup || ''} onChange={e => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <button onClick={handleEditSave} disabled={actionLoading === editUser._id}
                                className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                                {actionLoading === editUser._id ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
