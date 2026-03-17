import React from 'react';
import ProximityFinder from '../dashboard/ProximityFinder';

// Receiver wrapper for ProximityFinder — reuses the same AI proximity search
// but from the receiver's perspective (looking for donors to fulfill their request)
const FindDonorsReceiver = ({ onStartChat }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-2xl p-5 border border-red-100">
                <h3 className="text-lg font-black text-red-800 mb-1">🔍 AI-Powered Donor Search</h3>
                <p className="text-sm text-red-600 font-medium">Find compatible blood donors near you using our intelligent proximity matching system.</p>
            </div>
            <ProximityFinder onStartChat={onStartChat} />
        </div>
    );
};

export default FindDonorsReceiver;
