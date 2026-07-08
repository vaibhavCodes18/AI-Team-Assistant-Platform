import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, logoutUser } from '../../api/authApi';
import { getWorkspaceById, updateWorkspace, deleteWorkspace, inviteMember } from '../../api/workspaceApi';
import Sidebar from '../../components/layout/Sidebar';

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  // Settings States
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });
  const [updating, setUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // Invite Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    userId: '',
    role: 'MEMBER'
  });

  // Quick Controls Interactive States
  const [visibilityPublic, setVisibilityPublic] = useState(true);
  const [aiInsightsActive, setAiInsightsActive] = useState(true);

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
        const ws = workspaceRes.data;
        setWorkspace(ws);
        setEditForm({
          name: ws.name || '',
          description: ws.description || ''
        });
      } else {
        toast.error('Workspace not found');
        navigate('/workspaces');
      }
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      setUpdating(true);
      const res = await updateWorkspace(id, {
        name: editForm.name,
        description: editForm.description,
        slug: workspace.slug, // preserve existing slug
        logoUrl: workspace.logoUrl
      });
      if (res?.data) {
        toast.success('Workspace updated successfully!');
        setWorkspace(res.data);
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
      toast.error(error.response?.data?.message || 'Failed to update workspace');
    } finally {
      setUpdating(false);
    }
  };

  const handleArchiveWorkspace = async () => {
    if (!window.confirm('Are you sure you want to archive/delete this workspace? This action cannot be undone.')) {
      return;
    }

    try {
      setArchiving(true);
      await deleteWorkspace(id);
      toast.success('Workspace successfully archived!');
      navigate('/workspaces');
    } catch (error) {
      console.error('Failed to archive workspace:', error);
      toast.error(error.response?.data?.message || 'Failed to archive workspace');
      setArchiving(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.userId.trim()) {
      toast.error('User ID is required');
      return;
    }

    try {
      setInviting(true);
      const res = await inviteMember(id, {
        userId: parseInt(inviteForm.userId),
        role: inviteForm.role
      });
      if (res?.data) {
        toast.success('Member invited successfully!');
        setIsInviteModalOpen(false);
        setInviteForm({ userId: '', role: 'MEMBER' });
        // Reload details to update directory
        await loadData();
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast.error(error.response?.data?.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
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
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-lg text-left">
            <div className="space-y-sm">
              <div className="flex items-center gap-sm text-primary">
                <span className="material-symbols-outlined text-[18px]">hub</span>
                <span className="font-label-sm text-label-sm tracking-[0.1em] uppercase">Core Unit</span>
              </div>
              <h1 className="font-display text-[32px] md:text-[40px] text-on-surface tracking-tight font-black">{workspace.name}</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                {workspace.description || <span className="italic">No description provided. You can add one below in settings.</span>}
              </p>
            </div>
            <div className="flex gap-md pb-xs">
              <button 
                onClick={() => toast.success('Logs are up-to-date')}
                className="px-lg py-sm border border-outline-variant rounded-xl font-body-md font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                View Logs
              </button>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="px-lg py-sm bg-primary text-on-primary rounded-xl font-body-md font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Invite Member
              </button>
            </div>
          </header>

          {/* Stats & Visual Bento Grid */}
          <section className="grid grid-cols-12 gap-lg text-left">
            {/* Main Stat 1: Members */}
            <div className="col-span-12 md:col-span-4 glass-card p-xl rounded-xl group hover:border-primary/45 transition-all duration-300">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm bg-secondary-container rounded-lg">
                  <span className="material-symbols-outlined text-on-secondary-container">groups</span>
                </div>
                <span className="text-xs font-label-sm text-primary">+1 this week</span>
              </div>
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">Total Members</h3>
              <div className="flex items-baseline gap-sm">
                <span className="font-display text-[32px] font-black text-on-surface">{workspace.workspaceMembers?.length || 0}</span>
                <span className="text-on-surface-variant opacity-60">Engineers</span>
              </div>
            </div>

            {/* Main Stat 2: Projects */}
            <div className="col-span-12 md:col-span-4 glass-card p-xl rounded-xl group hover:border-primary/45 transition-all duration-300">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm bg-primary-container rounded-lg">
                  <span className="material-symbols-outlined text-on-primary-container">folder_zip</span>
                </div>
                <span className="text-xs font-label-sm text-tertiary">Nominal</span>
              </div>
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">Active Projects</h3>
              <div className="flex items-baseline gap-sm">
                <span className="font-display text-[32px] font-black text-on-surface">36</span>
                <span className="text-on-surface-variant opacity-60">Repositories</span>
              </div>
            </div>

            {/* Main Stat 3: Performance/Documents */}
            <div className="col-span-12 md:col-span-4 glass-card p-xl rounded-xl group hover:border-primary/45 transition-all duration-300">
              <div className="flex justify-between items-start mb-lg">
                <div className="p-sm bg-tertiary-container rounded-lg">
                  <span className="material-symbols-outlined text-on-tertiary-container">monitoring</span>
                </div>
                <span className="text-xs font-label-sm text-on-tertiary-container">99.9% Uptime</span>
              </div>
              <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">System Health</h3>
              <div className="flex items-baseline gap-sm">
                <span className="font-display text-[32px] font-black text-on-surface flex items-center gap-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Nominal
                </span>
              </div>
            </div>

            {/* Recent Activity (Asymmetric Larger Card) */}
            <div className="col-span-12 lg:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
                <h2 className="font-headline-md text-headline-md text-on-surface">System Activity</h2>
                <button 
                  onClick={() => toast.success('Timeline is fully loaded')}
                  className="text-primary font-label-sm text-label-sm hover:underline"
                >
                  View Global Timeline
                </button>
              </div>
              <div className="p-lg flex-1 overflow-y-auto custom-scrollbar space-y-lg">
                {/* Activity Item 1 */}
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
                    <span className="material-symbols-outlined text-[16px] text-primary">call_merge</span>
                  </div>
                  <div>
                    <p className="text-on-surface"><span className="font-semibold text-primary">Alex Chen</span> merged <code class="bg-surface-container-highest px-1 rounded text-primary text-xs">feature/auth-provider</code> into <code class="bg-surface-container-highest px-1 rounded text-xs">main</code></p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">12 minutes ago • Core-Auth Project</p>
                  </div>
                </div>
                {/* Activity Item 2 */}
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full border border-error/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
                    <span className="material-symbols-outlined text-[16px] text-error">error</span>
                  </div>
                  <div>
                    <p className="text-on-surface"><span className="font-semibold text-error">System Alert:</span> High latency detected in <span class="underline decoration-error/40">US-East-1 Edge Nodes</span></p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">45 minutes ago • Infrastructure</p>
                  </div>
                </div>
                {/* Activity Item 3 */}
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full border border-tertiary/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">edit_note</span>
                  </div>
                  <div>
                    <p className="text-on-surface"><span className="font-semibold text-on-surface">Sarah Miller</span> updated documentation for <span class="italic text-tertiary">"Quantum API Interface"</span></p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">2 hours ago • API Docs</p>
                  </div>
                </div>
                {/* Activity Item 4 */}
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center shrink-0 mt-1 bg-surface-container">
                    <span className="material-symbols-outlined text-[16px] text-primary">person_add</span>
                  </div>
                  <div>
                    <p className="text-on-surface"><span className="font-semibold">Jordan Blake</span> was added as a Maintainer</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">5 hours ago • Team Management</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Settings / Controls (Taller Side Card) */}
            <div className="col-span-12 lg:col-span-4 glass-card p-lg rounded-xl flex flex-col justify-between min-h-[400px]">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Quick Controls</h2>
                <div className="space-y-md">
                  <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">visibility</span>
                      <span className="font-body-md">Visibility: {visibilityPublic ? 'Public' : 'Private'}</span>
                    </div>
                    <button 
                      onClick={() => setVisibilityPublic(!visibilityPublic)}
                      className={`w-10 h-6 rounded-full relative transition-all ${visibilityPublic ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${visibilityPublic ? 'left-[18px]' : 'left-[2px]'}`}></span>
                    </button>
                  </div>
                  <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">history</span>
                      <span className="font-body-md">Retention: 30 Days</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_right</span>
                  </div>
                  <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-tertiary">smart_toy</span>
                      <span className="font-body-md">AI Insights: {aiInsightsActive ? 'Active' : 'Disabled'}</span>
                    </div>
                    <button 
                      onClick={() => setAiInsightsActive(!aiInsightsActive)}
                      className={`w-10 h-6 rounded-full relative transition-all ${aiInsightsActive ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${aiInsightsActive ? 'left-[18px]' : 'left-[2px]'}`}></span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-md p-md rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-sm mb-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                  <span className="font-label-sm text-primary uppercase font-bold">Optimization Suggestion</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Three projects in this workspace haven't been accessed in 14 days. Consider archiving them to reduce surface clutter.
                </p>
              </div>
            </div>
          </section>

          {/* Member Management & Workspace Settings Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-xl text-left">
            {/* Member Management Card */}
            <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
                <h3 className="font-headline-md text-headline-md text-on-surface">Member Management</h3>
                <div className="flex gap-sm">
                  <button onClick={() => toast.success('Search ready')} className="p-sm text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">search</span>
                  </button>
                  <button onClick={() => toast.success('Filter ready')} className="p-sm text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-outline-variant overflow-y-auto custom-scrollbar flex-1">
                {workspace.workspaceMembers && workspace.workspaceMembers.length > 0 ? (
                  workspace.workspaceMembers.map((member) => (
                    <div key={member.id} className="px-lg py-md flex items-center justify-between hover:bg-surface-container-highest transition-colors cursor-pointer">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full border border-outline-variant bg-surface-container-low overflow-hidden flex items-center justify-center font-bold text-sm">
                          {member.profileImage ? (
                            <img className="w-full h-full object-cover" alt={member.name} src={member.profileImage} />
                          ) : (
                            getInitials(member.name)
                          )}
                        </div>
                        <div>
                          <p className="font-body-md font-semibold text-on-surface">{member.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            {member.designation || 'Engineer'} • Member
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
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
                  onClick={() => toast.success(`Viewing all ${workspace.workspaceMembers?.length || 0} members`)}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
                  Manage All {workspace.workspaceMembers?.length || 0} Members
                </button>
              </div>
            </div>

            {/* Workspace Settings Summary */}
            <div className="glass-card rounded-xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-lg border-b border-outline-variant bg-surface-container/50">
                <h3 className="font-headline-md text-headline-md text-on-surface">Workspace Settings</h3>
              </div>
              <form onSubmit={handleUpdateSubmit} className="p-lg flex-1 flex flex-col justify-between space-y-md">
                <div className="space-y-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Workspace Name</label>
                  <div className="flex items-center gap-md">
                    <input 
                      className="flex-1 h-10 px-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="h-10 text-primary font-body-md font-semibold px-md border border-primary/20 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Description</label>
                  <textarea 
                    className="w-full p-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none" 
                    rows="3"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-md pt-sm">
                  <button 
                    type="button"
                    onClick={() => toast.success('Workspace data exported')}
                    className="flex-1 h-12 bg-surface-container-highest text-on-surface rounded-xl font-semibold border border-outline-variant hover:bg-surface-bright transition-colors flex items-center justify-center gap-sm text-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                    Export Data
                  </button>
                  <button 
                    type="button"
                    onClick={handleArchiveWorkspace}
                    disabled={archiving}
                    className="flex-1 h-12 bg-error-container text-on-error-container rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-sm text-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                    {archiving ? 'Archiving...' : 'Archive'}
                  </button>
                </div>
              </form>
            </div>
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
          onClick={() => setIsInviteModalOpen(true)}
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

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-left">
              <h3 className="text-headline-md font-bold text-on-surface">Invite Member</h3>
              <p className="text-body-md text-on-surface-variant mt-xs">Add a new collaborator to the {workspace.name} workspace.</p>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="space-y-md text-left">
              <div className="space-y-xs">
                <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="inviteUserId">
                  User ID
                </label>
                <input 
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                  id="inviteUserId"
                  type="number"
                  required
                  placeholder="e.g. 42"
                  value={inviteForm.userId}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, userId: e.target.value }))}
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
                  onClick={() => setIsInviteModalOpen(false)}
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
      )}
    </div>
  );
};

export default WorkspaceDetails;
