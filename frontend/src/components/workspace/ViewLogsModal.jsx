import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getWorkspaceActivityLogs } from '../../api/workspaceApi';
import { toast } from 'react-hot-toast';

const ViewLogsModal = ({ isOpen, onClose, workspaceId, workspaceMembers }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');

  useEffect(() => {
    if (isOpen && workspaceId) {
      fetchLogs();
    }
  }, [isOpen, workspaceId]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWorkspaceActivityLogs(workspaceId);
      if (res?.data) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      const errorMsg = err.response?.data?.message || 'Failed to fetch activity logs';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Resolve user info from workspace members
  const getUserDetails = (userId) => {
    const member = workspaceMembers?.find((m) => m.user.id === userId);
    if (member) {
      return {
        name: member.user.name,
        email: member.user.email,
        profileImage: member.user.profileImage,
        role: member.role,
      };
    }
    return {
      name: `User #${userId}`,
      email: 'Deleted or external user',
      profileImage: null,
      role: 'UNKNOWN',
    };
  };

  // Format date/time
  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Get visual config for each entity type
  const getEntityConfig = (entityType) => {
    switch (entityType?.toUpperCase()) {
      case 'WORKSPACE':
        return {
          icon: 'hub',
          colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          badgeText: 'Workspace',
        };
      case 'PROJECT':
        return {
          icon: 'folder',
          colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          badgeText: 'Project',
        };
      case 'TASK':
        return {
          icon: 'assignment',
          colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          badgeText: 'Task',
        };
      case 'TICKET':
        return {
          icon: 'confirmation_number',
          colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          badgeText: 'Ticket',
        };
      case 'DOCUMENT':
        return {
          icon: 'description',
          colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          badgeText: 'Document',
        };
      case 'USER':
        return {
          icon: 'person',
          colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          badgeText: 'User',
        };
      case 'AI_REQUEST':
        return {
          icon: 'psychology',
          colorClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          badgeText: 'AI Helper',
        };
      default:
        return {
          icon: 'info',
          colorClass: 'bg-on-surface-variant/10 text-on-surface-variant border-outline-variant',
          badgeText: entityType || 'System',
        };
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Filter by entity type
    if (selectedEntity !== 'ALL' && log.entityType?.toUpperCase() !== selectedEntity) {
      return false;
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const userDetails = getUserDetails(log.userId);
      const actionMatch = log.action?.toLowerCase().includes(term);
      const entityMatch = log.entityType?.toLowerCase().includes(term);
      const metaMatch = log.metadata?.toLowerCase().includes(term);
      const userMatch = userDetails.name.toLowerCase().includes(term) || userDetails.email.toLowerCase().includes(term);
      return actionMatch || entityMatch || metaMatch || userMatch;
    }

    return true;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getActionLabel = (action) => {
    if (!action) return '';
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md text-left"
      onClick={onClose}
    >
      <div 
        className="bg-surface-container border border-outline-variant rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface transition-colors p-1 hover:bg-surface-container-high rounded-lg"
          aria-label="Close logs modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="p-lg pb-md">
          <div className="flex items-center gap-sm text-primary mb-xs">
            <span className="material-symbols-outlined text-[22px]">history</span>
            <span className="font-label-sm text-label-sm tracking-[0.1em] uppercase">Audit Trail</span>
          </div>
          <h2 className="text-headline-md font-bold text-on-surface">Workspace Activity Logs</h2>
          <p className="text-body-md text-on-surface-variant">
            View detailed system operations, creations, updates, and events occurring inside this workspace.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="px-lg pb-md flex flex-col sm:flex-row gap-md items-stretch sm:items-center justify-between border-b border-outline-variant">
          <div className="flex flex-1 flex-col sm:flex-row gap-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search logs by action, message, or member..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/60 font-body-md focus:ring-1 focus:ring-primary focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">clear</span>
                </button>
              )}
            </div>

            {/* Entity Filter */}
            <div className="relative">
              <select
                className="h-10 px-3 pr-8 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer appearance-none min-w-[160px]"
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="WORKSPACE">Workspace</option>
                <option value="PROJECT">Project</option>
                <option value="TASK">Task</option>
                <option value="TICKET">Ticket</option>
                <option value="DOCUMENT">Document</option>
                <option value="AI_REQUEST">AI Operations</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          <div className="flex items-center gap-xs text-label-md font-label-md text-on-surface-variant self-end sm:self-center">
            <span>Showing</span>
            <span className="font-semibold text-on-surface">{filteredLogs.length}</span>
            <span>of</span>
            <span className="font-semibold text-on-surface">{logs.length}</span>
            <span>events</span>
          </div>
        </div>

        {/* Scrollable Logs Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-lg space-y-md bg-surface-container-low/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-md">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-body-md text-on-surface-variant">Loading workspace audit logs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-md border border-error/20 bg-error/5 rounded-xl text-center gap-sm">
              <span className="material-symbols-outlined text-[40px] text-error">warning</span>
              <h4 className="font-bold text-headline-sm text-on-surface">Failed to load logs</h4>
              <p className="text-body-md text-on-surface-variant max-w-md">{error}</p>
              <button
                onClick={fetchLogs}
                className="mt-xs px-lg py-sm bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Retry Fetching
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-sm">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
                history_toggle_off
              </span>
              <h4 className="font-semibold text-body-lg text-on-surface">No matching activities found</h4>
              <p className="text-body-md text-on-surface-variant max-w-sm">
                Try adjusting your search filters or clear the query to see all logs.
              </p>
              {(searchTerm || selectedEntity !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedEntity('ALL');
                  }}
                  className="mt-xs text-primary font-semibold hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-sm">
              {filteredLogs.map((log) => {
                const user = getUserDetails(log.userId);
                const entityConf = getEntityConfig(log.entityType);

                return (
                  <div
                    key={log.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-outline-variant hover:border-outline bg-surface-container-low hover:bg-surface-container-high/60 transition-all rounded-xl text-left"
                  >
                    {/* User & Operation Details */}
                    <div className="flex items-start gap-md min-w-0">
                      {/* Avatar */}
                      <div 
                        className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center font-bold text-sm text-primary shrink-0 mt-0.5"
                        title={`${user.name} (${user.email})`}
                      >
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>

                      {/* Operation details */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-xs gap-y-1">
                          <span className="font-semibold text-on-surface text-body-md truncate">
                            {user.name}
                          </span>
                          <span className="text-on-surface-variant text-xs">•</span>
                          <span className="text-on-surface-variant text-xs truncate max-w-[150px] md:max-w-none" title={user.email}>
                            {user.email}
                          </span>
                        </div>
                        
                        <p className="text-on-surface text-body-md mt-0.5 leading-relaxed break-words font-medium">
                          {log.metadata || getActionLabel(log.action)}
                        </p>

                        <div className="flex items-center gap-sm mt-1.5 flex-wrap">
                          {/* Relative / absolute time */}
                          <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {formatTimestamp(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Tag Badges */}
                    <div className="flex items-center gap-sm self-start md:self-center pl-[52px] md:pl-0">
                      {/* Entity ID / Reference */}
                      {log.entityId && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-highest text-on-surface border border-outline-variant">
                          ID: #{log.entityId}
                        </span>
                      )}

                      {/* Category Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border flex items-center gap-xs ${entityConf.colorClass}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {entityConf.icon}
                        </span>
                        {entityConf.badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-md px-lg border-t border-outline-variant flex justify-between items-center bg-surface-container/30">
          <p className="text-xs text-on-surface-variant italic">
            * Fully synced with database audit logs. Only Owners/Admins have access.
          </p>
          <button
            onClick={onClose}
            className="px-lg py-sm bg-surface-container-highest border border-outline-variant hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ViewLogsModal;
