import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterDrawer = ({ onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState('All');

    const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-28 left-6 z-[1000] w-12 h-12 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-2xl"
            >
                <Filter size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="absolute top-0 left-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-2xl border-r border-white/5 z-[1100] p-6 shadow-2xl shadow-black"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Map Filters</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Blood Group Priority</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {bloodGroups.map(bg => (
                                        <button
                                            key={bg}
                                            onClick={() => {
                                                setActiveGroup(bg);
                                                onFilterChange && onFilterChange({ bloodGroup: bg });
                                            }}
                                            className={`py-2 rounded-xl text-xs font-black border transition-all ${activeGroup === bg
                                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50'
                                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {bg}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-slate-800 hover:bg-red-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Apply Intel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FilterDrawer;
