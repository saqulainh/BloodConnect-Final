import React, { useState, useEffect } from 'react';
import { Tent, Plus, Edit, Trash2, Loader2, CheckCircle, X, Calendar, MapPin, Users } from 'lucide-react';
import { getAdminCamps, adminCreateCamp, adminUpdateCamp, adminDeleteCamp } from '../../services/api';

export default function CampAdmin() {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editCamp, setEditCamp] = useState(null);
    const [form, setForm] = useState({ name: '', location: '', date: '', description: '', bloodGroupsNeeded: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchCamps = async () => {
        setLoading(true);
        try {
            const res = await getAdminCamps();
            if (res?.success) setCamps(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCamps(); }, []);

    const showFeedback = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

    const handleSubmit = async () => {
        setActionLoading(true);
        try {
            const payload = { ...form };
            if (payload.bloodGroupsNeeded) payload.bloodGroupsNeeded = payload.bloodGroupsNeeded.split(',').map(s => s.trim());
            let res;
            if (editCamp) {
                res = await adminUpdateCamp(editCamp._id, payload);
            } else {
                res = await adminCreateCamp(payload);
            }
            if (res?.success) {
                showFeedback(editCamp ? 'Camp updated!' : 'Camp created!');
                setShowForm(false);
                setEditCamp(null);
                setForm({ name: '', location: '', date: '', description: '', bloodGroupsNeeded: '' });
                fetchCamps();
            }
        } catch (err) { showFeedback('Error saving camp'); }
        finally { setActionLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this camp?')) return;
        try {
            const res = await adminDeleteCamp(id);
            if (res?.success) { showFeedback('Camp deleted.'); fetchCamps(); }
        } catch (err) { showFeedback('Delete failed'); }
    };

    const openEdit = (camp) => {
        setEditCamp(camp);
        setForm({
            name: camp.name || '',
            organizer: camp.organizer || '',
            location: camp.location || '',
            lat: camp.coordinates?.coordinates?.[1] || '',
            lng: camp.coordinates?.coordinates?.[0] || '',
            date: camp.date ? camp.date.slice(0, 10) : '',
            time: camp.time || '',
            description: camp.description || '',
            bloodGroupsNeeded: (camp.bloodGroupsNeeded || []).join(', '),
        });
        setShowForm(true);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            showFeedback('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                showFeedback('Coordinates captured!');
            },
            (error) => {
                showFeedback('Unable to retrieve location');
            }
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Tent size={24} className="text-emerald-600" /> Camp Management
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">{camps.length} camps on platform</p>
                </div>
                <button onClick={() => { setEditCamp(null); setForm({ name: '', organizer: '', location: '', lat: '', lng: '', date: '', time: '', description: '', bloodGroupsNeeded: '' }); setShowForm(true); }}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <Plus size={16} /> Create Camp
                </button>
            </div>

            {feedback && (
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-slate-400 animate-spin" /></div>
            ) : camps.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <Tent className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-lg font-black text-slate-300">No camps yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {camps.map(c => (
                        <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg">{c.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><MapPin size={10} />{c.location}</span>
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <Calendar size={10} />{c.date ? new Date(c.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'} @ {c.time || 'TBD'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            {c.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Users size={10} /> {c.registeredUsers?.length || 0} registered
                                </span>
                                {c.organizer && (
                                    <span className="text-[10px] font-bold text-slate-400">by {c.organizer || 'Admin'}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="bg-white w-full max-w-[500px] h-[90vh] flex flex-col rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-black text-slate-800">{editCamp ? 'Edit Camp' : 'Create Camp'}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                            {/* Standard Fields */}
                            {[
                                { key: 'name', label: 'Camp Name', type: 'text' },
                                { key: 'organizer', label: 'Organizer', type: 'text' },
                                { key: 'location', label: 'Address / Location', type: 'text' }
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">{f.label}</label>
                                    <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                            ))}

                            {/* Geo Fields */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Map Coordinates (Optional)</label>
                                    <button
                                        onClick={handleGetLocation}
                                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        Auto-Detect location
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <input type="number" step="any" placeholder="Latitude" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                                    </div>
                                    <div>
                                        <input type="number" step="any" placeholder="Longitude" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Time</label>
                                    <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none resize-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Blood Groups Needed (comma-separated)</label>
                                <input value={form.bloodGroupsNeeded} onChange={e => setForm({ ...form, bloodGroupsNeeded: e.target.value })}
                                    placeholder="A+, B-, O+"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                            <button onClick={handleSubmit} disabled={actionLoading}
                                className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                {actionLoading ? 'Saving...' : editCamp ? 'Update Camp' : 'Create Camp'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
