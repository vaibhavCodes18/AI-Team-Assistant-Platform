import { useState, useEffect } from 'react';
import { getWorkspaceRecentActivities } from '../../api/workspaceApi';
import { toast } from 'react-hot-toast';

const SystemActivity = ({ workspaceId, workspaceMembers, onViewLogsClick, currentUserRole, refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isOwnerOrAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const fetchRecentActivities = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getWorkspaceRecentActivities(workspaceId);
      if (res?.data) {
        setActivities(res.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error loading recent activities:', err);
      setError('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, [workspaceId, refreshTrigger]);

  const getUserDetails = (userId) => {
    const member = workspaceMembers?.find((m) => m.user.id === userId);
    if (member) {
      return {
        name: member.user.name,
        profileImage: member.user.profileImage,
        email: member.user.email,
      };
    }
    return {
      name: `User #${userId}`,
      profileImage: null,
      email: '',
    };
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  const getEntityConfig = (entityType) => {
    switch (entityType?.toUpperCase()) {
      case 'WORKSPACE':
        return {
          icon: 'hub',
          borderClass: 'border-purple-500/20 text-purple-400',
        };
      case 'PROJECT':
        return {
          icon: 'folder',
          borderClass: 'border-blue-500/20 text-blue-400',
        };
      case 'TASK':
        return {
          icon: 'assignment',
          borderClass: 'border-cyan-500/20 text-cyan-400',
        };
      case 'TICKET':
        return {
          icon: 'confirmation_number',
          borderClass: 'border-amber-500/20 text-amber-400',
        };
      case 'DOCUMENT':
        return {
          icon: 'description',
          borderClass: 'border-emerald-500/20 text-emerald-400',
        };
      case 'USER':
        return {
          icon: 'person',
          borderClass: 'border-indigo-500/20 text-indigo-400',
        };
      case 'AI_REQUEST':
        return {
          icon: 'psychology',
          borderClass: 'border-pink-500/20 text-pink-400',
        };
      default:
        return {
          icon: 'info',
          borderClass: 'border-on-surface-variant/20 text-on-surface-variant',
        };
    }
  };

  const getActionLabel = (action) => {
    if (!action) return '';
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="col-span-12 lg:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col h-[400px] border border-outline-variant bg-surface-container/10">
      {/* Header */}
      <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px] text-primary">history</span>
          Recent Activity
        </h2>
        {isOwnerOrAdmin && (
          <button 
            onClick={onViewLogsClick}
            className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-xs"
            title="View full workspace audit trail"
          >
            <span className="material-symbols-outlined text-[16px]">history_toggle_off</span>
            View All Logs
          </button>
        )}
      </div>

      {/* Activity Timeline List */}
      <div className="p-lg flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-sm">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-on-surface-variant">Loading workspace timeline...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-xs p-md">
            <span className="material-symbols-outlined text-error text-[36px]">error</span>
            <p className="text-on-surface text-body-md font-semibold">{error}</p>
            <button
              onClick={fetchRecentActivities}
              className="mt-xs text-xs text-primary underline font-semibold"
            >
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-xs">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[40px]">history_toggle_off</span>
            <p className="text-on-surface font-semibold text-body-md">No recent activity</p>
            <p className="text-on-surface-variant text-xs max-w-xs">Actions taken inside this workspace will show up here.</p>
          </div>
        ) : (
          <div className="space-y-lg relative before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-[1px] before:bg-outline-variant">
            {activities.map((activity) => {
              const user = getUserDetails(activity.userId);
              const entityConf = getEntityConfig(activity.entityType);

              return (
                <div key={activity.id} className="flex gap-md relative group text-left">
                  {/* Left Icon Dot */}
                  <div 
                    className={`w-8 h-8 rounded-full border ${entityConf.borderClass} flex items-center justify-center shrink-0 bg-surface-container-low z-10`}
                    title={activity.entityType}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {entityConf.icon}
                    </span>
                  </div>

                  {/* Activity Details */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-on-surface text-body-md leading-snug">
                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors cursor-help" title={user.email}>
                        {user.name}
                      </span>{' '}
                      <span className="text-on-surface-variant">
                        {activity.metadata || getActionLabel(activity.action)}
                      </span>
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 flex items-center gap-xs">
                      <span>{getRelativeTime(activity.createdAt)}</span>
                      {activity.entityId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px]">ID: #{activity.entityId}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemActivity;
