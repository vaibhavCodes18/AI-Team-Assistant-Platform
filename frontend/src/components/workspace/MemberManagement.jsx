import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ManageMemberModal from './ManageMemberModal';

const MemberManagement = ({ workspaceId, workspaceMembers, onSuccess, currentUser }) => {
  const navigate = useNavigate();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const currentMemberObj = workspaceMembers?.find(m => m.user.id === currentUser?.id);
  const currentUserRole = currentMemberObj?.role;

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
        <h3 className="font-headline-md text-headline-md text-on-surface">Member Management</h3>
        <div className="flex gap-sm">
          <button 
            onClick={() => toast.success('Search ready')} 
            className="p-sm text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <button 
            onClick={() => toast.success('Filter ready')} 
            className="p-sm text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>
      <div className="divide-y divide-outline-variant overflow-y-auto custom-scrollbar flex-1">
        {workspaceMembers && workspaceMembers.length > 0 ? (
          workspaceMembers.slice(0, 5).map((member) => (

            <div 
              key={member.id} 
              className="px-lg py-md flex items-center justify-between hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-low overflow-hidden flex items-center justify-center font-bold text-sm">
                  {member.user.profileImage ? (
                    <img 
                      className="w-full h-full object-cover" 
                      alt={member.user.name} 
                      src={member.user.profileImage} 
                    />
                  ) : (
                    getInitials(member.user.name)
                  )}
                </div>
                <div>
                  <p className="font-body-md font-semibold text-on-surface">{member.user.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {member.user.designation || 'Engineer'} • {member.role}
                  </p>
                </div>
              </div>
              {member.user.id !== currentUser?.id ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(member);
                    setIsManageModalOpen(true);
                  }}
                  className="p-xs hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center"
                  title="Manage Member"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                </button>
              ) : (
                <span className="text-xs text-primary font-semibold px-md py-1 bg-primary/10 rounded-full">
                  You
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="p-lg text-center text-on-surface-variant italic">
            No members in this workspace yet.
          </div>
        )}
      </div>
      <div className="p-md bg-surface-container-low/50 text-center border-t border-outline-variant">
        <button 
          onClick={() => navigate(`/workspaces/${workspaceId}/members`)}
          className="font-label-sm text-label-sm text-primary hover:underline"
        >
          Manage All {workspaceMembers?.length || 0} Members
        </button>
      </div>

      <ManageMemberModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        workspaceId={workspaceId}
        currentUserRole={currentUserRole}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default MemberManagement;

