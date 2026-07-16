import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createProject } from '../../api/projectApi';

const CreateProjectModal = ({ isOpen, onClose, workspaceId, onSuccess, isOwnerOrAdmin }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    deadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnerOrAdmin) {
      toast.error('Only Workspace Owners and Admins can create projects');
      onClose();
      return;
    }
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createProject({
        workspaceId: Number(workspaceId),
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        startDate: form.startDate || null,
        deadline: form.deadline || null
      });

      if (res?.data) {
        toast.success('Project created successfully!');
        setForm({
          name: '',
          description: '',
          status: 'ACTIVE',
          startDate: '',
          deadline: ''
        });
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !isOwnerOrAdmin) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-left">
          <h3 className="text-headline-md font-bold text-on-surface">New Project</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">Create a new engineering module or repository inside this workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="projectName">
              Project Name *
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="projectName"
              type="text"
              required
              placeholder="e.g. Auth Service"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="projectDesc">
              Description
            </label>
            <textarea
              className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24"
              id="projectDesc"
              placeholder="e.g. Identity and authorization service using OAuth2 and JWT"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="projectStatus">
              Initial Status
            </label>
            <select
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              id="projectStatus"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="ACTIVE" className="bg-[#191b23] text-on-surface">Active</option>
              <option value="ON_HOLD" className="bg-[#191b23] text-on-surface">On Hold</option>
              <option value="COMPLETED" className="bg-[#191b23] text-on-surface">Completed</option>
              <option value="ARCHIVED" className="bg-[#191b23] text-on-surface">Archived</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="startDate">
                Start Date
              </label>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="deadline">
                Deadline
              </label>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

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
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
