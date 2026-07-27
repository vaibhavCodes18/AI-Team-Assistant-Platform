import { useState } from 'react';
import { createPortal } from 'react-dom';
import TicketActionMenu from './TicketActionMenu';
import TicketPreviewModal from './TicketPreviewModal';
import EditTicketModal from './EditTicketModal';
import DeleteTicketModal from './DeleteTicketModal';

const PriorityTicketsModal = ({ isOpen, onClose, projectId, projectName, tickets = [], canManageTickets = false, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedTicketForPreview, setSelectedTicketForPreview] = useState(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState(null);
  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState(null);

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

  const formatPriority = (priority) => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const formatStatus = (status) => {
    if (!status) return 'Open';
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none"
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
        <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar text-left">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="glass-card p-md rounded-xl border border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container/60 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md group cursor-pointer"
                onClick={() => setSelectedTicketForPreview(ticket)}
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
                  {(ticket.reporter || ticket.assignedUserName) && (
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant" title={`Reporter: ${ticket.reporter?.name || ticket.assignedUserName}`}>
                      <div className="w-4 h-4 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[9px] shrink-0">
                        {ticket.reporter?.profileImage || ticket.assignedUserProfileImage ? (
                          <img src={ticket.reporter?.profileImage || ticket.assignedUserProfileImage} alt={ticket.reporter?.name || ticket.assignedUserName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(ticket.reporter?.name || ticket.assignedUserName)
                        )}
                      </div>
                      <span className="truncate max-w-[110px] font-medium">{ticket.reporter?.name || ticket.assignedUserName}</span>
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

                  {/* 3 Dots Menu */}
                  <TicketActionMenu
                    ticket={ticket}
                    canManageTickets={canManageTickets}
                    onPreview={(t) => setSelectedTicketForPreview(t)}
                    onEdit={(t) => setSelectedTicketForEdit(t)}
                    onDelete={(t) => setSelectedTicketForDelete(t)}
                  />
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
        onSuccess={onSuccess}
      />

      {/* Delete Ticket Modal */}
      <DeleteTicketModal
        isOpen={!!selectedTicketForDelete}
        onClose={() => setSelectedTicketForDelete(null)}
        ticket={selectedTicketForDelete}
        onSuccess={onSuccess}
      />
    </div>,
    document.body
  );
};

export default PriorityTicketsModal;
