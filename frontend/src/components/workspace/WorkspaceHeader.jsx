import { toast } from 'react-hot-toast';

const WorkspaceHeader = ({ workspaceName, workspaceDescription, onInviteClick }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-lg text-left">
      <div className="space-y-sm">
        <div className="flex items-center gap-sm text-primary">
          <span className="material-symbols-outlined text-[18px]">hub</span>
          <span className="font-label-sm text-label-sm tracking-[0.1em] uppercase">Core Unit</span>
        </div>
        <h1 className="font-display text-[32px] md:text-[40px] text-on-surface tracking-tight font-black">
          {workspaceName}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          {workspaceDescription || (
            <span className="italic">No description provided. You can add one below in settings.</span>
          )}
        </p>
      </div>
      <div className="flex gap-md pb-xs">
        <button 
          onClick={() => toast.success('Logs are up-to-date')}
          className="px-lg py-sm border border-outline-variant rounded-xl font-body-md font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          View Logs
        </button>
        <button 
          onClick={onInviteClick}
          className="px-lg py-sm bg-primary text-on-primary rounded-xl font-body-md font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          Invite Member
        </button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
