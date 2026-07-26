import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../api/authApi';
import { 
  getProjectById, 
  getProjectMembers, 
  removeProjectMember, 
  updateProjectMemberRole 
} from '../../api/projectApi';
import { getAllWorkspaceMembers } from '../../api/workspaceApi';
import Sidebar from '../../components/layout/Sidebar';
import InviteProjectMemberModal from '../../components/project/InviteProjectMemberModal';
import ManageProjectMemberModal from '../../components/project/ManageProjectMemberModal';

const ProjectMembers = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Search, Filter, and Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      // Fetch current user profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) {
        setUser(userRes.data);
      }

      // Fetch project info
      const projectRes = await getProjectById(projectId);
      if (projectRes?.data) {
        setProject(projectRes.data);
      } else {
        toast.error('Project not found');
        navigate(`/workspaces/${id}/projects`);
        return;
      }

      // Fetch workspace members to know current user's workspace role
      try {
        const wsMembersRes = await getAllWorkspaceMembers(id);
        if (wsMembersRes?.data) {
          setWorkspaceMembers(wsMembersRes.data);
        }
      } catch (err) {
        console.error('Failed to load workspace members:', err);
      }

      // Fetch project members
      const membersRes = await getProjectMembers(projectId);
      if (membersRes?.data) {
        setProjectMembers(membersRes.data);
      }
    } catch (error) {
      console.error('Failed to load project members:', error);
      toast.error('Failed to fetch project information');
      navigate(`/workspaces/${id}/projects`);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [id, projectId, navigate]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatRoleLabel = (role) => {
    if (!role) return 'Contributor';
    if (role === 'PROJECT_ADMIN') return 'Project Admin';
    if (role === 'CONTRIBUTOR') return 'Contributor';
    if (role === 'VIEWER') return 'Viewer';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // Determine current user roles
  const currentUserWorkspaceMember = workspaceMembers.find(m => m.user?.id === user?.id);
  const currentUserWorkspaceRole = currentUserWorkspaceMember?.role;
  const isWorkspaceOwnerOrAdmin = currentUserWorkspaceRole === 'OWNER' || currentUserWorkspaceRole === 'ADMIN';

  const currentUserProjectMember = projectMembers.find(m => m.user?.id === user?.id);
  const currentUserProjectRole = currentUserProjectMember?.role;
  const isProjectAdmin = currentUserProjectRole === 'PROJECT_ADMIN';

  const canManage = isWorkspaceOwnerOrAdmin || isProjectAdmin;

  // Handle direct role update from select dropdown
  const handleRoleChange = async (targetUserId, newRole) => {
    if (!canManage) {
      toast.error('You do not have permission to update member roles in this project');
      return;
    }

    try {
      const res = await updateProjectMemberRole(projectId, targetUserId, { projectRole: newRole });
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
    if (!canManage) {
      toast.error('You do not have permission to remove members from this project');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${targetName} from this project?`)) {
      return;
    }

    try {
      await removeProjectMember(projectId, targetUserId);
      toast.success(`${targetName} removed from project`);
      await loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Filter members list based on search query and role filter
  const filteredMembers = projectMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = member.user?.name?.toLowerCase().includes(query);
    const emailMatch = member.user?.email?.toLowerCase().includes(query);
    const designationMatch = member.user?.designation?.toLowerCase().includes(query);
    const roleMatch = member.role?.toLowerCase().includes(query);

    const matchesQuery = nameMatch || emailMatch || designationMatch || roleMatch;
    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;

    return matchesQuery && matchesRole;
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

  // Reset page to 1 when search query or role filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading project members...</p>
        </div>
      </div>
    );
  }

  const activeCount = projectMembers.filter(m => m.user?.isActive).length;
  const adminsCount = projectMembers.filter(m => m.role === 'PROJECT_ADMIN').length;
  const contributorsCount = projectMembers.filter(m => m.role === 'CONTRIBUTOR').length;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* SideNavBar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        
        {/* TopNavBar Header */}
        <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-2 truncate">
            <Link to={`/workspaces/${id}/projects/${projectId}`} className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface transition-colors shrink-0">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-body-md text-body-md hidden sm:inline">Project Details /</span>
            </Link>
            <span className="font-body-md text-body-md font-bold text-on-surface truncate">
              {project?.name || 'Project'} Members
            </span>
          </div>

          <div className="flex items-center gap-lg shrink-0">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input 
                className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-1.5 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-44 sm:w-64 transition-all text-on-surface" 
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
              <h2 className="font-headline-lg text-[28px] md:text-[36px] text-on-surface font-bold">Project Members</h2>
              <p className="text-on-surface-variant mt-xs">Manage team access and permissions for <span className="text-on-surface font-semibold">{project?.name || 'this project'}</span>.</p>
            </div>
            <button 
              onClick={() => {
                if (canManage) {
                  setIsInviteModalOpen(true);
                } else {
                  toast.error('Only Admins and Owners can invite project members');
                }
              }}
              disabled={!canManage}
              className={`px-lg py-sm rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg ${
                canManage 
                  ? 'bg-primary text-on-primary hover:opacity-90 shadow-primary/20 cursor-pointer' 
                  : 'bg-surface-container-high border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-50'
              }`}
              title={canManage ? 'Invite new member to project' : 'Only Admins and Owners can invite members'}
            >
              <span className="material-symbols-outlined text-[20px]">{canManage ? 'person_add' : 'lock'}</span>
              Invite Member
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Total Members</p>
              <p className="text-headline-md text-[24px] font-bold text-on-surface">{projectMembers.length}</p>
            </div>
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Active Members</p>
              <p className="text-headline-md text-[24px] font-bold text-primary">{activeCount}</p>
            </div>
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Project Admins</p>
              <p className="text-headline-md text-[24px] font-bold text-secondary">{adminsCount}</p>
            </div>
            <div className="glass-card p-lg rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Contributors</p>
              <p className="text-headline-md text-[24px] font-bold text-tertiary">{contributorsCount}</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex justify-between items-center gap-md flex-wrap">
            <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant rounded-lg p-1">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  roleFilter === 'ALL'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Roles ({projectMembers.length})
              </button>
              <button
                onClick={() => setRoleFilter('PROJECT_ADMIN')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  roleFilter === 'PROJECT_ADMIN'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Project Admins ({adminsCount})
              </button>
              <button
                onClick={() => setRoleFilter('CONTRIBUTOR')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  roleFilter === 'CONTRIBUTOR'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Contributors ({contributorsCount})
              </button>
            </div>
          </div>

          {/* Members Data Table Container */}
          <div className="glass-card rounded-xl overflow-hidden shadow-lg border border-outline-variant">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Member</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Designation</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Project Role</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold">Status</th>
                    <th className="px-lg py-md text-label-sm text-on-surface-variant uppercase font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {currentItems.length > 0 ? (
                    currentItems.map((member) => {
                      const isSelf = member.user?.id === user?.id;
                      const profileImg = member.user?.profileImage;
                      const memberName = member.user?.name || 'Unnamed Member';
                      const memberEmail = member.user?.email || 'N/A';
                      const memberDesignation = member.user?.designation || 'Member';

                      return (
                        <tr 
                          key={member.id} 
                          className="hover:bg-surface-container/50 transition-colors"
                        >
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-low overflow-hidden flex items-center justify-center font-bold text-sm shrink-0">
                                {profileImg ? (
                                  <img 
                                    className="w-full h-full object-cover" 
                                    alt={memberName} 
                                    src={profileImg} 
                                  />
                                ) : (
                                  getInitials(memberName)
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-on-surface flex items-center gap-xs truncate">
                                  {memberName}
                                  {isSelf && (
                                    <span className="text-[10px] text-primary font-semibold px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                                      You
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-on-surface-variant truncate">{memberEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-md text-sm text-on-surface">
                            {memberDesignation}
                          </td>
                          <td className="px-lg py-md">
                            <select 
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user?.id, e.target.value)}
                              disabled={!canManage || isSelf}
                              className="bg-surface-container-highest border border-outline-variant text-on-surface text-xs rounded-lg px-2 py-1.5 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer font-medium"
                            >
                              <option value="PROJECT_ADMIN">Project Admin</option>
                              <option value="CONTRIBUTOR">Contributor</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                          </td>
                          <td className="px-lg py-md">
                            {member.user?.isActive ? (
                              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="bg-outline-variant/20 text-on-surface-variant px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50"></span>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-lg py-md text-right">
                            <div className="flex items-center justify-end gap-xs">
                              {canManage && !isSelf && (
                                <button 
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsManageModalOpen(true);
                                  }}
                                  className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
                                  title="Manage Member Settings"
                                >
                                  <span className="material-symbols-outlined text-[18px]">settings</span>
                                </button>
                              )}
                              {canManage && !isSelf ? (
                                <button 
                                  onClick={() => handleRemoveMember(member.user?.id, memberName)}
                                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
                                  title={`Remove ${memberName} from project`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              ) : (
                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant opacity-30 cursor-not-allowed" title="No permission to remove">
                                  lock
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-lg text-center text-on-surface-variant italic">
                        No members found matching your search and role filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-lg py-md bg-surface-container-low/50 flex justify-between items-center border-t border-outline-variant">
              <p className="text-sm text-on-surface-variant">
                Showing {filteredMembers.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredMembers.length)} of {filteredMembers.length} members
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

      {/* Invite Project Member Modal */}
      <InviteProjectMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
        projectName={project?.name || ''}
        onSuccess={loadData}
      />

      {/* Manage Project Member Modal */}
      <ManageProjectMemberModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        projectId={projectId}
        currentUserRoleInWorkspace={currentUserWorkspaceRole}
        currentUserRoleInProject={currentUserProjectRole}
        onSuccess={loadData}
      />
    </div>
  );
};

export default ProjectMembers;
