import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { updateWorkspace, deleteWorkspace } from '../../api/workspaceApi';

const EditWorkspace = ({ workspace, onWorkspaceUpdated, currentUserRole }) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    if (workspace) {
      setEditForm({
        name: workspace.name || '',
        slug: workspace.slug || '',
        description: workspace.description || ''
      });
    }
  }, [workspace]);

  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN';
  const canUpdate = isOwner || isAdmin;
  const canDelete = isOwner;

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!canUpdate) {
      toast.error('You do not have permission to update this workspace');
      return;
    }
    if (!editForm.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      setUpdating(true);
      const res = await updateWorkspace(workspace.id, {
        name: editForm.name,
        description: editForm.description,
        slug: editForm.slug,
        logoUrl: workspace.logoUrl
      });
      if (res?.data) {
        toast.success('Workspace updated successfully!');
        const updated = res.data;
        setEditForm({
          name: updated.name || editForm.name,
          description: updated.description || editForm.description,
          slug: updated.slug || editForm.slug
        });
        if (onWorkspaceUpdated) {
          onWorkspaceUpdated(updated);
        }
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
      toast.error(error.response?.data?.message || 'Failed to update workspace');
    } finally {
      setUpdating(false);
    }
  };

  const handleArchiveWorkspace = async () => {
    if (!canDelete) {
      toast.error('Only the workspace Owner can delete this workspace');
      return;
    }
    if (!window.confirm('Are you sure you want to archive/delete this workspace? This action cannot be undone.')) {
      return;
    }

    try {
      setArchiving(true);
      await deleteWorkspace(workspace.id);
      toast.success('Workspace successfully archived!');
      navigate('/workspaces');
    } catch (error) {
      console.error('Failed to archive workspace:', error);
      toast.error(error.response?.data?.message || 'Failed to archive workspace');
      setArchiving(false);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col min-h-[400px]">
      <div className="p-lg border-b border-outline-variant bg-surface-container/50 flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">Workspace Settings</h3>
      </div>
      
      {!canUpdate && (
        <div className="mx-lg mt-md p-md bg-surface-container-low border border-outline-variant rounded-lg flex items-center gap-sm text-on-surface-variant text-xs">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>Only Workspace Owner and Admins can update settings.</span>
        </div>
      )}

      <form onSubmit={handleUpdateSubmit} className="p-lg flex-1 flex flex-col justify-between space-y-md">
        <div className="space-y-sm">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Workspace Name</label>
          <div className="flex items-center gap-md">
            <input 
              className="flex-1 h-10 px-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed" 
              type="text" 
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={!canUpdate || updating}
            />
            {canUpdate && (
              <button 
                type="submit" 
                disabled={updating}
                className="h-10 text-primary font-body-md font-semibold px-md border border-primary/20 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {updating ? 'Updating...' : 'Update'}
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-sm">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Slug</label>
          <div className="flex items-center gap-md">
            <input 
              className="flex-1 h-10 px-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed" 
              type="text" 
              value={editForm.slug}
              onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
              required
              disabled={!canUpdate || updating}
            />
          </div>
        </div>

        <div className="space-y-xs">
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Description</label>
          <textarea 
            className="w-full p-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed" 
            rows="3"
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            disabled={!canUpdate || updating}
          />
        </div>
        
        <div className="flex items-center gap-md pt-sm">
          <button 
            type="button"
            onClick={() => toast.success('Workspace data exported')}
            className="flex-1 h-12 bg-surface-container-highest text-on-surface rounded-xl font-semibold border border-outline-variant hover:bg-surface-bright transition-colors flex items-center justify-center gap-sm text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">cloud_download</span>
            Export Data
          </button>
          <button 
            type="button"
            onClick={handleArchiveWorkspace}
            disabled={archiving || !canDelete}
            className={`flex-1 h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-sm text-sm ${
              canDelete 
                ? 'bg-error-container text-on-error-container hover:brightness-110 cursor-pointer shadow-md' 
                : 'bg-surface-container border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-50'
            }`}
            title={canDelete ? 'Archive workspace' : 'Only the workspace Owner can delete this workspace'}
          >
            <span className="material-symbols-outlined text-[20px]">{canDelete ? 'delete_forever' : 'lock'}</span>
            {archiving ? 'Archiving...' : 'Archive'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditWorkspace;
