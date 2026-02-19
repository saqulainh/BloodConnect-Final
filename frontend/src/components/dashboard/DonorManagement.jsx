import React from 'react';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Phone
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { BloodGroupLogo } from '../ui/BloodGroup';
import { donors } from '../../data/dashboardData';

const DonorManagement = () => (
    <div className="space-y-4">
        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search donors..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-100 outline-none" />
            </div>
            <div className="flex w-full md:w-auto gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                    <Filter size={16} /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors">
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
                            <th className="px-6 py-4">Last Donation</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {donors.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">{d.name.charAt(0)}</div>
                                        {d.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <BloodGroupLogo group={d.group} size="sm" />
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-medium">{d.location}</td>
                                <td className="px-6 py-4 text-slate-500 font-medium">{d.lastDonation}</td>
                                <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Mobile Card View (Hidden on Desktop) */}
            <div className="md:hidden divide-y divide-slate-100">
                {donors.map((d) => (
                    <div key={d.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold">{d.group}</div>
                            <div>
                                <h4 className="font-bold text-slate-800">{d.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">{d.location}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-green-50 text-green-600 rounded-full"><Phone size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default DonorManagement;
