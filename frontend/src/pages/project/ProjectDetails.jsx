import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../api/authApi';
import { getProjectById, getProjectMembers, getProjectTasks } from '../../api/projectApi';
import Sidebar from '../../components/layout/Sidebar';
import InviteProjectMemberModal from '../../components/project/InviteProjectMemberModal';

// Mock data to preserve visual completeness of the HTML template when backend list is empty
const MOCK_MEMBERS = [
  {
    id: 'mock-1',
    user: {
      name: 'Sarah Jenkins',
      profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhWHQc-2gZaeMgkWMlRZvHMxzuPigf9GGZE3rYnL2SZCJ6Jjb3TUYRzGLpnMvfBlneCmXhXguSLSsoZQQuShg0mcOQ8h5gtrYixykjCW3LfdR3ULtOuDolzMm-egQL1T3E9bmfDafqsooPojzYtPv-oSXmrzfs5LsUXMaa2v75YymTdA6JFq_eCcUXgKWnSP1u28UBh3aR2O6WOFn8743K8T-TWRRY3w-T60_pShadDFVLs3_KzjHKQs58oOKdfwkrR55V-KSDPuII',
      designation: 'Lead Architect'
    },
    role: 'OWNER',
    online: true
  },
  {
    id: 'mock-2',
    user: {
      name: 'Marcus Thorne',
      profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAv595E4LULmXn-nURc2CD65mi6rQxcaz5dG_p4EBvZ39p7phhJf0HE5VEyBPth-GhPTXGD7XQ91JO3dUQKioUbfAa2SmCguWDQZHsv0J-2kXBMgrE3n9TIBJgAc98lpJD0XC9btqr5JYBTOVljbUemvo81rORHAHfqVQ7cBLjggHhm-FmjLMpslaoIxtEb96wwDd6Q3lm2WGrCVOq5v-RFmYEY0DejA7O5GqxZV6ebzOJeg3aHyzS7UvuKErs08MDLuHXXTkvLqj5H',
      designation: 'Senior Dev'
    },
    role: 'ADMIN',
    online: true
  },
  {
    id: 'mock-3',
    user: {
      name: 'Alex Lee',
      profileImage: null,
      designation: 'Product Designer'
    },
    role: 'MEMBER',
    online: false
  }
];

const MOCK_TICKETS = [
  {
    id: 104,
    title: 'SSL Handshake Timeout',
    priority: 'CRITICAL',
    assignedUserName: 'Sarah Jenkins',
    assignedUserProfileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkoSll_hLMv9sqPfajekBx7i2uQk8Y7baNVBWQ80p9iv_ZAEbpnwIQnJ9wB1Tt1ooNHpY0J3ed5vXX-2UWUl2aHGxX8wH5dXZfvzug7ctdboheTlj3umtsTqA-TMn6vfHXJIbVJ56864pzLvc-LMEXuBrdD_UZm-L1T0FOzdyUsiBZq7v-3D0VagyrW-lJmrM3gDwQAByHkKpJr_WtbFzym4RXNxWIuyzLB5QvMalx04ShT36Fpm1E397JMFvLbkcH3DsJzLaf0Ffn',
    code: '#CRM-104'
  },
  {
    id: 92,
    title: 'Schema Mapping Error',
    priority: 'HIGH',
    assignedUserName: 'Marcus Thorne',
    assignedUserProfileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuo4rJvay_8UqIPfxPN-irE7qQO-x5mZOwMcYQZ5CjaJ18TOK_TC2F0MrgpQk5teTrZm-DjpU_cu1AfnCli2o7wK7b1Ih7Lr-8YQpdleHeWKwrVLWYHAycZsJXNAScIzQbUbkNX4MCA1q_rOryz4J4i1YeiXw7sMH3WshNnSRVPf_pnicUDqSUYsYsFhdOw2Rz5Q47CRLPbcrkQKXvV_tPr5Pv27p4EcZDzPW70cFHOtxdUZ_IS06tigtErfxFJq7y7GvarxBc7w8I',
    code: '#CRM-92'
  },
  {
    id: 88,
    title: 'Auth0 Rate Limiting',
    priority: 'MEDIUM',
    assignedUserName: null,
    assignedUserProfileImage: null,
    code: '#CRM-88'
  }
];

