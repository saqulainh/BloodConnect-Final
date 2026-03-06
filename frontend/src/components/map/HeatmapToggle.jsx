import React from 'react';
import { Layers } from 'lucide-react';

const HeatmapToggle = ({ isHeatmap, onToggle }) => (
    <div className="absolute top-28 right-6 z-[1000] flex flex-col gap-2">
        <button
            onClick={onToggle}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-2xl border ${isHeatmap
                    ? 'bg-red-600 border-red-500 text-white shadow-red-900/40'
                    : 'bg-slate-900/80 backdrop-blur-md border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            title="Toggle Intel Heatmap"
        >
            <Layers size={20} />
        </button>
    </div>
);

export default HeatmapToggle;
