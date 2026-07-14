import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, logoutUser } from '../../api/authApi';
import { getWorkspaceById, getAllWorkspaceMembers } from '../../api/workspaceApi';
import { getWorkspaceProjects } from '../../api/projectApi';
import Sidebar from '../../components/layout/Sidebar';
import CreateProjectModal from '../../components/workspace/CreateProjectModal';

const WorkspaceProjects = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('UPDATED');

  const loadData = async () => {
    try {
      // Load user profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) {
        setUser(userRes.data);
      }

      // Load workspace details
      const workspaceRes = await getWorkspaceById(id);
      if (workspaceRes?.data) {
        setWorkspace(workspaceRes.data);
      } else {
        toast.error('Workspace not found');
        navigate('/workspaces');
        return;
      }

      // Load members
      const workspaceMembersRes = await getAllWorkspaceMembers(id);
      if (workspaceMembersRes?.data) {
        setWorkspaceMembers(workspaceMembersRes.data);
      }

      // Load projects
      const projectsRes = await getWorkspaceProjects(id);
      if (projectsRes?.data) {
        setProjects(projectsRes.data);
      }
    } catch (error) {
      console.error('Failed to load projects directory data:', error);
      toast.error('Failed to load page information');
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

  const handleLogout = async () => {
    try {
      const logoutRes = await logoutUser();
      toast.success(logoutRes?.msg || 'Logged out successfully');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const currentMemberObj = workspaceMembers?.find((m) => m.user.id === user?.id);
  const currentUserRole = currentMemberObj?.role;
  const isOwnerOrAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  // Helper to map project names to specific material symbols
  const getProjectIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('pipeline') || lower.includes('database') || lower.includes('db')) return 'database';
    if (lower.includes('auth') || lower.includes('security') || lower.includes('key') || lower.includes('lock')) return 'shield';
    if (lower.includes('network') || lower.includes('cluster') || lower.includes('mesh') || lower.includes('cloud')) return 'lan';
    if (lower.includes('llm') || lower.includes('ai') || lower.includes('ml') || lower.includes('mind')) return 'psychology';
    if (lower.includes('api') || lower.includes('gateway') || lower.includes('route')) return 'api';
    return 'folder';
  };

  // Helper to get status classes
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Completed
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            On Hold
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-outline-variant/30 text-outline border border-outline-variant/40">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  // Progress bar calculation
  const getProgressStyle = (project) => {
    if (project.status === 'COMPLETED') return { width: '100%' };
    if (project.status === 'ON_HOLD') return { width: '25%' };
    if (project.status === 'ARCHIVED') return { width: '10%' };
    const percent = ((project.id * 17) % 50) + 40;
    return { width: `${percent}%` };
  };

  const getProgressPercent = (project) => {
    if (project.status === 'COMPLETED') return 100;
    if (project.status === 'ON_HOLD') return 25;
    if (project.status === 'ARCHIVED') return 10;
    return ((project.id * 17) % 50) + 40;
  };

  const getProgressColorClass = (status) => {
    if (status === 'COMPLETED') return 'bg-emerald-500';
    if (status === 'ON_HOLD') return 'bg-tertiary';
    if (status === 'ARCHIVED') return 'bg-outline';
    return 'bg-primary';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  };

  // Filter projects by status & search query
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      selectedStatus === 'ALL' || 
      project.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'NAME') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'CREATED') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      // DEFAULT: UPDATED
      const aTime = new Date(a.updatedAt || a.createdAt);
      const bTime = new Date(b.updatedAt || b.createdAt);
      return bTime - aTime;
    }
  });

  const handleOpenCreateProjectModal = () => {
    if (isOwnerOrAdmin) {
      setIsCreateProjectModalOpen(true);
    } else {
      toast.error('Only Workspace Owners and Admins can create projects');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading project directory...</p>
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* TopNavBar */}
        <header className="flex justify-between items-center h-16 px-gutter w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-lg">
            <Link to={`/workspaces/${id}`} className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label-sm text-label-sm uppercase">Back to Workspace</span>
            </Link>
          </div>
          <div className="flex items-center gap-md">
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2 flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 w-full p-lg md:p-xl space-y-xl max-w-screen-xl mx-auto overflow-y-auto custom-scrollbar pb-24 md:pb-gutter text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="font-display text-[32px] md:text-[40px] text-on-surface tracking-tight font-black mb-2">
                  Projects
                </h1>
                <p className="font-body-md text-on-surface-variant max-w-lg leading-relaxed">
                  Manage and track all engineering initiatives across the {workspace.name} workspace. Monitor real-time deployment status and team velocity.
                </p>
              </div>
              
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col md:flex-row gap-4 items-center justify-between mb-8 shadow-sm">
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 w-full md:w-80 focus-within:border-primary transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
                <input
                  className="bg-transparent border-none text-sm focus:ring-0 text-on-surface w-full placeholder-on-surface-variant outline-none"
                  placeholder="Filter projects..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-lg border border-outline-variant self-stretch md:self-auto">
                {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      selectedStatus === status
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:ring-primary focus:border-primary cursor-pointer outline-none"
                >
                  <option value="UPDATED" className="bg-[#191b23]">Last Updated</option>
                  <option value="CREATED" className="bg-[#191b23]">Creation Date</option>
                  <option value="NAME" className="bg-[#191b23]">Name</option>
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Admin Start New Initiative card */}
              {isOwnerOrAdmin && (
                <button
                  onClick={handleOpenCreateProjectModal}
                  className="project-card group bg-surface-container/30 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 hover:bg-surface-container/60 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-4 min-h-[240px] cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:scale-110 group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                    <span className="material-symbols-outlined text-[32px]">add</span>
                  </div>
                  <div className="text-center">
                    <p className="font-headline-md text-md text-on-surface-variant group-hover:text-on-surface transition-colors font-bold">
                      Start New Initiative
                    </p>
                    <p className="text-xs text-on-surface-variant/70 mt-1 max-w-[180px]">
                      Create a new repository or core engineering module
                    </p>
                  </div>
                </button>
              )}

              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => toast.success(`Selected project: ${project.name}`)}
                  className="project-card group bg-surface-container/60 rounded-xl border border-outline-variant hover:border-primary/50 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:shadow-black/40 cursor-pointer p-6 text-left"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {getProjectIcon(project.name)}
                      </span>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  <h3 className="font-headline-md text-lg text-on-surface mb-1 group-hover:text-primary transition-colors font-bold line-clamp-1">
                    {project.name}
                  </h3>
                  
                  <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                  </p>
                  
                  <div className="space-y-4 mt-auto">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-on-surface-variant">Progress</span>
                        <span className="font-label-sm text-primary font-bold">{getProgressPercent(project)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`progress-fill h-full ${getProgressColorClass(project.status)} rounded-full transition-all duration-1000`}
                          style={getProgressStyle(project)}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex -space-x-2">
                        {workspaceMembers && workspaceMembers.length > 0 ? (
                          workspaceMembers.slice(0, 3).map((member, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-container-highest overflow-hidden flex items-center justify-center font-bold text-[10px] text-on-primary-container"
                              title={member.user.name}
                            >
                              {member.user.profileImage ? (
                                <img
                                  alt={member.user.name}
                                  className="w-full h-full object-cover"
                                  src={member.user.profileImage}
                                />
                              ) : (
                                getInitials(member.user.name)
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center font-bold text-[10px]">
                            U
                          </div>
                        )}
                        {workspaceMembers && workspaceMembers.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
                            +{workspaceMembers.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Updated {formatTimeAgo(project.updatedAt || project.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            </div>
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        workspaceId={id}
        onSuccess={loadData}
        isOwnerOrAdmin={isOwnerOrAdmin}
      />
    </div>
  );
};

export default WorkspaceProjects;
