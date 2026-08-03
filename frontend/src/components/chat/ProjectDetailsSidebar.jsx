// import React from 'react';

/**
 * Single Right Sidebar component rendering only Project Details from API response:
 * { id, workspaceId, name, description, status, createdById, startDate, deadline, createdAt, updatedAt }
 */
const ProjectDetailsSidebar = ({ project }) => {
  // Default project data matching the backend response structure:
  const projectData = project || {
    id: 12,
    workspaceId: 1,
    name: "Websocket connection",
    description: "This is a websocket conn",
    status: "ACTIVE",
    createdById: 1,
    startDate: "2026-08-01",
    deadline: "2026-12-30",
    createdAt: "2026-08-01T00:05:02.070785",
    updatedAt: "2026-08-01T00:05:02.070785"
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ON_HOLD':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ARCHIVED':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-primary-container/20 text-primary border-primary-container/30';
    }
  };

  return (
    <aside className="w-80 bg-surface-container-low border-l border-outline-variant overflow-y-auto hidden xl:block custom-scrollbar shrink-0">
      <div className="p-6 space-y-6 text-left">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">folder</span>
            <h4 className="text-label-sm font-label-sm text-outline uppercase tracking-wider">
              Project Details
            </h4>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border uppercase ${getStatusBadge(projectData.status)}`}>
            {projectData.status || 'ACTIVE'}
          </span>
        </div>

        {/* Project Name & Description */}
        <div className="space-y-2">
          <h3 className="font-headline-md font-extrabold text-on-surface text-lg leading-snug">
            {projectData.name || 'Websocket connection'}
          </h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed text-xs">
            {projectData.description || 'No description provided for this project.'}
          </p>
        </div>

        {/* Project Information Fields */}
        <div className="pt-4 border-t border-outline-variant space-y-4">
          <h5 className="text-[11px] font-label-sm text-outline uppercase tracking-wider">
            Information
          </h5>

          <div className="space-y-3.5 text-xs">
            {/* Project ID */}
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Project ID</span>
              <span className="font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                #{projectData.id}
              </span>
            </div>

            {/* Workspace ID */}
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Workspace ID</span>
              <span className="font-mono text-on-surface font-semibold">
                #{projectData.workspaceId}
              </span>
            </div>

            {/* Created By ID */}
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Created By</span>
              <div className="flex items-center gap-1.5 text-on-surface font-medium">
                <span className="material-symbols-outlined text-[16px] text-outline">person</span>
                <span>User #{projectData.createdById}</span>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Start Date</span>
              <div className="flex items-center gap-1.5 text-on-surface font-medium">
                <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                <span>{formatDate(projectData.startDate)}</span>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Deadline</span>
              <div className="flex items-center gap-1.5 text-tertiary font-semibold">
                <span className="material-symbols-outlined text-[16px]">event_available</span>
                <span>{formatDate(projectData.deadline)}</span>
              </div>
            </div>

            {/* Created At */}
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Created At</span>
              <span className="text-outline font-medium text-[11px]">
                {formatDateTime(projectData.createdAt)}
              </span>
            </div>

            {/* Updated At */}
            <div className="flex justify-between items-center py-1">
              <span className="text-on-surface-variant">Last Updated</span>
              <span className="text-outline font-medium text-[11px]">
                {formatDateTime(projectData.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProjectDetailsSidebar;
