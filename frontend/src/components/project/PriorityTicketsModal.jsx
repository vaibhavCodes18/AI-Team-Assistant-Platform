import { useState } from 'react';
import { createPortal } from 'react-dom';

const PriorityTicketsModal = ({ isOpen, onClose, projectId, projectName, tickets = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (!isOpen) return null;

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'LOW':
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toUpperCase()) {
      case 'FEATURE':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'BUG':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'TASK':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'IMPROVEMENT':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'bg-blue-500/15 text-blue-300 font-semibold';
      case 'OPEN':
      case 'TODO':
        return 'bg-amber-500/15 text-amber-300 font-semibold';
      case 'RESOLVED':
      case 'CLOSED':
      case 'DONE':
        return 'bg-emerald-500/15 text-emerald-300 font-semibold';
      default:
        return 'bg-surface-container-high text-on-surface-variant font-semibold';
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = ticket.title?.toLowerCase().includes(query);
    const descMatch = ticket.description?.toLowerCase().includes(query);
    const idMatch = String(ticket.id).includes(query);
    const typeMatch = ticket.type?.toLowerCase().includes(query);
    const reporterMatch = ticket.reporter?.name?.toLowerCase().includes(query);
    const matchesQuery = titleMatch || descMatch || idMatch || typeMatch || reporterMatch;

    const matchesPriority = priorityFilter === 'ALL' || ticket.priority?.toUpperCase() === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || ticket.status?.toUpperCase() === statusFilter;

    return matchesQuery && matchesPriority && matchesStatus;
  });

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-md sm:p-lg">
      <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background overflow-hidden">
        
        {/* Header */}
        <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-center shrink-0">
          <div className="flex items-center gap-md">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">confirmation_number</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-headline-md text-xl font-bold text-on-surface">Priority Tickets</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
                  {tickets.length} Total
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                All tracked issues and tickets for <span className="font-semibold text-on-surface">{projectName || `Project #${projectId}`}</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-md border-b border-outline-variant bg-surface-container-lowest/50 flex flex-col sm:flex-row gap-md justify-between items-stretch sm:items-center shrink-0">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">search</span>
            </span>
            <input 
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface transition-all" 
              placeholder="Search by title, description, or ID..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg px-3 py-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg px-3 py-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="glass-card p-md rounded-xl border border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container/60 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                      #TCK-{ticket.id}
                    </span>
                    {ticket.type && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getTypeBadgeClass(ticket.type)}`}>
                        {ticket.type}
                      </span>
                    )}
                    {ticket.status && (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeClass(ticket.status)}`}>
                        {formatStatus(ticket.status)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {ticket.title}
                  </h4>
                  {ticket.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {ticket.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-md shrink-0 self-end sm:self-center flex-wrap">
                  {/* Reporter Tag */}
                  {ticket.reporter && (
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant" title={`Reporter: ${ticket.reporter.name}`}>
                      <div className="w-4 h-4 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[9px] shrink-0">
                        {ticket.reporter.profileImage ? (
                          <img src={ticket.reporter.profileImage} alt={ticket.reporter.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(ticket.reporter.name)
                        )}
                      </div>
                      <span className="truncate max-w-[110px] font-medium">{ticket.reporter.name}</span>
                    </div>
                  )}

                  {/* Priority Tag */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityBadgeClass(ticket.priority)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {formatPriority(ticket.priority)}
                  </span>

                  {/* Due Date */}
                  {ticket.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant">
                      <span className="material-symbols-outlined text-sm">event</span>
                      <span>{ticket.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-xl text-center flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-40">assignment_turned_in</span>
              <p className="text-sm font-semibold text-on-surface">No tickets found</p>
              <p className="text-xs text-on-surface-variant">Try adjusting your search query or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-between items-center text-xs text-on-surface-variant shrink-0">
          <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default PriorityTicketsModal;
