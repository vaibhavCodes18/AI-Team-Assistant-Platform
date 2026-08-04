import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';

const INITIAL_TASKS = [
  {
    id: 'TSK-101',
    title: 'Setup CI/CD Deployment Pipeline',
    description: 'Configure GitHub Actions for automated build and staging deployment',
    status: 'COMPLETED',
    priority: 'HIGH',
    dueDate: '2026-08-10',
    assignee: 'Alex Rivera'
  },
  {
    id: 'TSK-102',
    title: 'Implement OAuth2 SSO Integration',
    description: 'Integrate Google and GitHub OAuth providers with Spring Security',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    dueDate: '2026-08-15',
    assignee: 'Sarah Chen'
  },
  {
    id: 'TSK-103',
    title: 'Database Schema Optimization',
    description: 'Index high-frequency query columns and add pagination support',
    status: 'TO_DO',
    priority: 'MEDIUM',
    dueDate: '2026-08-18',
    assignee: 'David Park'
  },
  {
    id: 'TSK-104',
    title: 'UI/UX Accessibility Audit',
    description: 'Ensure WCAG 2.1 AA compliance across all dashboard views',
    status: 'TO_DO',
    priority: 'LOW',
    dueDate: '2026-08-22',
    assignee: 'Emma Watson'
  }
];

const ProjectTasksCard = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filter, setFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleTaskStatus = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
          if (nextStatus === 'COMPLETED') {
            toast.success(`Task "${task.title}" marked as completed!`);
          }
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  const handleDeleteTask = (id, title) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success(`Task "${title}" deleted.`);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'No description provided',
      status: 'TO_DO',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      assignee: newTaskAssignee.trim() || 'Unassigned'
    };

    setTasks([newTask, ...tasks]);
    toast.success('New task added successfully!');
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('MEDIUM');
    setNewTaskAssignee('');
    setNewTaskDueDate('');
    setIsCreateModalOpen(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'TO_DO') return task.status === 'TO_DO';
    if (filter === 'IN_PROGRESS') return task.status === 'IN_PROGRESS';
    if (filter === 'COMPLETED') return task.status === 'COMPLETED';
    return true;
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
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
      case 'TO_DO':
      default:
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
    }
  };

  const formatStatusLabel = (status) => {
    if (status === 'IN_PROGRESS') return 'In Progress';
    if (status === 'COMPLETED') return 'Completed';
    return 'To Do';
  };

  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return 'U';
    return name
      .split(' ')
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
        {['ALL', 'TO_DO', 'IN_PROGRESS', 'COMPLETED'].map((tab) => (
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
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
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
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 shrink-0 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                    title={isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
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

                    <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                          {getInitials(task.assignee)}
                        </div>
                        <span className="truncate max-w-[100px]">{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDeleteTask(task.id, task.title)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-all cursor-pointer bg-transparent border-none"
                  title="Delete Task"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
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

      {/* Add Task Modal (Full Screen via React Portal) */}
      {isCreateModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-background flex flex-col h-screen w-screen overflow-y-auto animate-fade-in text-left">
            {/* Top Navigation Bar */}
            <div className="h-16 px-6 md:px-12 border-b border-outline-variant/40 flex justify-between items-center bg-surface/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                  title="Back to Project"
                >
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_task</span>
                    Create Project Task
                  </h2>
                  <p className="text-xs text-on-surface-variant hidden sm:block">
                    Add a new actionable task to your project workspace
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                title="Close"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col justify-between">
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Task Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Configure SSL Certificate & OAuth setup"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide detailed description, acceptance criteria, or context..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none shadow-sm"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Assignee</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah J."
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 border-t border-outline-variant/40 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border border-outline-variant/40 bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-all border-none cursor-pointer shadow-lg hover:shadow-primary/20"
                  >
                    Save Task
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
