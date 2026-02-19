import React from 'react';

const ComingSoon = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
            <Icon size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-400 font-medium max-w-sm">This module is part of the roadmap and will be available in the next update.</p>
        <button className="mt-6 px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 transition-colors">
            Notify Me
        </button>
    </div>
);

export default ComingSoon;
