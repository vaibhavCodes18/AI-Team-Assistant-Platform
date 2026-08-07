import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../api/authApi';
import { getProjectById, getProjectMembers, getProjectTickets } from '../../api/projectApi';
import { getAllWorkspaceMembers } from '../../api/workspaceApi';
import Sidebar from '../../components/layout/Sidebar';
import InviteProjectMemberModal from '../../components/project/InviteProjectMemberModal';
import ManageProjectMemberModal from '../../components/project/ManageProjectMemberModal';
import EditProjectModal from '../../components/project/EditProjectModal';
import DeleteProjectModal from '../../components/project/DeleteProjectModal';
import PriorityTicketsModal from '../../components/ticket/PriorityTicketsModal';
import CreateTicketModal from '../../components/ticket/CreateTicketModal';
import EditTicketModal from '../../components/ticket/EditTicketModal';
import DeleteTicketModal from '../../components/ticket/DeleteTicketModal';
import TicketPreviewModal from '../../components/ticket/TicketPreviewModal';
import TicketActionMenu from '../../components/ticket/TicketActionMenu';
import ProjectTasksCard from '../../components/project/ProjectTasksCard';

const ProjectDetails = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [selectedTicketForPreview, setSelectedTicketForPreview] = useState(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState(null);
  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const loadData = async () => {
    try {
      // 1. Fetch user profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) {
        setUser(userRes.data);
      }

      // 2. Fetch project details
      const projectRes = await getProjectById(projectId);
      if (projectRes?.data) {
        setProject(projectRes.data);
      } else {
        toast.error('Project not found');
        navigate(`/workspaces/${id}/projects`);
        return;
      }

      // 2.5 Fetch workspace members
      try {
        const wsMembersRes = await getAllWorkspaceMembers(id);
        if (wsMembersRes?.data) {
          setWorkspaceMembers(wsMembersRes.data);
        }
      } catch (err) {
        console.error('Failed to load workspace members:', err);
      }

      // 3. Fetch project members
      try {
        const membersRes = await getProjectMembers(projectId);
        if (membersRes?.data) {
          setMembers(membersRes.data);
        }
      } catch (err) {
        console.error('Failed to load project members:', err);
      }

      // 4. Fetch project tickets
      try {
        const ticketsRes = await getProjectTickets(projectId);
        if (ticketsRes?.data) {
          setTickets(ticketsRes.data);
        }
      } catch (err) {
        console.error('Failed to load project tickets:', err);
      }

    } catch (error) {
      console.error('Failed to load project overview data:', error);
      toast.error('Failed to load page information');
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

  // Helper to map project status to progress
  const getProjectProgressInfo = () => {
    if (!project) return { percent: 0, label: 'No Tickets', date: 'N/A', startDate: 'N/A', deadline: 'N/A', status: 'ACTIVE' };

    const formattedStartDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    const formattedDeadline = project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    const dateStr = project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A';

    let percent = 0;
    let label = '0 Tickets Resolved';
    let dateLabel = project.deadline ? `Deadline: ${dateStr}` : 'No Deadline';

    if (tickets.length > 0) {
      const total = tickets.length;
      const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      percent = Math.round((resolved / total) * 100);
      label = `${resolved} of ${total} Tickets Resolved`;
      dateLabel = `Tickets Resolution Progress`;
    } else {
      switch (project.status) {
        case 'COMPLETED':
          percent = 100;
          label = 'Project Completed';
          dateLabel = dateStr !== 'N/A' ? `Completed: ${dateStr}` : 'Completed';
          break;
        case 'ON_HOLD':
          percent = 0;
          label = 'Project On Hold';
          dateLabel = 'On Hold';
          break;
        case 'ARCHIVED':
          percent = 0;
          label = 'Project Archived';
          dateLabel = 'Archived';
          break;
        case 'ACTIVE':
        default:
          percent = 0;
          label = '0 Tickets Resolved';
          dateLabel = dateStr !== 'N/A' ? `Deadline: ${dateStr}` : 'No Deadline';
          break;
      }
    }

    return {
      percent,
      label,
      date: dateLabel,
      startDate: formattedStartDate,
      deadline: formattedDeadline,
      status: project.status
    };
  };

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

const getTicketStatusBadgeClass = (status) => {
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

const getTicketTypeBadgeClass = (type) => {
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
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };
  const formatType = (type) => {
    if (!type) return 'Bug';
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const progressInfo = getProjectProgressInfo();

  const currentUserWorkspaceMember = workspaceMembers.find(m => m.user?.id === user?.id);
  const currentUserProjectMember = members.find(m => m.user?.id === user?.id);
  const canUpdateProject = 
    currentUserWorkspaceMember?.role === 'OWNER' || 
    currentUserWorkspaceMember?.role === 'ADMIN' || 
    currentUserProjectMember?.role === 'PROJECT_ADMIN';

  const canManageTickets = canUpdateProject;


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Determine lists to render
  const renderedMembers = members;
  const renderedTickets = tickets.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority || 'MEDIUM',
    type: t.type || 'FEATURE',
    status: t.status || 'OPEN',
    dueDate: t.dueDate,
    reporter: t.reporter,
    assignedUserName: t.reporter?.name || null,
    assignedUserProfileImage: t.reporter?.profileImage || null,
    code: `#TCK-${t.id}`
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Sidebar - do not change */}
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        {/* TopNavBar Anchor */}
        <header className="h-16 w-full border-b border-outline-variant flex justify-between items-center px-gutter sticky top-0 z-40 bg-surface/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-6">
            <Link to={`/workspaces/${id}/projects`} className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors" title="Back to Projects">
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_back</span>
            </Link>
            <h1 className="font-headline-md text-on-surface font-bold text-lg md:text-xl flex items-center gap-2">
              <span>{project?.name || 'Enterprise CRM Integration'}</span>
              {canUpdateProject && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                    title="Edit Project"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-1 hover:bg-error-container/20 rounded text-error hover:text-error-container transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                    title="Delete Project"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </h1>
            <div className="hidden md:flex gap-4">
              <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Docs</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">API</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Community</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full cursor-pointer" onClick={() => toast('Dark mode toggled (mock)')}>dark_mode</span>
              <span className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full cursor-pointer" onClick={() => toast('Help Center (mock)')}>help_outline</span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <button className="text-on-surface-variant hover:text-on-surface font-medium hidden sm:inline-block" onClick={() => toast('Feedback sent!')}>Feedback</button>
            <Link 
              to={`/workspaces/${id}/projects/${projectId}/chat`}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3.5 py-1.5 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer text-xs md:text-sm"
              title="Open Project Chat & Channels"
            >
              <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              <span>Project Chat</span>
            </Link>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity ring-offset-2 focus:ring-2 focus:ring-primary cursor-pointer text-xs md:text-sm"
            >
              Invite Member
            </button>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-outline flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-lg lg:p-xl custom-scrollbar text-left">
          {/* Hero Stats Row (Bento Grid Style) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg mb-lg">
            {/* Project Progress Card */}
            <div className="md:col-span-8 glass-panel p-lg rounded-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[120px]">trending_up</span>
              </div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-on-surface-variant font-medium">Project Milestone</h3>
                      {canUpdateProject && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                            title="Edit Project"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-1 hover:bg-error-container/20 rounded text-error hover:text-error-container transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none outline-none"
                            title="Delete Project"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="font-headline-md text-on-surface text-lg md:text-xl font-bold">
                      {project?.description ? project.description : 'System Architecture Validation'}
                    </p>
                    {/* Dynamic Metadata from Endpoint Response */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                        <span>Start: {progressInfo.startDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-tertiary">event_busy</span>
                        <span>Deadline: {progressInfo.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">info</span>
                        <span>Status: <span className="text-primary font-bold uppercase">{progressInfo.status || 'ACTIVE'}</span></span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-secondary-container text-primary font-label-sm px-3 py-1 rounded-full text-xs">
                    {progressInfo.label}
                  </span>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-on-surface font-headline-md text-2xl font-bold">{progressInfo.percent}%</span>
                    <span className="text-on-surface-variant text-xs">{progressInfo.date}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all duration-1000"
                      style={{ width: `${progressInfo.percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Checklist - Dynamic based on tickets */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 border-t border-outline-variant/30 pt-4">
                {tickets.length > 0 ? (
                  tickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className={`material-symbols-outlined text-sm ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'text-primary' : 'text-outline'}`}>
                        {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="truncate max-w-[150px]" title={ticket.title}>{ticket.title}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-on-surface-variant italic">No tickets created for this project yet.</span>
                )}
              </div>
            </div>

            {/* Team Quick View */}
            <div className="md:col-span-4 glass-panel p-lg rounded-xl flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-[20px] text-on-surface font-bold">Team</h3>
                  <button className="text-primary text-sm hover:underline cursor-pointer bg-transparent border-none" onClick={() => toast('Members management available via Invite button')}>Manage</button>
                </div>
                <div className="space-y-4 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                  {renderedMembers.map((member, index) => {
                    
                    const memberName = member.user?.name || 'Project Collaborator';
                    const memberDesignation = member.user?.designation || 'Engineer';
                    const profileImg = member.user?.profileImage;
                    const isOnline = member.online !== undefined ? member.online : index < 2;
                    const isSelf = member.user?.id === user?.id;

                    const projectRole = member.role;
                    
                    const formatRoleLabel = (role) => {
                      if (!role) return 'Member';
                      if (role === 'PROJECT_ADMIN') return 'Project Admin';
                      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
                    };

                    return (
                      <div key={member.id || index} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden flex items-center justify-center bg-secondary-container text-on-secondary-container font-semibold text-sm">
                              {profileImg ? (
                                <img alt={memberName} className="w-full h-full object-cover" src={profileImg} />
                              ) : (
                                getInitials(memberName)
                              )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${isOnline ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate flex items-center gap-xs">
                              {memberName}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate">
                              {memberDesignation} • {formatRoleLabel(projectRole)}
                            </p>
                          </div>
                        </div>
                        {isSelf ? (
                          <span className="text-[10px] text-primary font-semibold px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                            You
                          </span>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(member);
                              setIsManageModalOpen(true);
                            }}
                            className="p-xs hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center shrink-0 cursor-pointer bg-transparent border-none"
                            title="Manage Member"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={() => navigate(`/workspaces/${id}/projects/${projectId}/members`)}
                className="mt-6 w-full py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
              >
                View All {renderedMembers.length} Members
              </button>
            </div>
          </div>

          {/* Second Row: Tickets & Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Open Tickets List */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">confirmation_number</span>
                  <h3 className="font-headline-md text-[20px] text-on-surface font-bold">Priority Tickets</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">Sorted by Severity</span>
                  <span 
                    className="material-symbols-outlined text-lg text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors" 
                    onClick={() => navigate(`/workspaces/${id}/projects/${projectId}/tickets`)}
                    title="View & Filter All Tickets"
                  >
                    filter_list
                  </span>
                </div>
              </div>
              {renderedTickets.length > 0 ? (
                <>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left min-w-[400px]">
                      <thead className="text-xs text-on-surface-variant border-b border-outline-variant bg-surface-container-lowest">
                        <tr>
                          <th className="px-lg py-3 font-medium">Issue</th>
                          <th className="px-lg py-3 font-medium">Status</th>
                          <th className="px-lg py-3 font-medium">Priority</th>
                          <th className="px-lg py-3 font-medium">Type</th>
                          <th className="px-lg py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {renderedTickets.slice(0, 3).map((ticket, index) => {
                          return (
                            <tr 
                              key={ticket.id || index} 
                              className="hover:bg-surface-container-high transition-colors cursor-pointer"
                              onClick={() => setSelectedTicketForPreview(ticket)}
                            >
                              <td className="px-lg py-4">
                                <p className="text-sm text-on-surface font-medium line-clamp-1">{ticket.title}</p>
                                <p className="text-[11px] text-on-surface-variant font-label-sm">{ticket.code}</p>
                              </td>
                              <td className="px-lg py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${getTicketStatusBadgeClass(ticket.status)}`}>
                                  {formatStatus(ticket.status)}
                                </span>
                              </td>
                              <td className="px-lg py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${getPriorityBadgeClass(ticket.priority)}`}>
                                  {formatPriority(ticket.priority)}
                                </span>
                              </td>
                              <td className="px-lg py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${getTicketTypeBadgeClass(ticket.type)}`}>
                                  {formatType(ticket.type)}
                                </span>
                              </td>
                              <td className="px-lg py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <TicketActionMenu
                                  ticket={ticket}
                                  canManageTickets={canManageTickets}
                                  onPreview={(t) => setSelectedTicketForPreview(t)}
                                  onEdit={(t) => setSelectedTicketForEdit(t)}
                                  onDelete={(t) => setSelectedTicketForDelete(t)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-surface-container-lowest text-center">
                    <button 
                      className="text-primary text-sm font-medium hover:underline cursor-pointer bg-transparent border-none outline-none" 
                      onClick={() => navigate(`/workspaces/${id}/projects/${projectId}/tickets`)}
                    >
                      View All Priority Tickets ({renderedTickets.length})
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[180px]">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">confirmation_number</span>
                  <p className="text-on-surface font-medium text-sm">No Tickets Found</p>
                  <p className="text-on-surface-variant text-xs mt-1">There are no tickets created for this project yet.</p>
                </div>
              )}
            </div>

            {/* Project Tasks Component */}
            <ProjectTasksCard projectId={projectId}/>
          </div>

          {/* Dynamic Footer/Status Row */}
          <div className="mt-lg border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Live Connection to SAP CRM
              </div>
              <div className="h-4 w-[1px] bg-outline-variant"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history</span>
                Last sync: 4 minutes ago
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p>Environment: <span className="text-on-surface font-medium">Staging-02</span></p>
              <p>Uptime: <span className="text-on-surface font-medium">99.98%</span></p>
            </div>
          </div>
        </div>
      </main>

      {/* Contextual FAB - Anchor logic: Home/Dashboard intent */}
      {canManageTickets && (
        <button 
          onClick={() => setIsCreateTicketModalOpen(true)}
          className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
          {/* Tooltip */}
          <span className="absolute right-16 bg-surface-container border border-outline-variant px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Quick Create Ticket
          </span>
        </button>
      )}

      {/* Project Invite Member Modal */}
      <InviteProjectMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
        onSuccess={loadData}
      />

      {/* Project Manage Member Modal */}
      <ManageProjectMemberModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        projectId={projectId}
        currentUserRoleInWorkspace={workspaceMembers.find(m => m.user?.id === user?.id)?.role}
        currentUserRoleInProject={members.find(m => m.user?.id === user?.id)?.role}
        onSuccess={loadData}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onSuccess={loadData}
        onDeleteClick={() => {
          setIsEditModalOpen(false);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
        workspaceId={id}
      />

      {/* Priority Tickets Modal */}
      <PriorityTicketsModal
        isOpen={isTicketsModalOpen}
        onClose={() => setIsTicketsModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
        tickets={tickets}
        canManageTickets={canManageTickets}
        onSuccess={loadData}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
        canCreateTicket={canManageTickets}
        onSuccess={loadData}
      />

      {/* Ticket Preview Modal */}
      <TicketPreviewModal
        isOpen={!!selectedTicketForPreview}
        onClose={() => setSelectedTicketForPreview(null)}
        ticket={selectedTicketForPreview}
        canManageTickets={canManageTickets}
        onEditClick={(t) => setSelectedTicketForEdit(t)}
        onDeleteClick={(t) => setSelectedTicketForDelete(t)}
      />

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={!!selectedTicketForEdit}
        onClose={() => setSelectedTicketForEdit(null)}
        ticket={selectedTicketForEdit}
        onSuccess={loadData}
      />

      {/* Delete Ticket Modal */}
      <DeleteTicketModal
        isOpen={!!selectedTicketForDelete}
        onClose={() => setSelectedTicketForDelete(null)}
        ticket={selectedTicketForDelete}
        onSuccess={loadData}
      />
    </div>
  );
};

export default ProjectDetails;
