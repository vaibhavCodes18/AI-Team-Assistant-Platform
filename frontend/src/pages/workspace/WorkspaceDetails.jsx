import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, logoutUser } from '../../api/authApi';
import { getWorkspaceById, getAllWorkspaceMembers } from '../../api/workspaceApi';
import { getWorkspaceProjects } from '../../api/projectApi';
import Sidebar from '../../components/layout/Sidebar';
import InviteMemberModal from '../../components/workspace/InviteMemberModal';
import CreateProjectModal from '../../components/workspace/CreateProjectModal';
import ViewLogsModal from '../../components/workspace/ViewLogsModal';
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader';
import StatsBentoGrid from '../../components/workspace/StatsBentoGrid';
import SystemActivity from '../../components/workspace/SystemActivity';
import QuickControls from '../../components/workspace/QuickControls';
import MemberManagement from '../../components/workspace/MemberManagement';
import EditWorkspace from '../../components/workspace/EditWorkspace';
import RecentProjects from '../../components/workspace/RecentProjects';

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
  const [activityTrigger, setActivityTrigger] = useState(0);

  const loadData = async () => {
    try {
      // Load user profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) {
        setUser(userRes.data);
      }

      // Load workspace details
      const workspaceRes = await getWorkspaceById(id);
      const workspaceMembersRes = await getAllWorkspaceMembers(id);
      if (workspaceRes?.data) {
        setWorkspace(workspaceRes.data);
      } else {
        toast.error('Workspace not found');
        navigate('/workspaces');
      }
      if (workspaceMembersRes?.data) {
        setWorkspaceMembers(workspaceMembersRes.data);
      } else {
        toast.error('Workspace not found');
        navigate(`/workspaces/${id}`);
      }
      
      // Load workspace projects
      try {
        const projectsRes = await getWorkspaceProjects(id);
        if (projectsRes?.data) {
          setProjects(projectsRes.data);
        }
      } catch (projectError) {
        console.error('Failed to load workspace projects:', projectError);
      }
      
      setActivityTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to load workspace details:', error);
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

  const handleOpenCreateProjectModal = () => {
    if (isOwnerOrAdmin) {
      setIsCreateProjectModalOpen(true);
    } else {
      toast.error('Only Workspace Owners and Admins can create projects');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading workspace details...</p>
        </div>
      </div>
    );
  }

  const currentMemberObj = workspaceMembers?.find(m => m.user.id === user?.id);
  const currentUserRole = currentMemberObj?.role;
  const isOwnerOrAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  if (!workspace) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* SideNavBar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-lg">
            <Link to="/workspaces" className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label-sm text-label-sm uppercase">Back to Workspaces</span>
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

        {/* Workspace Content */}
        <main className="flex-1 w-full p-lg md:p-xl space-y-xl max-w-screen-xl mx-auto overflow-y-auto custom-scrollbar pb-24 md:pb-gutter">
          {/* Workspace Header */}
          <WorkspaceHeader
            workspaceName={workspace.name}
            workspaceDescription={workspace.description}
            onInviteClick={() => setIsInviteModalOpen(true)}
            onViewLogsClick={() => setIsViewLogsModalOpen(true)}
            currentUserRole={currentUserRole}
          />

          {/* Stats & Visual Bento Grid */}
          <section className="grid grid-cols-12 gap-lg text-left">
            <StatsBentoGrid memberCount={workspace?.memberCount || 0} projectCount={workspace?.projectCount || 0}/>
            <SystemActivity 
              workspaceId={id} 
              workspaceMembers={workspaceMembers} 
              onViewLogsClick={() => setIsViewLogsModalOpen(true)}
              currentUserRole={currentUserRole}
              refreshTrigger={activityTrigger}
            />
            <QuickControls />
          </section>

          {/* Recent Projects Section */}
          <RecentProjects
            workspaceId={id}
            projects={projects}
            workspaceMembers={workspaceMembers}
            onNewProjectClick={handleOpenCreateProjectModal}
            isOwnerOrAdmin={isOwnerOrAdmin}
          />

          {/* Member Management & Workspace Settings Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-xl text-left">
            <MemberManagement 
              workspaceId={id} 
              workspaceMembers={workspaceMembers} 
              onSuccess={loadData}
              currentUser={user}
            />
            <EditWorkspace
              workspace={workspace}
              onWorkspaceUpdated={(updatedWs) => {
                setWorkspace(updatedWs);
                loadData();
              }}
              currentUserRole={currentUserRole}
            />
          </section>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-outline-variant flex items-center justify-around z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link to="/workspaces" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">workspaces</span>
          <span className="text-[10px]">Workspaces</span>
        </Link>
        <button 
          onClick={() => {
            if (isOwnerOrAdmin) {
              setIsInviteModalOpen(true);
            } else {
              toast.error('Only Owners and Admins can invite members');
            }
          }}
          className={`flex flex-col items-center gap-1 ${isOwnerOrAdmin ? 'text-on-surface-variant' : 'opacity-40 cursor-not-allowed'}`}
          disabled={!isOwnerOrAdmin}
        >
          <div className="w-10 h-10 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-lg text-on-primary">
            <span className="material-symbols-outlined">add</span>
          </div>
          <span className="text-[10px]">New</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px]">Alerts</span>
        </button>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={id}
        workspaceName={workspace.name}
        onSuccess={loadData}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        workspaceId={id}
        onSuccess={loadData}
        isOwnerOrAdmin={isOwnerOrAdmin}
      />

      {/* View Logs Modal */}
      <ViewLogsModal
        isOpen={isViewLogsModalOpen}
        onClose={() => setIsViewLogsModalOpen(false)}
        workspaceId={id}
        workspaceMembers={workspaceMembers}
      />
    </div>
  );
};

export default WorkspaceDetails;
