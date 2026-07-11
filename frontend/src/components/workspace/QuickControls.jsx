import { useState } from 'react';

const QuickControls = () => {
  const [visibilityPublic, setVisibilityPublic] = useState(true);
  const [aiInsightsActive, setAiInsightsActive] = useState(true);

  return (
    <div className="col-span-12 lg:col-span-4 glass-card p-lg rounded-xl flex flex-col justify-between min-h-[400px]">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Quick Controls</h2>
        <div className="space-y-md">
          <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <span className="font-body-md">Visibility: {visibilityPublic ? 'Public' : 'Private'}</span>
            </div>
            <button 
              onClick={() => setVisibilityPublic(!visibilityPublic)}
              className={`w-10 h-6 rounded-full relative transition-all ${visibilityPublic ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${visibilityPublic ? 'left-[18px]' : 'left-[2px]'}`}></span>
            </button>
          </div>
          <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">history</span>
              <span className="font-body-md">Retention: 30 Days</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_right</span>
          </div>
          <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-tertiary">smart_toy</span>
              <span className="font-body-md">AI Insights: {aiInsightsActive ? 'Active' : 'Disabled'}</span>
            </div>
            <button 
              onClick={() => setAiInsightsActive(!aiInsightsActive)}
              className={`w-10 h-6 rounded-full relative transition-all ${aiInsightsActive ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${aiInsightsActive ? 'left-[18px]' : 'left-[2px]'}`}></span>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-md p-md rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-sm mb-xs">
          <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
          <span className="font-label-sm text-primary uppercase font-bold">Optimization Suggestion</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Three projects in this workspace haven't been accessed in 14 days. Consider archiving them to reduce surface clutter.
        </p>
      </div>
    </div>
  );
};

export default QuickControls;
