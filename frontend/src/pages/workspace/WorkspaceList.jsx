import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, logoutUser } from '../../api/authApi';
import Sidebar from '../../components/layout/Sidebar';
import { getAllWorkspaces } from '../../api/workspaceApi';
import CreateWorkspace from '../../components/workspace/CreateWorkspace';

const WorkspaceList = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await fetchUserProfile();  
      const allWorkspaces = await getAllWorkspaces();
      if (allWorkspaces?.data) {
        setWorkspaces(allWorkspaces.data);
      }
      if (data?.data) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to load profile or workspaces:', error);
      toast.error('Failed to fetch profile information');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [navigate]);

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

  const getWorkspaceColor = (id) => {
    const colors = [
      'bg-primary/10 border-primary/20 text-primary',
      'bg-tertiary/10 border-tertiary/20 text-tertiary',
      'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      'bg-secondary-container text-on-secondary-container'
    ];
    return colors[id % colors.length];
  };



  // Filter workspaces by search query
  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* SideNavBar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-lg">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input 
                className="bg-surface-container border-none text-on-surface text-body-md rounded-lg py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary focus:ring-offset-2 ring-offset-surface outline-none transition-all" 
                placeholder="Search workspaces..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
        <main className="flex-1 overflow-y-auto p-gutter pb-24 md:pb-gutter custom-scrollbar">
          <div className="max-w-container-max mx-auto space-y-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Directory</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Workspace Directory</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                  Manage and monitor your enterprise instances. High-velocity team coordination starts with a unified overview of all active workstreams.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl font-label-sm text-label-sm flex items-center gap-2 hover:bg-surface-container-highest transition-all active:scale-95">
                  <span className="material-symbols-outlined">filter_list</span>
                  Filter
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-primary-container text-on-primary-container border border-primary/20 rounded-xl font-label-sm text-label-sm flex items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-primary-container/20"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create New Workspace
                </button>
              </div>
            </div>

            {/* Workspace Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <div 
                  key={workspace.id}
                  onClick={() => navigate(`/workspaces/${workspace.id}`)}
                  className="glass-card rounded-xl p-6 flex flex-col group relative overflow-hidden text-left bg-primary/5 border-primary/30 cursor-pointer"
                >
                  <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  

                  <div className="flex justify-between items-start mb-6">
                    {/* Logo/Icon */}
                    {workspace.logoUrl ? (
                      <div className="w-14 h-14 rounded-2xl border border-outline-variant/30 flex items-center justify-center overflow-hidden bg-surface-container">
                        <img src={workspace.logoUrl} alt={workspace.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center overflow-hidden font-bold text-headline-md font-headline-md ${getWorkspaceColor(workspace.id)}`}>
                        {getInitials(workspace.name)}
                      </div>
                    )}

                    
                  </div>

                  <div className="mb-8">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">
                      {workspace.name}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {workspace.description || <span className="italic text-on-surface-variant/70">No description provided.</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
                      <p className="font-label-sm text-[10px] text-on-surface-variant uppercase mb-1">Members</p>
                      <p className="font-headline-md text-[20px] text-on-surface">{workspace.memberCount}</p>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
                      <p className="font-label-sm text-[10px] text-on-surface-variant uppercase mb-1">Projects</p>
                      <p className="font-headline-md text-[20px] text-on-surface">{workspace.projectCount}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State / Add New Card */}
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-surface-variant text-[32px] group-hover:text-primary transition-colors">add</span>
                </div>
                <div className="text-center">
                  <h3 className="font-headline-md text-[18px] text-on-surface mb-1">Create Workspace</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Set up a new collaborative space</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation (BottomNavBar substitute for mobile view) */}
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
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center gap-1 text-on-surface-variant"
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

      {/* Create Workspace Modal Component */}
      <CreateWorkspace 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={async () => {
          const updatedWorkspaces = await getAllWorkspaces();
          if (updatedWorkspaces?.data) {
            setWorkspaces(updatedWorkspaces.data);
          }
        }}
      />
    </div>
  );
};

export default WorkspaceList;
