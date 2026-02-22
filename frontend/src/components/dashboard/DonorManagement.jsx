import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    MessageSquare,
    Phone,
    X,
    MapPin,
    Maximize2
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { BloodGroupLogo } from '../ui/BloodGroup';
import { getDonors } from '../../services/api';

const DonorDetailsModal = ({ donor, onClose, onStartChat }) => {
    if (!donor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        Donor Profile
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        {donor.profilePicture ? (
                            <img src={donor.profilePicture} alt={donor.name} className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl font-black">
                                {donor.name ? donor.name.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        <div>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{donor.name}</h4>
                            <StatusBadge status={donor.availability ? "Active" : "Unavailable"} />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                            <BloodGroupLogo group={donor.bloodGroup || '?'} size="sm" />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</p>
                            <p className="font-bold text-slate-700 flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                                <MapPin size={16} className="text-red-500" /> {donor.address || 'Location unknown'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</p>
                            <p className="font-bold text-slate-700 flex items-center gap-2 border border-slate-200 bg-white p-3 rounded-xl">
                                <Phone size={16} className="text-slate-400" /> {donor.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex gap-3">
                        <button
                            onClick={() => { onClose(); onStartChat && onStartChat(donor); }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                        >
                            <MessageSquare size={18} /> Message Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DonorManagement = ({ onStartChat }) => {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingDonor, setViewingDonor] = useState(null);

    useEffect(() => {
        const fetchAllDonors = async () => {
            try {
                const res = await getDonors();
                if (res && res.success) {
                    setDonors(res.data);
                }
            } catch (error) {
                console.error("Failed to load donors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllDonors();
    }, []);

    const filteredDonors = donors.filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search donors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none"
                    />
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                        <Filter size={16} /> Filter
                    </button>
                    <button
                        onClick={() => alert("To onboard a new donor securely into BloodConnect, please direct them to the public Registration page for OTP and Aadhaar verification.")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors"
                    >
                        <Plus size={16} /> Add Donor
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Donor Name</th>
                                <th className="px-6 py-4">Blood Group</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Joined On</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">Loading donors...</td>
                                </tr>
                            ) : filteredDonors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">No donors found.</td>
                                </tr>
                            ) : (
                                filteredDonors.map((d) => (
                                    <tr key={d._id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setViewingDonor(d)}>
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            <div className="flex items-center gap-3">
                                                {d.profilePicture ? (
                                                    <img src={d.profilePicture} alt={d.name} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                        {d.name ? d.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                {d.name}
                                                <Maximize2 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <BloodGroupLogo group={d.bloodGroup || '...'} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium text-xs max-w-[150px] truncate" title={d.address}>
                                            {d.address || 'Unknown Region'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {new Date(d.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={d.availability ? "Active" : "Unavailable"} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onStartChat && onStartChat(d); }}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors border border-red-100 inline-flex"
                                                title="Message Donor"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Card View (Hidden on Desktop) */}
                <div className="md:hidden divide-y divide-slate-100">
                    {!loading && filteredDonors.map((d) => (
                        <div key={d._id} className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors" onClick={() => setViewingDonor(d)}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold">
                                    {d.bloodGroup}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-1">
                                        {d.name}
                                        <Maximize2 size={10} className="text-slate-400" />
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium truncate w-32">{d.address || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onStartChat && onStartChat(d); }}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                    title="Message"
                                >
                                    <MessageSquare size={16} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); }} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors" title={d.phone}>
                                    <Phone size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {viewingDonor && (
                <DonorDetailsModal
                    donor={viewingDonor}
                    onClose={() => setViewingDonor(null)}
                    onStartChat={onStartChat}
                />
            )}
        </div>
    );
};

export default DonorManagement;