const ProjectDetails = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

      // 3. Fetch project members
      try {
        const membersRes = await getProjectMembers(projectId);
        if (membersRes?.data) {
          setMembers(membersRes.data);
        }
      } catch (err) {
        console.error('Failed to load project members:', err);
      }

      // 4. Fetch project tasks
      try {
        const tasksRes = await getProjectTasks(projectId, { page: 0, size: 10, sort: 'id,desc' });
        if (tasksRes?.data?.content) {
          setTasks(tasksRes.data.content);
        }
      } catch (err) {
        console.error('Failed to load project tasks:', err);
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
    if (!project) return { percent: 68, label: 'Phase 3 of 5', date: 'Estimated Completion: Oct 24', startDate: 'N/A', deadline: 'Oct 24, 2026', status: 'ACTIVE' };

    const formattedStartDate = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
    const formattedDeadline = project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 24, 2026';
    const dateStr = project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'Oct 24';

    let percent = 100;
    let label = 'Phase 3 of 5';
    let dateLabel = `Estimated Completion: ${dateStr}`;

    if (tasks.length > 0) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'DONE').length;
      percent = Math.round((completed / total) * 100);
      label = `${completed} of ${total} Tasks Done`;
      dateLabel = `Tasks Velocity Progress`;
    } else {
      switch (project.status) {
        case 'COMPLETED':
          percent = 100;
          label = 'Project Completed';
          dateLabel = `Completed: ${dateStr}`;
          break;
        case 'ON_HOLD':
          percent = 25;
          label = 'Project On Hold';
          dateLabel = 'On Hold';
          break;
        case 'ARCHIVED':
          percent = 10;
          label = 'Project Archived';
          dateLabel = 'Archived';
          break;
        case 'ACTIVE':
        default:
          percent = 68;
          label = 'Phase 3 of 5';
          dateLabel = `Estimated Completion: ${dateStr}`;
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
    const p = priority?.toUpperCase();
    if (p === 'CRITICAL') return 'bg-error-container/20 text-error';
    if (p === 'HIGH') return 'bg-tertiary-container/20 text-tertiary';
    if (p === 'MEDIUM') return 'bg-secondary-container/20 text-secondary';
    return 'bg-surface-variant text-on-surface-variant';
  };

  const formatPriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const progressInfo = getProjectProgressInfo();

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
  const renderedMembers = members.length > 0 ? members : MOCK_MEMBERS;
  const renderedTasks = tasks.length > 0 ? tasks.map(t => ({
    id: t.id,
    title: t.title,
    priority: t.priority || 'MEDIUM',
    assignedUserName: t.assignedUserName,
    assignedUserProfileImage: null,
    code: `#TSK-${t.id}`
  })) : MOCK_TICKETS;

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
            <h1 className="font-headline-md text-on-surface font-bold text-lg md:text-xl">
              {project?.name || 'Enterprise CRM Integration'}
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
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity ring-offset-2 focus:ring-2 focus:ring-primary cursor-pointer text-xs md:text-sm"
            >
              Invite Member
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name)
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
                    <h3 className="text-on-surface-variant font-medium mb-1">Project Milestone</h3>
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
              
              {/* Checklist - Dynamic based on tasks, fallback to mock */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 border-t border-outline-variant/30 pt-4">
                {tasks.length > 0 ? (
                  tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className={`material-symbols-outlined text-sm ${task.status === 'DONE' ? 'text-primary' : 'text-outline'}`}>
                        {task.status === 'DONE' ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="truncate max-w-[150px]" title={task.title}>{task.title}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                      Backend API Linked
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                      Authentication Layer
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm text-outline">radio_button_unchecked</span>
                      CRM Data Mapping
                    </div>
                  </>
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
                    if(index>=5){
                      return null;
                    }
                    const memberName = member.user?.name || 'Project Collaborator';
                    const memberDesignation = member.user?.designation || (member.role === 'OWNER' ? 'Project Owner' : member.role === 'ADMIN' ? 'Admin' : 'Collaborator');
                    const profileImg = member.user?.profileImage;
                    const isOnline = member.online !== undefined ? member.online : index < 2;

                    return (
                      <div key={member.id || index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden flex items-center justify-center bg-secondary-container text-on-secondary-container font-semibold text-sm shrink-0">
                          {profileImg ? (
                            <img alt={memberName} className="w-full h-full object-cover" src={profileImg} />
                          ) : (
                            getInitials(memberName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{memberName}</p>
                          <p className="text-xs text-on-surface-variant truncate">{memberDesignation}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={() => toast(`Total members: ${renderedMembers.length}`)}
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
                  <span className="material-symbols-outlined text-lg text-on-surface-variant cursor-pointer" onClick={() => toast('Filters (mock)')}>filter_list</span>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left min-w-[400px]">
                  <thead className="text-xs text-on-surface-variant border-b border-outline-variant bg-surface-container-lowest">
                    <tr>
                      <th className="px-lg py-3 font-medium">Issue</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                      <th className="px-lg py-3 font-medium text-right">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {renderedTasks.slice(0, 3).map((ticket, index) => {
                      return (
                        <tr key={ticket.id || index} className="hover:bg-surface-container-high transition-colors">
                          <td className="px-lg py-4">
                            <p className="text-sm text-on-surface font-medium line-clamp-1">{ticket.title}</p>
                            <p className="text-[11px] text-on-surface-variant font-label-sm">{ticket.code}</p>
                          </td>
                          <td className="px-lg py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${getPriorityBadgeClass(ticket.priority)}`}>
                              {formatPriority(ticket.priority)}
                            </span>
                          </td>
                          <td className="px-lg py-4 text-right">
                            <div className="flex justify-end">
                              {ticket.assignedUserProfileImage ? (
                                <img alt={ticket.assignedUserName} className="w-6 h-6 rounded-full border border-surface" src={ticket.assignedUserProfileImage} />
                              ) : ticket.assignedUserName ? (
                                <div className="w-6 h-6 rounded-full border border-surface flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-[10px]" title={ticket.assignedUserName}>
                                  {getInitials(ticket.assignedUserName)}
                                </div>
                              ) : (
                                <span className="material-symbols-outlined text-on-surface-variant text-lg" title="Unassigned">person_add</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-surface-container-lowest text-center">
                <button className="text-primary text-sm font-medium hover:underline cursor-pointer bg-transparent border-none outline-none" onClick={() => toast('CRM Backlog navigation (mock)')}>
                  View CRM Backlog ({renderedTasks.length > 3 ? renderedTasks.length - 3 : 14} more)
                </button>
              </div>
            </div>

            {/* Linked Documents Grid */}
            <div className="space-y-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <h3 className="font-headline-md text-[20px] text-on-surface font-bold">Recent Documents</h3>
                </div>
                <button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant cursor-pointer bg-transparent border-none" onClick={() => toast('Add Document (mock)')}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="glass-panel p-md rounded-xl hover:border-primary/50 transition-all cursor-pointer group" onClick={() => toast('Opening Architecture_Spec_v2.pdf')}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-500/10 text-primary rounded-lg">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); toast('Menu (mock)'); }}>more_vert</span>
                  </div>
                  <p className="text-sm font-medium text-on-surface mb-1 truncate">Architecture_Spec_v2.pdf</p>
                  <p className="text-xs text-on-surface-variant mb-4">Updated 2h ago by Sarah J.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">PDF</span>
                    <span className="text-[10px] text-on-surface-variant">1.4 MB</span>
                  </div>
                </div>

                <div className="glass-panel p-md rounded-xl hover:border-primary/50 transition-all cursor-pointer group" onClick={() => toast('Opening Data_Mapping_Matrix.xlsx')}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-purple-500/10 text-tertiary rounded-lg">
                      <span className="material-symbols-outlined">table_chart</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); toast('Menu (mock)'); }}>more_vert</span>
                  </div>
                  <p className="text-sm font-medium text-on-surface mb-1 truncate">Data_Mapping_Matrix.xlsx</p>
                  <p className="text-xs text-on-surface-variant mb-4">Updated Yesterday</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-tertiary uppercase font-bold tracking-wider">Sheets</span>
                    <span className="text-[10px] text-on-surface-variant">420 KB</span>
                  </div>
                </div>

                <div className="glass-panel p-md rounded-xl hover:border-primary/50 transition-all cursor-pointer group" onClick={() => toast('Opening API_Endpoints_Config.json')}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-500/10 text-on-secondary-container rounded-lg">
                      <span className="material-symbols-outlined">code</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); toast('Menu (mock)'); }}>more_vert</span>
                  </div>
                  <p className="text-sm font-medium text-on-surface mb-1 truncate">API_Endpoints_Config.json</p>
                  <p className="text-xs text-on-surface-variant mb-4">Updated 4d ago</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-on-secondary-container uppercase font-bold tracking-wider">JSON</span>
                    <span className="text-[10px] text-on-surface-variant">12 KB</span>
                  </div>
                </div>

                <div className="glass-panel p-md rounded-xl border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors group cursor-pointer" onClick={() => toast('Upload File dialog (mock)')}>
                  <span className="material-symbols-outlined text-3xl mb-2 group-hover:text-primary transition-colors">upload_file</span>
                  <p className="text-xs font-medium">Upload File</p>
                </div>
              </div>
            </div>
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
      <button 
        onClick={() => toast('Quick Create Task (mock)')}
        className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
        {/* Tooltip */}
        <span className="absolute right-16 bg-surface-container border border-outline-variant px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Quick Create Task
        </span>
      </button>

      {/* Project Invite Member Modal */}
      <InviteProjectMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
        projectName={project?.name}
        onSuccess={loadData}
      />
    </div>
  );
};

export default ProjectDetails;
