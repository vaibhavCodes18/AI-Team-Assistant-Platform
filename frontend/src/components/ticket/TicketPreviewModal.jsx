import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { getTicketById } from '../../api/ticketApi';

const TicketPreviewModal = ({ isOpen, onClose, ticket, ticketId, canManageTickets, onEditClick, onDeleteClick }) => {
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeTicketId = ticket?.id || ticketId;

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!isOpen || !activeTicketId) return;

      try {
        setLoading(true);
        const res = await getTicketById(activeTicketId);
        if (res?.data) {
          setTicketDetails(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch ticket details:', error);
        toast.error('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [isOpen, activeTicketId]);

  if (!isOpen || (!activeTicketId && !ticketDetails && !ticket)) return null;

  const currentTicket = ticketDetails || ticket || {};

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

  const reporterName = currentTicket.reporterDetails?.name || currentTicket.reporter?.name || currentTicket.assignedUserName || 'Unassigned';
  const reporterEmail = currentTicket.reporterDetails?.email || currentTicket.reporter?.email || 'N/A';
  const reporterImage = currentTicket.reporterDetails?.profileImage || currentTicket.reporter?.profileImage || currentTicket.assignedUserProfileImage;

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-md sm:p-lg">
      <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background overflow-hidden">
        {/* Header */}
        <div className="p-lg border-b border-outline-variant bg-surface-container-low flex justify-between items-start shrink-0">
          <div className="space-y-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded">
                #TCK-{currentTicket.id || activeTicketId}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getTypeBadgeClass(currentTicket.type)}`}>
                {formatType(currentTicket.type)}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getStatusBadgeClass(currentTicket.status)}`}>
                {formatStatus(currentTicket.status)}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getPriorityBadgeClass(currentTicket.priority)}`}>
                {formatPriority(currentTicket.priority)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface leading-snug break-words">
              {currentTicket.title || `Ticket #${activeTicketId}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none shrink-0"
            title="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-lg space-y-lg custom-scrollbar text-left relative">
          {loading && (
            <div className="absolute inset-0 bg-surface-container/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-xs">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</h4>
            <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
              {currentTicket.description || 'No description provided for this ticket.'}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md border-t border-outline-variant/40">
            {/* Reporter Info */}
            <div className="space-y-xs">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Reporter</h4>
              <div className="flex items-center gap-md p-md rounded-xl bg-surface-container-low border border-outline-variant/60">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                  {reporterImage ? (
                    <img
                      src={reporterImage}
                      alt={reporterName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(reporterName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {reporterName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {reporterEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Due Date & Timelines */}
            <div className="space-y-xs">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Timeline</h4>
              <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center gap-md">
                <div className="p-2.5 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">event</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">Due Date</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {currentTicket.dueDate ? new Date(currentTicket.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            {canManageTickets && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    if (onEditClick) onEditClick(currentTicket);
                  }}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Ticket
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onDeleteClick) onDeleteClick(currentTicket);
                  }}
                  className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error border border-error/30 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete Ticket
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TicketPreviewModal;
