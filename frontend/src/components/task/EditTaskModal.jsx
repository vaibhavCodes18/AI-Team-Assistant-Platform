import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { updateTask } from '../../api/taskApi';

const EditTaskModal = ({ isOpen, onClose, task, members = [], onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    assigneeId: ''
  });

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  useEffect(() => {
    if (task && isOpen) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: formatDateForInput(task.dueDate),
        assigneeId: task.assignedUserId || task.assignee?.id || ''
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        assigneeId: form.assigneeId ? parseInt(form.assigneeId, 10) : -1
      };

      const res = await updateTask(task.id, payload);

      if (res?.data || res?.id) {
        toast.success('Task updated successfully!');
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-md sm:p-lg">
      <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background overflow-hidden">
        {/* Header */}
        <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-start shrink-0">
          <div className="space-y-1 min-w-0 pr-6 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-0.5 bg-amber-400/10 rounded">
                #TSK-{task.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                Edit Task
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface leading-snug">Edit Task #{task.id}</h2>
            <p className="text-xs text-on-surface-variant">Update task title, description, status, priority, due date, or assignee.</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none shrink-0"
            disabled={submitting}
            title="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-left">
          <div className="flex-1 overflow-y-auto p-lg space-y-md custom-scrollbar">
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTaskTitle">
                Title *
              </label>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                id="editTaskTitle"
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Configure SSL Certificate & OAuth setup"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                disabled={submitting}
              />
            </div>

            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTaskDescription">
                Description
              </label>
              <textarea
                className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none h-32"
                id="editTaskDescription"
                maxLength={5000}
                placeholder="Provide detailed description, acceptance criteria, or context..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTaskStatus">
                  Status *
                </label>
                <select
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  id="editTaskStatus"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  disabled={submitting}
                >
                  <option value="TODO" className="bg-[#191b23] text-on-surface">To Do</option>
                  <option value="IN_PROGRESS" className="bg-[#191b23] text-on-surface">In Progress</option>
                  <option value="IN_REVIEW" className="bg-[#191b23] text-on-surface">In Review</option>
                  <option value="DONE" className="bg-[#191b23] text-on-surface">Done</option>
                </select>
              </div>

              <div className="space-y-xs">
                <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTaskPriority">
                  Priority *
                </label>
                <select
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  id="editTaskPriority"
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  disabled={submitting}
                >
                  <option value="LOW" className="bg-[#191b23] text-on-surface">Low</option>
                  <option value="MEDIUM" className="bg-[#191b23] text-on-surface">Medium</option>
                  <option value="HIGH" className="bg-[#191b23] text-on-surface">High</option>
                  <option value="CRITICAL" className="bg-[#191b23] text-on-surface">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTaskDueDate">
                  Due Date
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  id="editTaskDueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-xs">
                <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTaskAssignee">
                  Assignee
                </label>
                <select
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  id="editTaskAssignee"
                  value={form.assigneeId}
                  onChange={(e) => setForm((prev) => ({ ...prev, assigneeId: e.target.value }))}
                  disabled={submitting}
                >
                  <option value="" className="bg-[#191b23] text-on-surface">Unassigned</option>
                  {members.map((u) => {
                    const userId = u.user?.id || u.id;
                    const userName = u.user?.name || u.name || 'Member';
                    const userEmail = (u.user?.email || u.email) ? ` (${u.user?.email || u.email})` : '';
                    return (
                      <option key={userId} value={userId} className="bg-[#191b23] text-on-surface">
                        {userName}{userEmail}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-end gap-md shrink-0">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditTaskModal;
