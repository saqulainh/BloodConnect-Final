import React, { useState } from 'react';
import {
    MapPin,
    ChevronRight,
    X,
    AlertCircle,
    Loader2
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { BloodGroupLogo, BloodGroupSelector } from '../ui/BloodGroup';
import { bloodRequests } from '../../data/dashboardData';
import { createBloodRequest, getCurrentLocation } from '../../services/api';

const RequestBloodForm = ({ onClose }) => {
    const [form, setForm] = useState({
        patientName: '',
        age: '',
        bloodGroup: '',
        hospitalName: '',
        units: 1,
        urgency: 'Normal',
        contactNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bloodGroup) { setError("Please select a blood group"); return; }

        setLoading(true);
        setError('');
        try {
            const loc = await getCurrentLocation().catch(() => ({ lat: 0, lng: 0 }));
            await createBloodRequest({
                ...form,
                hospital: form.hospitalName,
                lat: loc.lat,
                lng: loc.lng
            });
            alert("Request created successfully!");
            onClose();
        } catch (err) {
            setError(err.message || "Failed to create request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <AlertCircle className="text-red-600" /> New Blood Request
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Group Required</label>
                        <BloodGroupSelector selected={form.bloodGroup} onChange={(g) => setForm({ ...form, bloodGroup: g })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Patient Name</label>
                            <input type="text" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Age</label>
                            <input type="number" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Hospital Name</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input type="text" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 pl-10 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Units Required</label>
                            <input type="number" min="1" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Urgency</label>
                            <select className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                                <option>Normal</option>
                                <option>Urgent</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RequestManagement = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg">Active Requests</h2>
                <button onClick={() => setIsFormOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors">
                    New Request
                </button>
            </div>

            <div className="space-y-3">
                {bloodRequests.map((req) => (
                    <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:shadow-md border-l-4 border-l-red-500">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <BloodGroupLogo group={req.group} size="md" />
                            <div>
                                <h4 className="font-bold text-slate-800">{req.patient}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                                    <MapPin size={12} /> {req.hospital}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Urgency</p>
                                <p className={`text-sm font-bold ${req.urgency === 'Critical' ? 'text-red-600' : 'text-slate-700'}`}>{req.urgency}</p>
                            </div>
                            <div>
                                <StatusBadge status={req.status} />
                            </div>
                            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && <RequestBloodForm onClose={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default RequestManagement;
