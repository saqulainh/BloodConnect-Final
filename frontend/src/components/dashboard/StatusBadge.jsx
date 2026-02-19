import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        'Critical': 'bg-red-100 text-red-700 border-red-200',
        'Urgent': 'bg-orange-100 text-orange-700 border-orange-200',
        'Normal': 'bg-blue-100 text-blue-700 border-blue-200',
        'Active': 'bg-green-100 text-green-700 border-green-200',
        'Inactive': 'bg-slate-100 text-slate-600 border-slate-200',
        'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    };
    const defaultStyle = 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || defaultStyle}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
