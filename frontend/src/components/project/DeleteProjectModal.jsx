import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { deleteProject } from '../../api/projectApi';

const DeleteProjectModal = ({ isOpen, onClose, projectId, projectName, workspaceId }) => {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteProject(projectId);
      toast.success(`Project "${projectName}" deleted successfully`);
      onClose();
      // Redirect back to projects list under workspaceId
      navigate(`/workspaces/${workspaceId}/projects`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-error/20 rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors"
          disabled={deleting}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-md text-error">
          <div className="p-3 bg-error/10 rounded-full">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <div className="text-left">
            <h3 className="text-headline-md font-bold text-on-surface">Delete Project</h3>
            <p className="text-label-md text-error font-medium">This action is irreversible</p>
          </div>
        </div>

        <div className="text-left space-y-md">
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            Are you sure you want to delete the project with name: <strong className="text-on-surface font-semibold">"{projectName}"</strong>?
          </p>
          <p className="text-xs text-on-surface-variant/80 bg-surface-container-low p-md rounded-lg border border-outline-variant/30">
            Deleting this project will permanently remove all of its components, tasks, associated member relations, and history. This cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors cursor-pointer"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2 bg-error text-on-error font-bold rounded-lg hover:bg-error-container/80 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs cursor-pointer"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
