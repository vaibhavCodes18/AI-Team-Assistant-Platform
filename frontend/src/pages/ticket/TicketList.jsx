import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../api/authApi';
import { getProjectById, getProjectMembers, getProjectTickets } from '../../api/projectApi';
import { getAllWorkspaceMembers } from '../../api/workspaceApi';
import Sidebar from '../../components/layout/Sidebar';
import CreateTicketModal from '../../components/ticket/CreateTicketModal';
import EditTicketModal from '../../components/ticket/EditTicketModal';
import DeleteTicketModal from '../../components/ticket/DeleteTicketModal';
import TicketPreviewModal from '../../components/ticket/TicketPreviewModal';
import TicketActionMenu from '../../components/ticket/TicketActionMenu';

const TicketList = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [members, setMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketForPreview, setSelectedTicketForPreview] = useState(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState(null);
  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState(null);

  const loadData = async () => {
    try {
      // 1. User Profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) setUser(userRes.data);

      // 2. Project info
      const projectRes = await getProjectById(projectId);
      if (projectRes?.data) {
        setProject(projectRes.data);
      } else {
        toast.error('Project not found');
        navigate(`/workspaces/${id}/projects`);
        return;
      }

      // 3. Workspace members
      try {
        const wsMembersRes = await getAllWorkspaceMembers(id);
        if (wsMembersRes?.data) setWorkspaceMembers(wsMembersRes.data);
      } catch (err) {
        console.error('Failed to load workspace members:', err);
      }

      // 4. Project members
      try {
        const membersRes = await getProjectMembers(projectId);
        if (membersRes?.data) setMembers(membersRes.data);
      } catch (err) {
        console.error('Failed to load project members:', err);
      }

      // 5. Project tickets
      const ticketsRes = await getProjectTickets(projectId);
      if (ticketsRes?.data) {
        setTickets(ticketsRes.data);
      } else if (Array.isArray(ticketsRes)) {
        setTickets(ticketsRes);
      }
    } catch (error) {
      console.error('Failed to load project tickets data:', error);
      toast.error('Failed to load tickets');
      navigate(`/workspaces/${id}/projects/${projectId}`);
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

  // Authorization check
  const currentUserWsRole = workspaceMembers.find(
    (m) => (m.user?.id || m.userId) === user?.id
  )?.role;

  const currentProjectMember = members.find(
    (m) => (m.user?.id || m.userId) === user?.id
  );

  const canManageTickets =
    currentUserWsRole === 'OWNER' ||
    currentUserWsRole === 'ADMIN' ||
    currentProjectMember?.role === 'PROJECT_ADMIN';

  // Badge helpers
  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
      case 'RESOLVED':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toUpperCase()) {
      case 'BUG':
        return 'bg-pink-500/10 text-pink-400 border border-pink-500/30';
      case 'FEATURE':
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/30';
      case 'IMPROVEMENT':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'SUPPORT':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/30';
      case 'DOCUMENTATION':
        return 'bg-lime-500/10 text-lime-400 border border-lime-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const formatPriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const formatStatus = (status) => {
    if (!status) return 'Open';
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatType = (type) => {
    if (!type) return 'Feature';
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(t.id).includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  return (
    <div className="flex h-screen bg-background text-on-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        {/* Header Bar */}
        <header className="p-lg border-b border-outline-variant bg-surface flex flex-wrap justify-between items-center gap-md shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="space-y-1 min-w-0 text-left">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
              <Link to="/workspaces" className="hover:text-primary transition-colors">Workspaces</Link>
              <span>/</span>
              <Link to={`/workspaces/${id}`} className="hover:text-primary transition-colors">Workspace</Link>
              <span>/</span>
              <Link to={`/workspaces/${id}/projects`} className="hover:text-primary transition-colors">Projects</Link>
              <span>/</span>
              <Link to={`/workspaces/${id}/projects/${projectId}`} className="hover:text-primary transition-colors">
                {project?.name || 'Project'}
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">Tickets</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                Project Tickets
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
                {filteredTickets.length} {filteredTickets.length === 1 ? 'Ticket' : 'Tickets'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/workspaces/${id}/projects/${projectId}`}
              className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-high font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer no-underline"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Project
            </Link>

            {canManageTickets && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Create Ticket
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-lg space-y-lg flex-1">
          {/* Controls Bar: Search & Filters */}
          <div className="p-md rounded-2xl bg-surface-container border border-outline-variant/60 shadow-md space-y-md">
            <div className="flex flex-wrap items-center justify-between gap-md">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search tickets by title, description, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface bg-transparent border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Select Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Priority Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Priority:</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="ALL" className="bg-[#191b23]">All Priorities</option>
                    <option value="CRITICAL" className="bg-[#191b23]">Critical</option>
                    <option value="HIGH" className="bg-[#191b23]">High</option>
                    <option value="MEDIUM" className="bg-[#191b23]">Medium</option>
                    <option value="LOW" className="bg-[#191b23]">Low</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant">Type:</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="ALL" className="bg-[#191b23]">All Types</option>
                    <option value="BUG" className="bg-[#191b23]">Bug</option>
                    <option value="FEATURE" className="bg-[#191b23]">Feature</option>
                    <option value="IMPROVEMENT" className="bg-[#191b23]">Improvement</option>
                    <option value="SUPPORT" className="bg-[#191b23]">Support</option>
                    <option value="DOCUMENTATION" className="bg-[#191b23]">Documentation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-t border-outline-variant/40 pt-md text-xs">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer border-none shrink-0 ${
                    statusFilter === st
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {st === 'ALL' ? 'All Statuses' : formatStatus(st)}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Grid / List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-on-surface-variant">Loading tickets...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md text-left">
              {filteredTickets.map((t) => {
                const reporterName = t.reporterDetails?.name || t.reporter?.name || t.assignedUserName || 'Unassigned';
                const reporterImage = t.reporterDetails?.profileImage || t.reporter?.profileImage || t.assignedUserProfileImage;

                return (
                  <div
                    key={t.id}
                    className="p-lg rounded-2xl bg-surface-container border border-outline-variant/60 hover:border-primary/50 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top Row: Ticket ID, Type & Menu */}
                    <div className="flex items-start justify-between gap-2 mb-md">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded">
                          #TCK-{t.id}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getTypeBadgeClass(t.type)}`}>
                          {formatType(t.type)}
                        </span>
                      </div>

                      <TicketActionMenu
                        ticket={t}
                        canManageTickets={canManageTickets}
                        onPreview={(ticketObj) => setSelectedTicketForPreview(ticketObj)}
                        onEdit={(ticketObj) => setSelectedTicketForEdit(ticketObj)}
                        onDelete={(ticketObj) => setSelectedTicketForDelete(ticketObj)}
                      />
                    </div>

                    {/* Middle: Title & Description */}
                    <div
                      className="space-y-xs cursor-pointer flex-1 mb-lg"
                      onClick={() => setSelectedTicketForPreview(t)}
                    >
                      <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {t.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {t.description || 'No detailed description provided.'}
                      </p>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="pt-md border-t border-outline-variant/40 space-y-md">
                      {/* Badges Row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getStatusBadgeClass(t.status)}`}>
                          {formatStatus(t.status)}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getPriorityBadgeClass(t.priority)}`}>
                          {formatPriority(t.priority)}
                        </span>
                      </div>

                      {/* User & Date Row */}
                      <div className="flex items-center justify-between text-xs text-on-surface-variant gap-2 pt-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-primary-container text-on-primary-container font-bold text-[10px] flex items-center justify-center shrink-0">
                            {reporterImage ? (
                              <img src={reporterImage} alt={reporterName} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(reporterName)
                            )}
                          </div>
                          <span className="truncate max-w-[120px] font-medium text-on-surface">
                            {reporterName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-sm text-outline">event</span>
                          <span>
                            {t.dueDate
                              ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'No Due Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] rounded-2xl bg-surface-container border border-outline-variant/60 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">confirmation_number</span>
              <h3 className="text-lg font-bold text-on-surface">No Tickets Found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                There are no tickets matching your current search or filter criteria. Try resetting filters or create a new ticket.
              </p>
              {canManageTickets && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg shadow-md hover:bg-primary/90 transition-all cursor-pointer border-none"
                >
                  Create Ticket
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={projectId}
          projectName={project?.name}
          canCreateTicket={canManageTickets}
          onSuccess={loadData}
        />
      )}

      {/* Ticket Preview Modal */}
      {selectedTicketForPreview && (
        <TicketPreviewModal
          isOpen={!!selectedTicketForPreview}
          onClose={() => setSelectedTicketForPreview(null)}
          ticket={selectedTicketForPreview}
          canManageTickets={canManageTickets}
          onEditClick={(ticketObj) => setSelectedTicketForEdit(ticketObj)}
          onDeleteClick={(ticketObj) => setSelectedTicketForDelete(ticketObj)}
        />
      )}

      {/* Edit Ticket Modal */}
      {selectedTicketForEdit && (
        <EditTicketModal
          isOpen={!!selectedTicketForEdit}
          onClose={() => setSelectedTicketForEdit(null)}
          ticket={selectedTicketForEdit}
          onSuccess={loadData}
        />
      )}

      {/* Delete Ticket Modal */}
      {selectedTicketForDelete && (
        <DeleteTicketModal
          isOpen={!!selectedTicketForDelete}
          onClose={() => setSelectedTicketForDelete(null)}
          ticket={selectedTicketForDelete}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default TicketList;
