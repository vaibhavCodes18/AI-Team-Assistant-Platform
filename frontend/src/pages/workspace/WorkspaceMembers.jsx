import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../api/authApi';
import { 
  getWorkspaceById, 
  getAllWorkspaceMembers, 
  removeWorkspaceMember, 
  updateWorkspaceMemberRole 
} from '../../api/workspaceApi';
import Sidebar from '../../components/layout/Sidebar';
import InviteMemberModal from '../../components/workspace/InviteMemberModal';

const WorkspaceMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    try {
      // Fetch user profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) {
        setUser(userRes.data);
      }

      // Fetch workspace and members
      const workspaceRes = await getWorkspaceById(id);
      const membersRes = await getAllWorkspaceMembers(id);
      

      if (workspaceRes?.data) {
        setWorkspace(workspaceRes.data);
      } else {
        toast.error('Workspace not found');
        navigate('/workspaces');
        return;
      }

      if (membersRes?.data) {
        setWorkspaceMembers(membersRes.data);
      }
    } catch (error) {
      console.error('Failed to load workspace members:', error);
      toast.error('Failed to fetch workspace information');
      navigate('/workspaces');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [id, navigate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Find current user's role in this workspace
  const currentMemberObj = workspaceMembers?.find(m => m.user.id === user?.id);
  const currentUserRole = currentMemberObj?.role;
  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN';
  const isOwnerOrAdmin = isOwner || isAdmin;

  // Handle live role change
  const handleRoleChange = async (targetUserId, newRole) => {
    if (!isOwner) {
      toast.error('Only the workspace Owner can update member roles');
      return;
    }

    try {
      const res = await updateWorkspaceMemberRole(id, targetUserId, { role: newRole });
      if (res) {
        toast.success('Member role updated successfully!');
        await loadData();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(error.response?.data?.message || 'Failed to update member role');
    }
  };

  // Handle member removal
  const handleRemoveMember = async (targetUserId, targetName) => {
    const canRemove = isOwner || (isAdmin && workspaceMembers?.find(m => m.user.id === targetUserId)?.role !== 'OWNER');
    if (!canRemove) {
      toast.error('You do not have permission to remove this member');
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to remove ${targetName} from this workspace?`)) {
      return;
    }

    try {
      await removeWorkspaceMember(id, targetUserId);
      toast.success(`${targetName} removed from workspace`);
      await loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Filter members list based on search query
  const filteredMembers = workspaceMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = member.user.name?.toLowerCase().includes(query);
    const emailMatch = member.user.email?.toLowerCase().includes(query);
    const roleMatch = member.role?.toLowerCase().includes(query);
    return nameMatch || emailMatch || roleMatch;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading member list...</p>
        </div>
      </div>
    );
  }

  const activeSeatsCount = workspaceMembers.filter(m => m.user.isActive).length;
  const adminsCount = workspaceMembers.filter(m => m.role === 'ADMIN' || m.role === 'OWNER').length;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* SideNavBar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        
        {/* TopNavBar Header */}
        <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Link to={`/workspaces/${id}`} className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors">Workspaces /</span>
            </Link>
            <span className="font-body-md text-body-md font-bold text-on-surface">Member Management</span>
          </div>
          <div className="flex items-center gap-lg">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input 
                className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-1.5 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all text-on-surface" 
                placeholder="Search members..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs">
              <span className="absolute inset-0 flex items-center justify-center">
                {getInitials(user?.name)}
              </span>
              {user?.profileImage && (
                <img 
                  src={user.profileImage} 
                  alt={user.name} 
                  className="absolute inset-0 w-full h-full object-cover z-10" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 w-full p-lg md:p-xl space-y-xl max-w-screen-xl mx-auto overflow-y-auto custom-scrollbar pb-24 md:pb-gutter text-left">
          
          {/* Title Header Section */}
          <div className="flex justify-between items-end mb-xl flex-wrap gap-md">
            <div>
              <h2 className="font-headline-lg text-[28px] md:text-[36px] text-on-surface font-bold">Workspace Members</h2>
              <p className="text-on-surface-variant mt-xs">Manage your team's access levels and workspace permissions.</p>
            </div>
            <button 
              onClick={() => {
                if (isOwnerOrAdmin) {
                  setIsInviteModalOpen(true);
                } else {
                  toast.error('Only Owners and Admins can invite members');
                }
              }}
              disabled={!isOwnerOrAdmin}
              className={`px-lg py-sm rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg ${
                isOwnerOrAdmin 
                  ? 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20 cursor-pointer' 
                  : 'bg-surface-container-high border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-50'
              }`}
              title={isOwnerOrAdmin ? 'Invite new member' : 'Only Owners and Admins can invite members'}
            >
              <span className="material-symbols-outlined text-[20px]">{isOwnerOrAdmin ? 'person_add' : 'lock'}</span>
              Invite Member
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Total Members</p>
              <p className="text-headline-md text-[24px] font-bold text-on-surface">{workspaceMembers.length}</p>
            </div>
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Active Seats</p>
              <p className="text-headline-md text-[24px] font-bold text-primary">{activeSeatsCount} / 2,000</p>
            </div>
            <div className="glass-card p-lg rounded-xl">
              <p class="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Pending Invites</p>
              <p className="text-headline-md text-[24px] font-bold text-tertiary">0</p>
            </div>
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Admins / Owners</p>
              <p className="text-headline-md text-[24px] font-bold text-on-surface">{adminsCount}</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-card rounded-xl overflow-hidden shadow-lg border border-outline-variant">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Member</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Role</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Status</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Last Active</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {currentItems.length > 0 ? (
                    currentItems.map((member) => {
                      const isSelf = member.user.id === user?.id;
                      const isOwnerRole = member.role === 'OWNER';
                      const canDeleteThis = (isOwner || (isAdmin && !isOwnerRole)) && !isSelf;

                      return (
                        <tr 
                          key={member.id} 
                          className="hover:bg-surface-container/50 transition-colors"
                        >
                          <td className="px-lg py-md">
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
                                <p className="font-bold text-on-surface flex items-center gap-xs">
                                  {member.user.name}
                                  {isSelf && (
                                    <span className="text-[10px] text-primary font-semibold px-2 py-0.5 bg-primary/10 rounded-full">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-on-surface-variant">{member.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md">
                            <select 
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                              disabled={!isOwner || isSelf}
                              className="bg-surface-container-highest border border-outline-variant text-on-surface text-sm rounded-lg px-2 py-1 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <option value="OWNER">Owner</option>
                              <option value="ADMIN">Admin</option>
                              <option value="MEMBER">Member</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                          </td>
                          <td className="px-lg py-md">
                            {member.user.isActive ? (
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter">
                                Active
                              </span>
                            ) : (
                              <span className="bg-outline-variant/20 text-on-surface-variant px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter">
                                Away
                              </span>
                            )}
                          </td>
                          <td className="px-lg py-md text-on-surface-variant text-sm">
                            {member.user.isActive ? 'Just now' : '2 days ago'}
                          </td>
                          <td className="px-lg py-md text-right">
                            {canDeleteThis ? (
                              <button 
                                onClick={() => handleRemoveMember(member.user.id, member.user.name)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1"
                                title={`Remove ${member.user.name} from workspace`}
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            ) : (
                              <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-30 cursor-not-allowed" title="No permission to remove">
                                lock
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-lg text-center text-on-surface-variant italic">
                        No members found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-lg py-md bg-surface-container-low/50 flex justify-between items-center border-t border-outline-variant">
              <p className="text-sm text-on-surface-variant">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMembers.length)} of {filteredMembers.length} members
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed text-on-surface"
                >
                  Previous
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 bg-surface-container-highest text-on-surface border border-outline-variant rounded hover:bg-primary/20 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={id}
        workspaceName={workspace?.name || ''}
        onSuccess={loadData}
      />
    </div>
  );
};

export default WorkspaceMembers;
