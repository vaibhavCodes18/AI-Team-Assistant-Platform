import { toast } from 'react-hot-toast';

const WorkspaceHeader = ({ workspaceName, workspaceDescription, onInviteClick, onViewLogsClick, currentUserRole }) => {
  const isOwnerOrAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

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
          onClick={onViewLogsClick}
          disabled={!isOwnerOrAdmin}
          className={`px-lg py-sm rounded-xl font-body-md font-semibold transition-all flex items-center gap-xs border ${
            isOwnerOrAdmin 
              ? 'border-outline-variant text-on-surface hover:bg-surface-container-high cursor-pointer' 
              : 'bg-surface-container border-outline-variant text-on-surface-variant cursor-not-allowed opacity-50'
          }`}
          title={isOwnerOrAdmin ? 'View Workspace activity logs' : 'Only Owners and Admins can view logs'}
        >
          {!isOwnerOrAdmin && <span className="material-symbols-outlined text-[18px]">lock</span>}
          View Logs
        </button>
        <button 
          onClick={onInviteClick}
          disabled={!isOwnerOrAdmin}
          className={`px-lg py-sm rounded-xl font-body-md font-semibold transition-all flex items-center gap-xs ${
            isOwnerOrAdmin 
              ? 'bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20 cursor-pointer' 
              : 'bg-surface-container border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-50'
          }`}
          title={isOwnerOrAdmin ? 'Invite new member' : 'Only Owners and Admins can invite members'}
        >
          {!isOwnerOrAdmin && <span className="material-symbols-outlined text-[18px]">lock</span>}
          Invite Member
        </button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
