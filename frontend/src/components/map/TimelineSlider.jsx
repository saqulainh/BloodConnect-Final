import React from 'react';
import { format } from 'date-fns';

const TimelineSlider = ({ minTime, maxTime, currentTime, onChange }) => {
    if (!minTime || !maxTime || minTime === maxTime) return null;

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-2xl">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">History Playback</span>
                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                        {format(currentTime, 'MMM d, HH:mm')}
                    </span>
                </div>
                <input
                    type="range"
                    min={minTime}
                    max={maxTime}
                    value={currentTime}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full accent-red-600 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 px-1 text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                    <span>-24 Hours</span>
                    <span>Recent</span>
                </div>
            </div>
        </div>
    );
};

export default TimelineSlider;
