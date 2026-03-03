import React, { useState, useEffect } from 'react';
import { CheckCircle, FlaskConical, Truck, Heart, Clock, Plus, X, Droplets } from 'lucide-react';
import { getMyDonations, addDonation } from '../../services/api';

const STAGES = [
    { id: 'Donated', icon: CheckCircle, label: 'Donated', color: 'emerald' },
    { id: 'Processing', icon: Clock, label: 'Processing', color: 'amber' },
    { id: 'Tested', icon: FlaskConical, label: 'Tested & Safe', color: 'blue' },
    { id: 'Transferred', icon: Truck, label: 'Transferred', color: 'purple' },
    { id: 'Life Saved', icon: Heart, label: 'Life Saved', color: 'red' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

function StageTimeline({ journey = [], currentStage = 'Donated' }) {
    const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);

    return (
        <div className="py-4 px-2 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100" />
            <div className="space-y-6">
                {STAGES.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    const journeyEntry = journey.find(j => j.stage === stage.id);
                    const Icon = stage.icon;
                    const colors = colorMap[stage.color];

                    return (
                        <div key={stage.id} className="relative flex items-start gap-4">
                            <div className={`z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm transition-all duration-500 ${isCompleted
                                    ? `${colors.bg} ${colors.border} ${colors.text}`
                                    : 'bg-white border-slate-100 text-slate-300'
                                }`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 pt-1.5 min-w-0">
                                <h4 className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>
                                    {stage.label}
                                </h4>
                                {isCompleted && journeyEntry && (
                                    <div className="mt-1">
                                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{journeyEntry.message}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                            {new Date(journeyEntry.timestamp).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                )}
                                {!isCompleted && (
                                    <p className="text-[10px] font-bold text-slate-300 mt-0.5 italic">Pending...</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AddDonationModal({ onClose, onSave }) {
    const [form, setForm] = useState({ patientName: '', hospital: '', bloodGroup: 'O+', units: 1, date: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await addDonation(form);
            onSave();
        } catch (err) {
            setError(err.message || 'Failed to log donation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black">Log Past Donation</h3>
                            <p className="text-red-200 text-sm mt-0.5">Record a blood donation you've made</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-bold">{error}</div>
                    )}
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Patient Name</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                            value={form.patientName}
                            onChange={e => setForm({ ...form, patientName: e.target.value })}
                            placeholder="Patient's name"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Hospital Name</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                            value={form.hospital}
                            onChange={e => setForm({ ...form, hospital: e.target.value })}
                            placeholder="Hospital / Blood Bank"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Blood Group</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                value={form.bloodGroup}
                                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                            >
                                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Units Donated</label>
                            <input
                                type="number" min="1" max="5"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                value={form.units}
                                onChange={e => setForm({ ...form, units: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Donation Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Log Donation'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function BloodJourney() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const res = await getMyDonations();
            if (res?.success) {
                const records = res.data?.records || [];
                setDonations(records);
                if (records.length > 0 && !selectedDonation) {
                    setSelectedDonation(records[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load donations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDonations(); }, []);

    const handleSaved = () => {
        setShowAddModal(false);
        fetchDonations();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Blood Journey</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Track the journey of your blood donation from donation to life saved.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-black rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                    <Plus size={16} /> Log Donation
                </button>
            </div>

            {donations.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Droplets size={28} className="text-red-400" />
                    </div>
                    <h3 className="text-lg font-black text-slate-700 mb-2">No Donations Yet</h3>
                    <p className="text-sm text-slate-400 font-medium mb-6 max-w-xs mx-auto">Log your first blood donation to start tracking its life-saving journey.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        + Log First Donation
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Donation List */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-50">
                            <h3 className="font-black text-slate-800">Your Donations</h3>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">{donations.length} record{donations.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
                            {donations.map((d) => (
                                <button
                                    key={d._id}
                                    onClick={() => setSelectedDonation(d)}
                                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedDonation?._id === d._id ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xs font-black text-red-600 shrink-0">
                                            {d.bloodGroup}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-black text-slate-800 truncate">{d.patientName || 'Unknown Patient'}</p>
                                            <p className="text-xs text-slate-400 font-bold truncate">{d.hospital}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                {new Date(d.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${d.currentStage === 'Life Saved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {d.currentStage === 'Life Saved' ? '✓ Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Journey Timeline */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        {selectedDonation ? (
                            <>
                                <div className="p-6 border-b border-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-sm font-black text-red-600">
                                            {selectedDonation.bloodGroup}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800">{selectedDonation.patientName || 'Unknown Patient'}</h3>
                                            <p className="text-sm text-slate-500">{selectedDonation.hospital} • {selectedDonation.units} unit{selectedDonation.units !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <StageTimeline
                                        journey={selectedDonation.journey || [{ stage: 'Donated', timestamp: selectedDonation.date, message: `Donation of ${selectedDonation.units} unit(s) recorded at ${selectedDonation.hospital}.` }]}
                                        currentStage={selectedDonation.currentStage || 'Donated'}
                                    />
                                </div>
                                <div className="mx-6 mb-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-xs font-bold text-red-600 leading-relaxed flex items-start gap-2">
                                        <Heart size={14} className="shrink-0 mt-0.5" />
                                        <span>Every drop of your blood is being handled with care. We'll update you as it saves a life!</span>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full p-12 text-center">
                                <div>
                                    <Heart size={32} className="text-slate-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-400">Select a donation to view its journey</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAddModal && <AddDonationModal onClose={() => setShowAddModal(false)} onSave={handleSaved} />}
        </div>
    );
}
