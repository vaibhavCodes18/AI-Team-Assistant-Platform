import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../api/authApi';
import { getProjectById, getProjectMembers } from '../../api/projectApi';
import { getAllWorkspaceMembers } from '../../api/workspaceApi';
import { addTask, getProjectTasks, updateTask } from '../../api/taskApi';
import Sidebar from '../../components/layout/Sidebar';
import TaskActionMenu from '../../components/task/TaskActionMenu';
import TaskPreviewModal from '../../components/task/TaskPreviewModal';
import EditTaskModal from '../../components/task/EditTaskModal';
import DeleteTaskModal from '../../components/task/DeleteTaskModal';

const TaskList = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: ''
  });

  const [selectedTaskForPreview, setSelectedTaskForPreview] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);

  const loadData = async () => {
    try {
      // 1. Fetch user profile
      const userRes = await fetchUserProfile();
      if (userRes?.data) setUser(userRes.data);

      // 2. Fetch project info
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

      // 5. Project tasks
      const tasksRes = await getProjectTasks(projectId);
      if (tasksRes?.data) {
        setTasks(tasksRes.data);
      } else if (Array.isArray(tasksRes)) {
        setTasks(tasksRes);
      }
    } catch (error) {
      console.error('Failed to load project tasks page data:', error);
      toast.error('Failed to load tasks');
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

  const canManageTasks =
    currentUserWsRole === 'OWNER' ||
    currentUserWsRole === 'ADMIN' ||
    currentProjectMember?.role === 'PROJECT_ADMIN' ||
    currentProjectMember?.role === 'CONTRIBUTOR';

  // Toggle Task Status (Checkbox)
  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const prevStatus = task.status;

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await updateTask(task.id, { status: nextStatus });
      const updatedTask = res?.data || res;
      if (updatedTask && updatedTask.id) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? updatedTask : t))
        );
      }
      toast.success(
        nextStatus === 'DONE'
          ? `Task "${task.title}" completed!`
          : `Task "${task.title}" set to to-do.`
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: prevStatus } : t))
      );
      toast.error(error?.response?.data?.message || 'Failed to update task status');
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!createFormData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      setSubmittingCreate(true);
      const payload = {
        title: createFormData.title.trim(),
        description: createFormData.description?.trim() || null,
        priority: createFormData.priority || 'MEDIUM',
        projectId: parseInt(projectId, 10),
        assigneeId: createFormData.assigneeId ? parseInt(createFormData.assigneeId, 10) : null,
        dueDate: createFormData.dueDate ? createFormData.dueDate : null,
      };

      const res = await addTask(payload);
      const createdTask = res?.data || res;

      if (createdTask) {
        toast.success('Task created successfully');
        setTasks((prev) => [createdTask, ...prev]);
        setCreateFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          assigneeId: '',
          dueDate: '',
        });
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error?.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Progress metrics
  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(task.id).includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      case 'TODO':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
      case 'IN_PROGRESS':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
      case 'IN_REVIEW':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'DONE':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'IN_REVIEW':
        return 'In Review';
      case 'DONE':
        return 'Done';
      default:
        return status || 'To Do';
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Unassigned') return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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
              <span className="text-on-surface font-semibold">Tasks</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">check_box</span>
                Project Tasks
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
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

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Task
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-lg space-y-lg flex-1">
          {/* Progress Overview Banner */}
          <div className="p-md rounded-2xl bg-surface-container border border-outline-variant/60 shadow-md space-y-md text-left">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div>
                <h3 className="text-sm font-bold text-on-surface">Task Completion Rate</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {completedCount} of {totalCount} tasks completed ({progressPercent}%)
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                {progressPercent}% Done
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Controls Bar: Search & Status/Priority Filters */}
          <div className="p-md rounded-2xl bg-surface-container border border-outline-variant/60 shadow-md space-y-md">
            <div className="flex flex-wrap items-center justify-between gap-md">
              {/* Search input */}
              <div className="relative flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search tasks by title, description, or ID..."
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

              {/* Priority Filter Dropdown */}
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
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-t border-outline-variant/40 pt-md text-xs">
              {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer border-none shrink-0 ${
                    statusFilter === tab
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {tab === 'ALL' ? 'All Tasks' : formatStatus(tab)}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-on-surface-variant">Loading project tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-md text-left">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'DONE';
                const assigneeName = task.assignedUserName || task.assignee?.name || 'Unassigned';

                return (
                  <div
                    key={task.id}
                    className={`p-md rounded-2xl border transition-all flex items-start justify-between gap-md group ${
                      isDone
                        ? 'bg-surface-container-lowest/50 border-outline-variant/30 opacity-80'
                        : 'bg-surface-container hover:bg-surface-container-high/70 border-outline-variant/60 hover:border-primary/40 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Checkbox & Task Details */}
                    <div className="flex items-start gap-md min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="mt-1 shrink-0 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                        title={isDone ? 'Mark as To-Do' : 'Mark as Done'}
                      >
                        <span className={`material-symbols-outlined text-2xl ${isDone ? 'text-emerald-400 font-bold' : 'text-outline'}`}>
                          {isDone ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                      </button>

                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => setSelectedTaskForPreview(task)}
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded">
                            #TSK-{task.id}
                          </span>
                          <span className={`text-sm font-bold ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'} group-hover:text-primary transition-colors`}>
                            {task.title}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${getStatusBadgeClass(task.status)}`}>
                            {formatStatus(task.status)}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-xs text-on-surface-variant flex-wrap pt-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-outline">calendar_today</span>
                            <span>{task.dueDate ? `Due: ${task.dueDate}` : 'No due date'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                              {getInitials(assigneeName)}
                            </div>
                            <span className="truncate max-w-[150px] font-medium text-on-surface">
                              {assigneeName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task Action Menu */}
                    <TaskActionMenu
                      task={task}
                      canManageTasks={canManageTasks}
                      onPreview={(t) => setSelectedTaskForPreview(t)}
                      onEdit={(t) => setSelectedTaskForEdit(t)}
                      onDelete={(t) => setSelectedTaskForDelete(t)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] rounded-2xl bg-surface-container border border-outline-variant/60 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">task_alt</span>
              <h3 className="text-lg font-bold text-on-surface">No Tasks Found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                There are no tasks matching your selected filters or search query.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg shadow-md hover:bg-primary/90 transition-all cursor-pointer border-none"
              >
                Add Task
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-md sm:p-lg">
          <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background overflow-hidden">
            <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-start shrink-0">
              <div className="space-y-1 min-w-0 pr-6 text-left">
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">add_task</span>
                  Create New Task
                </h2>
                <p className="text-xs text-on-surface-variant">Add a direct task to {project?.name || 'this project'}.</p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none shrink-0"
                disabled={submittingCreate}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex-1 flex flex-col overflow-hidden text-left">
              <div className="flex-1 overflow-y-auto p-lg space-y-md custom-scrollbar">
                <div className="space-y-xs">
                  <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="createTaskTitle">
                    Task Title *
                  </label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                    id="createTaskTitle"
                    type="text"
                    required
                    maxLength={150}
                    placeholder="e.g. Configure Database Indexing & Caching"
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                    disabled={submittingCreate}
                  />
                </div>

                <div className="space-y-xs">
                  <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="createTaskDescription">
                    Description
                  </label>
                  <textarea
                    className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none h-32"
                    id="createTaskDescription"
                    maxLength={5000}
                    placeholder="Provide detailed description, requirements, or scope..."
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    disabled={submittingCreate}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="createTaskPriority">
                      Priority *
                    </label>
                    <select
                      className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      id="createTaskPriority"
                      value={createFormData.priority}
                      onChange={(e) => setCreateFormData({ ...createFormData, priority: e.target.value })}
                      disabled={submittingCreate}
                    >
                      <option value="LOW" className="bg-[#191b23]">Low</option>
                      <option value="MEDIUM" className="bg-[#191b23]">Medium</option>
                      <option value="HIGH" className="bg-[#191b23]">High</option>
                      <option value="CRITICAL" className="bg-[#191b23]">Critical</option>
                    </select>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="createTaskDueDate">
                      Due Date
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      id="createTaskDueDate"
                      type="date"
                      value={createFormData.dueDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                      disabled={submittingCreate}
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="createTaskAssignee">
                    Assignee
                  </label>
                  <select
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                    id="createTaskAssignee"
                    value={createFormData.assigneeId}
                    onChange={(e) => setCreateFormData({ ...createFormData, assigneeId: e.target.value })}
                    disabled={submittingCreate}
                  >
                    <option value="" className="bg-[#191b23]">Unassigned</option>
                    {members.map((u) => {
                      const userId = u.user?.id || u.id;
                      const userName = u.user?.name || u.name || 'Member';
                      const userEmail = (u.user?.email || u.email) ? ` (${u.user?.email || u.email})` : '';
                      return (
                        <option key={userId} value={userId} className="bg-[#191b23]">
                          {userName}{userEmail}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-end gap-md shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors cursor-pointer"
                  disabled={submittingCreate}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs cursor-pointer"
                  disabled={submittingCreate}
                >
                  {submittingCreate ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Preview Modal */}
      {selectedTaskForPreview && (
        <TaskPreviewModal
          isOpen={!!selectedTaskForPreview}
          onClose={() => setSelectedTaskForPreview(null)}
          task={selectedTaskForPreview}
          canManageTasks={canManageTasks}
          onEditClick={(t) => setSelectedTaskForEdit(t)}
          onDeleteClick={(t) => setSelectedTaskForDelete(t)}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTaskForEdit && (
        <EditTaskModal
          isOpen={!!selectedTaskForEdit}
          onClose={() => setSelectedTaskForEdit(null)}
          task={selectedTaskForEdit}
          members={members}
          onSuccess={loadData}
        />
      )}

      {/* Delete Task Modal */}
      {selectedTaskForDelete && (
        <DeleteTaskModal
          isOpen={!!selectedTaskForDelete}
          onClose={() => setSelectedTaskForDelete(null)}
          task={selectedTaskForDelete}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default TaskList;
