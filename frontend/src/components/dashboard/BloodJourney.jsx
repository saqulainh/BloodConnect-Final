import React from 'react';
import { CheckCircle, FlaskConical, Truck, Heart, Clock } from 'lucide-react';

const STAGES = [
    { id: 'Donated', icon: CheckCircle, label: 'Donated', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'Processing', icon: Clock, label: 'Processing', color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'Tested', icon: FlaskConical, label: 'Tested & Safe', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'Transferred', icon: Truck, label: 'Transferred', color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'Life Saved', icon: Heart, label: 'Life Saved', color: 'text-red-500', bg: 'bg-red-50' },
];

export default function BloodJourney({ journey = [], currentStage = 'Donated' }) {
    const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);

    return (
        <div className="py-6 px-4">
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

                <div className="space-y-8">
                    {STAGES.map((stage, index) => {
                        const isCompleted = index <= currentStageIndex;
                        const journeyEntry = journey.find(j => j.stage === stage.id);
                        const Icon = stage.icon;

                        return (
                            <div key={stage.id} className="relative flex items-start gap-4">
                                {/* Icon Node */}
                                <div className={`z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isCompleted
                                        ? `${stage.bg} border-${stage.color.split('-')[1]}-200 ${stage.color}`
                                        : 'bg-white border-slate-100 text-slate-300'
                                    } shadow-sm`}>
                                    <Icon size={14} className={isCompleted ? 'animate-in zoom-in duration-300' : ''} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-0.5">
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>
                                        {stage.label}
                                    </h4>
                                    {isCompleted && journeyEntry && (
                                        <div className="mt-1 animate-in fade-in slide-in-from-left-2 duration-500">
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                {journeyEntry.message || `Your donation has successfully reached the ${stage.label} stage.`}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                                                {new Date(journeyEntry.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}
                                    {!isCompleted && (
                                        <p className="text-[10px] font-bold text-slate-300 mt-1 italic">Waiting for next step...</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-[11px] font-bold text-red-600 leading-relaxed flex items-start gap-2">
                    <Heart size={14} className="shrink-0 mt-0.5" />
                    <span>Every drop of your blood is being handled with care. We'll notify you as soon as it saves a life!</span>
                </p>
            </div>
        </div>
    );
}
