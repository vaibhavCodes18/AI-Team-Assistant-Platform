import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, logoutUser } from '../../api/authApi';
import { getWorkspaceById } from '../../api/workspaceApi';
import Sidebar from '../../components/layout/Sidebar';

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
        }
      } catch (error) {
        console.error('Failed to load workspace details:', error);
        toast.error('Failed to fetch workspace information');
        navigate('/workspaces');
      } finally {
        setLoading(false);
      }
    };
    loadData();
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading details...</p>
        </div>
      </div>
    );
  }

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

        {/* Details Content */}
        <main className="flex-1 overflow-y-auto p-gutter pb-24 md:pb-gutter custom-scrollbar">
          <div className="max-w-container-max mx-auto space-y-xl">
            {/* Header / Banner Card */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md relative overflow-hidden group">
              <div className="shimmer absolute inset-0 opacity-[0.03] pointer-events-none"></div>
              <div className="flex items-center gap-lg text-left">
                {workspace.logoUrl ? (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high">
                    <img src={workspace.logoUrl} alt={workspace.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[36px] font-bold">
                    {getInitials(workspace.name)}
                  </div>
                )}
                <div className="space-y-xs">
                  <div className="flex items-center gap-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">{workspace.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                      {workspace.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-mono text-body-md">slug: {workspace.slug}</p>
                </div>
              </div>
              <div className="text-left md:text-right text-body-md text-on-surface-variant font-label-sm uppercase space-y-xs">
                <div>Created: <span className="text-on-surface font-semibold capitalize font-body-md">{formatDate(workspace.createdAt)}</span></div>
                <div>Owner ID: <span className="text-on-surface font-semibold capitalize font-body-md">{workspace.ownerId}</span></div>
              </div>
            </div>

            {/* Description & Metadata Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Description (2 cols) */}
              <div className="lg:col-span-2 bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col justify-between text-left">
                <div className="space-y-md">
                  <h3 className="text-on-surface font-headline-md text-headline-md border-b border-outline-variant pb-xs">
                    About Workspace
                  </h3>
                  <p className="text-on-surface font-body-lg leading-relaxed">
                    {workspace.description || (
                      <span className="italic text-on-surface-variant">No description provided. You can update this workspace details from the settings panel.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Members Quick Stats (1 col) */}
              <div className="bg-surface-container border border-outline-variant rounded-xl p-lg text-left space-y-lg">
                <h3 className="text-on-surface font-headline-md text-headline-md border-b border-outline-variant pb-xs">
                  Workspace Members
                </h3>
                <div className="space-y-md">
                  <div className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-outline-variant/30">
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase">Total Members</span>
                    <span className="text-headline-md font-headline-md text-primary">{workspace.workspaceMembers?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-outline-variant/30">
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase">Status</span>
                    <span className="text-on-surface font-bold">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List Section */}
            <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden text-left">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-on-surface font-headline-md text-headline-md">Workspace Members Directory</h3>
              </div>
              <div className="divide-y divide-outline-variant">
                {workspace.workspaceMembers && workspace.workspaceMembers.length > 0 ? (
                  workspace.workspaceMembers.map((member) => (
                    <div key={member.id} className="p-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md hover:bg-surface-container-high transition-colors">
                      <div className="flex gap-md items-center">
                        {member.profileImage ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant">
                            <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-800 text-on-surface flex items-center justify-center font-bold">
                            {getInitials(member.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-on-surface font-bold font-body-lg">{member.name}</p>
                          <p className="text-on-surface-variant text-body-md truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-md flex-wrap">
                        {member.designation && (
                          <span className="px-3 py-1 bg-surface-container-low border border-outline-variant text-xs text-on-surface font-semibold rounded-lg">
                            {member.designation}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-lg text-center text-on-surface-variant italic">
                    No members in this workspace yet.
                  </div>
                )}
              </div>
            </div>
          </div>
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
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
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
    </div>
  );
};

export default WorkspaceDetails;
