import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createWorkspace } from '../../api/workspaceApi';

const CreateWorkspace = ({ isOpen, onClose, onSuccess }) => {
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: ''
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    if (!createForm.slug.trim()) {
      toast.error('Workspace slug is required');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(createForm.slug)) {
      toast.error('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    try {
      setCreating(true);
      const res = await createWorkspace(createForm);
      if (res?.data) {
        toast.success(res.msg || 'Workspace created successfully!');
        setCreateForm({ name: '', slug: '', description: '', logoUrl: '' });
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-left">
          <h3 className="text-headline-md font-bold text-on-surface">Create New Workspace</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">Workspaces are where your team manages projects, docs, and sprints.</p>
        </div>
        
        <form onSubmit={handleCreateSubmit} className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="modalName">
              Workspace Name
            </label>
            <input 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="modalName"
              type="text"
              required
              placeholder="e.g. Core Systems"
              value={createForm.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setCreateForm(prev => ({ ...prev, name, slug }));
              }}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="modalSlug">
              Workspace Slug
            </label>
            <input 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="modalSlug"
              type="text"
              required
              pattern="^[a-z0-9-]+$"
              placeholder="e.g. core-systems"
              value={createForm.slug}
              onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="modalDesc">
              Description (Optional)
            </label>
            <textarea 
              className="w-full h-24 p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              id="modalDesc"
              placeholder="Tell us what this workspace is about..."
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="modalLogo">
              Logo URL (Optional)
            </label>
            <input 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="modalLogo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={createForm.logoUrl}
              onChange={(e) => setCreateForm(prev => ({ ...prev, logoUrl: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-lg">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors"
              disabled={creating}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
