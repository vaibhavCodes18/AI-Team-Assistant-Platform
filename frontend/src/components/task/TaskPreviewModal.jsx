import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { getTaskById } from '../../api/taskApi';

const TaskPreviewModal = ({ isOpen, onClose, task, taskId, canManageTasks = true, onEditClick, onDeleteClick }) => {
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeTaskId = task?.id || taskId;

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!isOpen || !activeTaskId) return;

      try {
        setLoading(true);
        const res = await getTaskById(activeTaskId);
        if (res?.data) {
          setTaskDetails(res.data);
        } else if (res && typeof res === 'object') {
          setTaskDetails(res);
        }
      } catch (error) {
        console.error('Failed to fetch task details:', error);
        toast.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [isOpen, activeTaskId]);

  if (!isOpen || (!activeTaskId && !taskDetails && !task)) return null;

  const currentTask = taskDetails || task || {};

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'TODO':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
      case 'IN_REVIEW':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'DONE':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const formatPriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'IN_REVIEW':
        return 'In Review';
      case 'DONE':
        return 'Done';
      default:
        return status || 'To Do';
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const assigneeName = currentTask.assignedUserName || currentTask.assignee?.name || 'Unassigned';
  const assigneeEmail = currentTask.assignedUserEmail || currentTask.assignee?.email || 'N/A';
  const assigneeImage = currentTask.assignedUserProfileImage || currentTask.assignee?.profileImage;

  const creatorName = currentTask.createdByName || currentTask.createdBy?.name || 'System';
  const creatorEmail = currentTask.createdByEmail || currentTask.createdBy?.email || 'N/A';
  const creatorImage = currentTask.createdUserProfileImage || currentTask.createdBy?.profileImage;

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-md sm:p-lg">
      <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background overflow-hidden">
        {/* Header */}
        <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-start shrink-0">
          <div className="space-y-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded">
                #TSK-{currentTask.id || activeTaskId}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getStatusBadgeClass(currentTask.status)}`}>
                {formatStatus(currentTask.status)}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getPriorityBadgeClass(currentTask.priority)}`}>
                {formatPriority(currentTask.priority)}
              </span>
              {currentTask.ticketId && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  Ticket #{currentTask.ticketId}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-on-surface leading-snug break-words">
              {currentTask.title || `Task #${activeTaskId}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none shrink-0"
            title="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-lg space-y-lg custom-scrollbar text-left relative">
          {loading && (
            <div className="absolute inset-0 bg-surface-container/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-xs">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</h4>
            <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface whitespace-pre-wrap leading-relaxed min-h-[80px]">
              {currentTask.description || 'No detailed description provided for this task.'}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md border-t border-outline-variant/40">
            {/* Assignee Info */}
            <div className="space-y-xs">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Assignee</h4>
              <div className="flex items-center gap-md p-md rounded-xl bg-surface-container-low border border-outline-variant/60">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                  {assigneeImage ? (
                    <img
                      src={assigneeImage}
                      alt={assigneeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(assigneeName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {assigneeName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {assigneeEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Created By Info */}
            <div className="space-y-xs">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Created By</h4>
              <div className="flex items-center gap-md p-md rounded-xl bg-surface-container-low border border-outline-variant/60">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shrink-0">
                  {creatorImage ? (
                    <img
                      src={creatorImage}
                      alt={creatorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(creatorName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {creatorName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {creatorEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md border-t border-outline-variant/40">
            {/* Due Date */}
            <div className="space-y-xs">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Due Date</h4>
              <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center gap-md">
                <div className="p-2.5 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">event</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Due Date</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="space-y-xs">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Created At</h4>
              <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center gap-md">
                <div className="p-2.5 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Created</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {currentTask.createdAt ? new Date(currentTask.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            {canManageTasks && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    if (onEditClick) onEditClick(currentTask);
                  }}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onDeleteClick) onDeleteClick(currentTask);
                  }}
                  className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error border border-error/30 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete Task
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskPreviewModal;
