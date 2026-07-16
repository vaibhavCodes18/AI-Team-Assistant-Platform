const StatsBentoGrid = ({ memberCount, projectCount }) => {
  return (
    <>
      {/* Main Stat 1: Members */}
      <div className="col-span-12 md:col-span-4 glass-card p-xl rounded-xl group hover:border-primary/45 transition-all duration-300">
        <div className="flex justify-between items-start mb-lg">
          <div className="p-sm bg-secondary-container rounded-lg">
            <span className="material-symbols-outlined text-on-secondary-container">groups</span>
          </div>
          <span className="text-xs font-label-sm text-primary">+1 this week</span>
        </div>
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">Total Members</h3>
        <div className="flex items-baseline gap-sm">
          <span className="font-display text-[32px] font-black text-on-surface">{memberCount}</span>
          <span className="text-on-surface-variant opacity-60">Engineers</span>
        </div>
      </div>

      {/* Main Stat 2: Projects */}
      <div className="col-span-12 md:col-span-4 glass-card p-xl rounded-xl group hover:border-primary/45 transition-all duration-300">
        <div className="flex justify-between items-start mb-lg">
          <div className="p-sm bg-primary-container rounded-lg">
            <span className="material-symbols-outlined text-on-primary-container">folder_zip</span>
          </div>
          <span className="text-xs font-label-sm text-tertiary">Nominal</span>
        </div>
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">Active Projects</h3>
        <div className="flex items-baseline gap-sm">
          <span className="font-display text-[32px] font-black text-on-surface">{projectCount}</span>
          <span className="text-on-surface-variant opacity-60">Repositories</span>
        </div>
      </div>

      {/* Main Stat 3: Performance/Documents */}
      <div className="col-span-12 md:col-span-4 glass-card p-xl rounded-xl group hover:border-primary/45 transition-all duration-300">
        <div className="flex justify-between items-start mb-lg">
          <div className="p-sm bg-tertiary-container rounded-lg">
            <span className="material-symbols-outlined text-on-tertiary-container">monitoring</span>
          </div>
          <span className="text-xs font-label-sm text-on-tertiary-container">99.9% Uptime</span>
        </div>
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">System Health</h3>
        <div className="flex items-baseline gap-sm">
          <span className="font-display text-[32px] font-black text-on-surface flex items-center gap-sm">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Nominal
          </span>
        </div>
      </div>
    </>
  );
};

export default StatsBentoGrid;
