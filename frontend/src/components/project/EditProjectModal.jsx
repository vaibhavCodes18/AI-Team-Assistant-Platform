import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { updateProject } from '../../api/projectApi';

const EditProjectModal = ({ isOpen, onClose, project, onSuccess, onDeleteClick }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    deadline: ''
  });

  // Helper to format date strings to YYYY-MM-DD for input fields
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  useEffect(() => {
    if (project && isOpen) {
      setForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'ACTIVE',
        startDate: formatDateForInput(project.startDate),
        deadline: formatDateForInput(project.deadline)
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateProject(project.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        startDate: form.startDate || null,
        deadline: form.deadline || null
      });

      if (res?.data) {
        toast.success('Project updated successfully!');
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          disabled={submitting}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="text-left">
          <h3 className="text-headline-md font-bold text-on-surface">Edit Project</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">Update this project's details, status, timelines, or description.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editProjectName">
              Project Name *
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="editProjectName"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Auth Service"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editProjectDesc">
              Description
            </label>
            <textarea
              className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24"
              id="editProjectDesc"
              maxLength={500}
              placeholder="e.g. Identity and authorization service using OAuth2 and JWT"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editProjectStatus">
              Project Status
            </label>
            <select
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              id="editProjectStatus"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              disabled={submitting}
            >
              <option value="ACTIVE" className="bg-[#191b23] text-on-surface">Active</option>
              <option value="ON_HOLD" className="bg-[#191b23] text-on-surface">On Hold</option>
              <option value="COMPLETED" className="bg-[#191b23] text-on-surface">Completed</option>
              <option value="ARCHIVED" className="bg-[#191b23] text-on-surface">Archived</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editStartDate">
                Start Date
              </label>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="editStartDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editDeadline">
                Deadline
              </label>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="editDeadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                disabled={submitting}
              />
            </div>
          </div>

          {onDeleteClick && (
            <div className="pt-md border-t border-outline-variant text-left mt-lg">
              <h4 className="font-label-sm text-error font-semibold uppercase tracking-wider block mb-2">Danger Zone</h4>
              <button
                type="button"
                onClick={onDeleteClick}
                className="w-full py-2 bg-error/10 border border-error/30 text-error hover:bg-error/25 font-bold rounded-lg transition-colors flex items-center justify-center gap-xs cursor-pointer"
                disabled={submitting}
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete Project
              </button>
            </div>
          )}

          <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-lg">
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
    </div>
  );
};

export default EditProjectModal;
