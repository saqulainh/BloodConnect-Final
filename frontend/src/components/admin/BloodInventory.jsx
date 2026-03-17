import React, { useState, useEffect } from 'react';
import { Droplets, Edit, CheckCircle, Activity, Loader2 } from 'lucide-react';
import { getInventory, adminUpdateInventory } from '../../services/api';

export default function BloodInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editUnits, setEditUnits] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await getInventory();
            if (res?.success) setInventory(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const showFeedback = (msg) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(''), 3000);
    };

    const handleUpdate = async (id) => {
        if (editUnits === '' || parseInt(editUnits) < 0) {
            showFeedback('Invalid units');
            return;
        }

        setActionLoading(true);
        try {
            const res = await adminUpdateInventory(id, parseInt(editUnits));
            if (res?.success) {
                showFeedback('Inventory updated successfully');
                setEditingId(null);
                setEditUnits('');
                fetchInventory(); // Refresh data
            }
        } catch (error) {
            showFeedback('Update failed');
        } finally {
            setActionLoading(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setEditUnits(item.units.toString());
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>;
    }

    const totalUnits = inventory.reduce((acc, curr) => acc + curr.units, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Droplets size={24} className="text-red-500" /> Blood Inventory
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Manage central blood supply records</p>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-3">
                    <Activity size={18} className="text-red-500" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-red-400">Total Units Available</p>
                        <p className="text-lg font-black text-red-700 leading-tight">{totalUnits} Units</p>
                    </div>
                </div>
            </div>

            {feedback && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 flex items-center gap-2">
                    <CheckCircle size={16} /> {feedback}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {inventory.map((item) => (
                    <div key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Droplets size={80} className="text-red-500" />
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-sm">
                                {item.bloodGroup}
                            </div>
                            {editingId !== item._id && (
                                <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={14} />
                                </button>
                            )}
                        </div>

                        {editingId === item._id ? (
                            <div className="mt-4 space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400">Update Units</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={editUnits}
                                        onChange={(e) => setEditUnits(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                    />
                                    <button
                                        onClick={() => handleUpdate(item._id)}
                                        disabled={actionLoading}
                                        className="bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <p className="text-3xl font-black text-slate-800">{item.units}</p>
                                <p className="text-xs font-bold text-slate-400">Available Units</p>
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium">
                                Last updated: {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
