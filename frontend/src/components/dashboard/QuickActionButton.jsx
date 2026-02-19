import React from 'react';

const QuickActionButton = ({ icon: Icon, label, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl border ${colorClass} shadow-sm hover:shadow-md transition-all duration-200`}
    >
        <Icon size={24} className="mb-2" />
        <span className="text-xs font-bold">{label}</span>
    </button>
);

export default QuickActionButton;
