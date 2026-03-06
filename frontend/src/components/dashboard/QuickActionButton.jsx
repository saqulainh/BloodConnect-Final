import React from 'react';

const QuickActionButton = ({ icon: Icon, label, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-500 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 ${colorClass}`}
    >
        <Icon size={24} className="mb-2" />
        <span className="text-xs font-bold">{label}</span>
    </button>
);

export default QuickActionButton;
