import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { removeWorkspaceMember, updateWorkspaceMemberRole } from '../../api/workspaceApi';

const ManageMemberModal = ({ isOpen, onClose, member, workspaceId, currentUserRole, onSuccess }) => {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [role, setRole] = useState('MEMBER');

  useEffect(() => {
    if (member) {
      setRole(member.role || 'MEMBER');
      setConfirmRemove(false);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN';
  const canUpdateRole = isOwner;
  const canRemove = isOwner || (isAdmin && member.role !== 'OWNER');

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!canUpdateRole) {
      toast.error('Only the workspace Owner can update member roles');
      return;
    }

    try {
      setUpdating(true);
      const res = await updateWorkspaceMemberRole(workspaceId, member.user.id, { role });
      if (res) {
        toast.success('Member role updated successfully!');
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(error.response?.data?.message || 'Failed to update member role');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!canRemove) {
      toast.error('You do not have permission to remove this member');
      return;
    }

    try {
      setRemoving(true);
      await removeWorkspaceMember(workspaceId, member.user.id);
      toast.success(`${member.user.name} removed from workspace`);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          disabled={updating || removing}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-left">
          <h3 className="text-headline-md font-bold text-on-surface">Manage Member</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">Update workspace role or remove collaborator.</p>
        </div>

        {/* Member Profile Card */}
        <div className="flex items-center gap-md p-md bg-surface-container-low border border-outline-variant rounded-lg">
          <div className="w-12 h-12 rounded-full border border-outline-variant bg-surface-container-low overflow-hidden flex items-center justify-center font-bold text-md text-primary">
            {member.user.profileImage ? (
              <img 
                className="w-full h-full object-cover" 
                alt={member.user.name} 
                src={member.user.profileImage} 
              />
            ) : (
              member.user.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'
            )}
          </div>
          <div className="text-left">
            <h4 className="font-body-lg font-semibold text-on-surface">{member.user.name}</h4>
            <p className="text-label-md text-on-surface-variant">{member.user.email}</p>
            <p className="text-label-sm text-primary font-medium mt-0.5">{member.user.designation || 'Engineer'} • Current Role: {member.role}</p>
          </div>
        </div>

        {/* Role Update Form */}
        <form onSubmit={handleUpdateRole} className="space-y-md text-left pt-xs">
          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="memberRole">
              Workspace Role
            </label>
            <select 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              id="memberRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!canUpdateRole || updating || removing}
            >
              <option value="MEMBER" className="bg-[#191b23] text-on-surface">Member</option>
              <option value="ADMIN" className="bg-[#191b23] text-on-surface">Admin</option>
              <option value="VIEWER" className="bg-[#191b23] text-on-surface">Viewer</option>
            </select>
            {!canUpdateRole && (
              <p className="text-xs text-on-surface-variant italic ml-xs animate-pulse">
                * Only the workspace Owner can modify member roles.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-xs">
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs"
              disabled={!canUpdateRole || updating || removing}
            >
              {updating ? 'Saving...' : 'Update Role'}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        {(canRemove || member.role === 'OWNER') && (
          <div className="pt-md border-t border-outline-variant text-left space-y-sm">
            <h4 className="font-label-sm text-error font-semibold uppercase tracking-wider block ml-xs">Danger Zone</h4>
            
            {!confirmRemove ? (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="w-full h-12 border border-error/50 text-error hover:bg-error/10 font-semibold rounded-lg transition-colors flex items-center justify-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updating || removing || !canRemove}
              >
                <span className="material-symbols-outlined text-md">person_remove</span>
                Remove from Workspace
              </button>
            ) : (
              <div className="p-md border border-error/30 bg-error/5 rounded-lg space-y-md animate-in fade-in duration-200">
                <p className="text-body-md text-on-surface">
                  Are you absolutely sure you want to remove <strong>{member.user.name}</strong> from this workspace? They will lose access to all projects, documents, and tasks.
                </p>
                <div className="flex justify-end gap-md">
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(false)}
                    className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors"
                    disabled={removing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveMember}
                    className="px-4 py-2 bg-error text-on-error font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                    disabled={removing}
                  >
                    {removing ? 'Removing...' : 'Confirm Remove'}
                  </button>
                </div>
              </div>
            )}
            
            {member.role === 'OWNER' && (
              <p className="text-xs text-on-surface-variant italic ml-xs">
                * The Workspace Owner cannot be removed.
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ManageMemberModal;
