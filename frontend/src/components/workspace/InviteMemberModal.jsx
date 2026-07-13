import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { inviteMember } from '../../api/workspaceApi';

const InviteMemberModal = ({ isOpen, onClose, workspaceId, workspaceName, onSuccess }) => {
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'MEMBER'
  });

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setInviting(true);
      const res = await inviteMember(workspaceId, {
        email: inviteForm.email,
        role: inviteForm.role
      });
      
      if (res?.data) {
        toast.success('Member invited successfully!');
        setInviteForm({ email: '', role: 'MEMBER' });
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to invite member:', error);      
      toast.error(error.response?.data?.msg || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="text-left">
          <h3 className="text-headline-md font-bold text-on-surface">Invite Member</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">Add a new collaborator to the {workspaceName} workspace.</p>
        </div>
        
        <form onSubmit={handleInviteSubmit} className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="inviteEmail">
              Email Address
            </label>
            <input 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="inviteEmail"
              type="email"
              required
              placeholder="Enter Email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="inviteRole">
              Workspace Role
            </label>
            <select 
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              id="inviteRole"
              value={inviteForm.role}
              onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="MEMBER" className="bg-[#191b23] text-on-surface">Member</option>
              <option value="ADMIN" className="bg-[#191b23] text-on-surface">Admin</option>
              <option value="VIEWER" className="bg-[#191b23] text-on-surface">Viewer</option>
            </select>
          </div>

          <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-lg">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors"
              disabled={inviting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs"
              disabled={inviting}
            >
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
