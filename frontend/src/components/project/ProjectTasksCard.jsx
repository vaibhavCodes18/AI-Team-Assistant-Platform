import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { addTask, deleteTaskById, getProjectTasks, updateTask } from '../../api/taskApi';
import { getProjectMembers } from '../../api/projectApi';

const ProjectTasksCard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
  });

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!projectId) return;
      setLoading(true);

      try {
        const [membersRes, tasksRes] = await Promise.allSettled([
          getProjectMembers(projectId),
          getProjectTasks(projectId),
        ]);

        if (isMounted) {
          if (membersRes.status === 'fulfilled' && membersRes.value?.data) {
            setUsers(membersRes.value.data);
          }
          if (tasksRes.status === 'fulfilled' && tasksRes.value?.data) {
            setTasks(tasksRes.value.data);
          } else if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)) {
            setTasks(tasksRes.value);
          }
        }
      } catch (error) {
        console.error('Failed to load project tasks data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const prevStatus = task.status;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await updateTask(task.id, { status: nextStatus });
      const updatedTask = res?.data || res;
      if (updatedTask && updatedTask.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? updatedTask : t))
        );
      }
      toast.success(
        nextStatus === 'DONE'
          ? `Task "${task.title}" marked as completed!`
          : `Task "${task.title}" marked as to-do.`
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: prevStatus } : t))
      );
      const errorMsg = error?.response?.data?.message || 'Failed to update task status.';
      toast.error(errorMsg);
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const { id, title } = taskToDelete;
    setDeletingId(id);

    try {
      await deleteTaskById(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success(`Task "${title}" deleted successfully.`);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to delete task.';
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required.');
      return;
    }

    setSubmitting(true);

    const newTaskPayload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      priority: formData.priority || 'MEDIUM',
      projectId: parseInt(projectId, 10),
      assigneeId: formData.assigneeId ? parseInt(formData.assigneeId, 10) : null,
      dueDate: formData.dueDate ? formData.dueDate : null,
    };

    try {
      const response = await addTask(newTaskPayload);
      const createdTask = response?.data || response;

      if (createdTask) {
        toast.success('Task created successfully');
        setTasks((prev) => [createdTask, ...prev]);
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assigneeId: '',
          dueDate: '',
        });
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to create task.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

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
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
    }
  };

  const formatStatusLabel = (status) => {
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

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-outline-variant/40 shadow-lg">
      {/* Header */}
      <div className="p-lg border-b border-outline-variant flex flex-wrap justify-between items-center bg-surface-container-low gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">check_box</span>
          <div>
            <h3 className="font-headline-md text-[20px] text-on-surface font-bold">Project Tasks</h3>
            <p className="text-xs text-on-surface-variant">
              {completedCount} of {totalCount} tasks completed ({progressPercent}%)
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-on-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer border-none shadow-md hover:shadow-primary/20"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-lg pt-4 pb-2 bg-surface-container-lowest">
        <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-lg py-2 flex items-center gap-2 bg-surface-container-lowest border-b border-outline-variant/30 text-xs overflow-x-auto custom-scrollbar">
        {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer border-none ${
              filter === tab
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {tab === 'ALL' ? 'All Tasks' : formatStatusLabel(tab)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-md space-y-3 custom-scrollbar min-h-[260px] max-h-[380px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px] gap-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-on-surface-variant">Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isDone = task.status === 'DONE';
            const isDeleting = deletingId === task.id;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                  isDone
                    ? 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-75'
                    : 'bg-surface-container-lowest hover:bg-surface-container-high/60 border-outline-variant/40 hover:border-primary/40 shadow-sm'
                }`}
              >
                {/* Checkbox & Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 shrink-0 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                    title={isDone ? 'Mark as To-Do' : 'Mark as Done'}
                  >
                    <span className={`material-symbols-outlined text-xl ${isDone ? 'text-emerald-400 font-bold' : 'text-outline'}`}>
                      {isDone ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                        {task.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(task.status)}`}>
                        {formatStatusLabel(task.status)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-on-surface-variant flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                        <span>{task.dueDate ? `Due: ${task.dueDate}` : 'No due date'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                          {getInitials(task.assignedUserName)}
                        </div>
                        <span className="truncate max-w-[120px]">{task.assignedUserName || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTask(task)}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-all cursor-pointer bg-transparent border-none shrink-0"
                  title="Delete Task"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isDeleting ? 'hourglass_top' : 'delete'}
                  </span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">task_alt</span>
            <p className="text-on-surface font-medium text-sm">No tasks found</p>
            <p className="text-on-surface-variant text-xs mt-1">There are no tasks matching the selected filter.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
            <div className="bg-surface border border-outline-variant/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <h3 className="text-lg font-bold text-on-surface">Delete Task</h3>
              </div>
              <p className="text-sm text-on-surface-variant">
                Are you sure you want to delete task <strong className="text-on-surface font-semibold">"{taskToDelete.title}"</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant/40 bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTask}
                  disabled={deletingId !== null}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-error text-on-error hover:bg-error/90 transition-all border-none cursor-pointer flex items-center gap-2 shadow-md"
                >
                  {deletingId !== null ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-on-error border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Task</span>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Create Task Modal (Ticket Modal Layout Style) */}
      {isCreateModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-md text-left">
            <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-lg w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none"
                disabled={submitting}
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="text-left">
                <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">add_task</span>
                  Create New Task
                </h3>
                <p className="text-body-md text-on-surface-variant mt-xs">
                  Add an actionable task to your project workspace.
                </p>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-md text-left">
                <div className="space-y-xs">
                  <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="taskTitle">
                    Task Title *
                  </label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                    id="taskTitle"
                    type="text"
                    required
                    maxLength={150}
                    placeholder="e.g. Configure SSL Certificate & OAuth setup"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-xs">
                  <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="taskDescription">
                    Description
                  </label>
                  <textarea
                    className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24"
                    id="taskDescription"
                    maxLength={1000}
                    placeholder="Provide detailed description, acceptance criteria, or context..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="taskPriority">
                      Priority *
                    </label>
                    <select
                      className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      id="taskPriority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      disabled={submitting}
                    >
                      <option value="LOW" className="bg-[#191b23] text-on-surface">Low</option>
                      <option value="MEDIUM" className="bg-[#191b23] text-on-surface">Medium</option>
                      <option value="HIGH" className="bg-[#191b23] text-on-surface">High</option>
                      <option value="CRITICAL" className="bg-[#191b23] text-on-surface">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="taskDueDate">
                      Due Date
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      id="taskDueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="taskAssignee">
                    Assignee
                  </label>
                  <select
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                    id="taskAssignee"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="" className="bg-[#191b23] text-on-surface">Unassigned</option>
                    {users.map((u) => {
                      const userId = u.user?.id || u.id;
                      const userName = u.user?.name || 'Member';
                      const userEmail = u.user?.email ? ` (${u.user.email})` : '';
                      const role = u.role ? ` - ${u.role}` : '';
                      return (
                        <option key={userId} value={userId} className="bg-[#191b23] text-on-surface">
                          {userName}{userEmail}{role}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-lg">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors cursor-pointer"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs cursor-pointer"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProjectTasksCard;
