import { toast } from 'react-hot-toast';

const RecentProjects = ({ projects, workspaceMembers, onNewProjectClick, isOwnerOrAdmin }) => {
  // Use splice to extract the top 4 projects (after copying to avoid mutating state directly)
  const displayProjects = [...projects].splice(0, 4);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-label-sm">
            Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-label-sm">
            Completed
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-label-sm">
            On Hold
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-outline-variant/30 text-outline text-xs font-label-sm">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-xs font-label-sm">
            {status}
          </span>
        );
    }
  };

  const getProgressWidth = (project) => {
    if (project.status === 'COMPLETED') return 'w-full';
    if (project.status === 'ON_HOLD') return 'w-1/4';
    if (project.status === 'ARCHIVED') return 'w-[10%]';
    // For ACTIVE, generate a pseudo-random stable width based on the ID
    const percent = ((project.id * 17) % 50) + 40; // between 40% and 90%
    return `w-[${percent}%]`;
  };

  // Helper because Tailwind arbitrary width class w-[x%] needs to be written explicitly or via style attribute
  const getProgressStyle = (project) => {
    if (project.status === 'COMPLETED') return { width: '100%' };
    if (project.status === 'ON_HOLD') return { width: '25%' };
    if (project.status === 'ARCHIVED') return { width: '10%' };
    const percent = ((project.id * 17) % 50) + 40;
    return { width: `${percent}%` };
  };

  const getProgressColorClass = (status) => {
    if (status === 'COMPLETED') return 'bg-secondary';
    if (status === 'ON_HOLD') return 'bg-tertiary';
    if (status === 'ARCHIVED') return 'bg-outline';
    return 'bg-primary';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleProjectClick = (project) => {
    toast.success(`Selected project: ${project.name}`);
  };

  return (
    <section className="space-y-lg text-left">
      <div className="flex justify-between items-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">Recent Projects</h2>
        <div className="flex gap-md items-center">
          {isOwnerOrAdmin && (
            <button 
              onClick={onNewProjectClick}
              className="px-md py-sm bg-primary text-on-primary rounded-lg font-body-md text-xs font-semibold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/10"
            >
              New Project
            </button>
          )}
          <button 
            onClick={() => toast.success('View all projects coming soon!')}
            className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer"
          >
            View All Projects
          </button>
        </div>
      </div>

      {displayProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {displayProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="glass-card p-lg rounded-lg hover:bg-surface-container-high transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-md">
                <h3 className="font-body-lg font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                {getStatusBadge(project.status)}
              </div>

              {project.description && (
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-md h-8">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between mb-md">
                <div className="flex -space-x-2">
                  {workspaceMembers && workspaceMembers.length > 0 ? (
                    workspaceMembers.slice(0, 3).map((member, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest overflow-hidden flex items-center justify-center font-bold text-[9px] text-on-primary-container"
                        title={member.user.name}
                      >
                        {member.user.profileImage ? (
                          <img
                            alt={member.user.name}
                            className="w-full h-full object-cover"
                            src={member.user.profileImage}
                          />
                        ) : (
                          getInitials(member.user.name)
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center font-bold text-[9px]">
                      U
                    </div>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">
                  {formatTimeAgo(project.updatedAt || project.createdAt)}
                </span>
              </div>

              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div
                  className={`${getProgressColorClass(project.status)} h-full transition-all duration-500`}
                  style={getProgressStyle(project)}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-xl rounded-xl text-center space-y-md">
          <p className="text-on-surface-variant italic">No projects created yet in this workspace.</p>
          {isOwnerOrAdmin && (
            <button
              onClick={onNewProjectClick}
              className="px-lg py-sm bg-primary/10 text-primary border border-primary/20 rounded-xl font-semibold hover:bg-primary/20 transition-all text-sm cursor-pointer"
            >
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default RecentProjects;
