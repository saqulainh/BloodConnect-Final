import React from 'react';

const BloodGroupLogo = ({ group, size = 'md' }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-xl',
    };

    return (
        <div className={`bg-red-600 text-white flex items-center justify-center font-black rounded-lg ${sizes[size]}`}>
            {group}
        </div>
    );
};

const BloodGroupSelector = ({ selected, onChange }) => {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {groups.map((group) => (
                <button
                    key={group}
                    type="button"
                    onClick={() => onChange(group)}
                    className={`w-14 h-14 rounded-2xl border-2 font-bold transition-all duration-200 ${selected === group
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 scale-105"
                        : "bg-slate-50 border-slate-50 text-slate-400 hover:border-red-200 hover:text-red-600"
                        }`}
                >
                    {group}
                </button>
            ))}
        </div>
    );
};

export { BloodGroupLogo, BloodGroupSelector };
