import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { updateTicket } from '../../api/ticketApi';

const EditTicketModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'FEATURE',
    priority: 'MEDIUM',
    status: 'OPEN',
    dueDate: ''
  });

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  useEffect(() => {
    if (ticket && isOpen) {
      setForm({
        title: ticket.title || '',
        description: ticket.description || '',
        type: ticket.type || 'FEATURE',
        priority: ticket.priority || 'MEDIUM',
        status: ticket.status || 'OPEN',
        dueDate: formatDateForInput(ticket.dueDate)
      });
    }
  }, [ticket, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Ticket title is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null
      };

      const res = await updateTicket(ticket.id, payload);

      if (res?.data) {
        toast.success('Ticket updated successfully!');
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to update ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none"
          disabled={submitting}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-left">
          <h3 className="text-headline-md font-bold text-on-surface">Edit Ticket #{ticket.id}</h3>
          <p className="text-body-md text-on-surface-variant mt-xs">Update ticket status, priority, type, or details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTicketTitle">
              Title *
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
              id="editTicketTitle"
              type="text"
              required
              maxLength={150}
              placeholder="e.g. SSL Handshake Timeout"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTicketDescription">
              Description
            </label>
            <textarea
              className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none h-24"
              id="editTicketDescription"
              maxLength={1000}
              placeholder="Describe the issue or feature request in detail..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTicketType">
                Type *
              </label>
              <select
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="editTicketType"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                disabled={submitting}
              >
                <option value="BUG" className="bg-[#191b23] text-on-surface">Bug</option>
                <option value="FEATURE" className="bg-[#191b23] text-on-surface">Feature</option>
                <option value="IMPROVEMENT" className="bg-[#191b23] text-on-surface">Improvement</option>
                <option value="SUPPORT" className="bg-[#191b23] text-on-surface">Support</option>
                <option value="DOCUMENTATION" className="bg-[#191b23] text-on-surface">Documentation</option>
              </select>
            </div>

            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTicketPriority">
                Priority *
              </label>
              <select
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="editTicketPriority"
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                disabled={submitting}
              >
                <option value="LOW" className="bg-[#191b23] text-on-surface">Low</option>
                <option value="MEDIUM" className="bg-[#191b23] text-on-surface">Medium</option>
                <option value="HIGH" className="bg-[#191b23] text-on-surface">High</option>
                <option value="CRITICAL" className="bg-[#191b23] text-on-surface">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTicketStatus">
                Status *
              </label>
              <select
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="editTicketStatus"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                disabled={submitting}
              >
                <option value="OPEN" className="bg-[#191b23] text-on-surface">Open</option>
                <option value="IN_PROGRESS" className="bg-[#191b23] text-on-surface">In Progress</option>
                <option value="RESOLVED" className="bg-[#191b23] text-on-surface">Resolved</option>
                <option value="CLOSED" className="bg-[#191b23] text-on-surface">Closed</option>
              </select>
            </div>

            <div className="space-y-xs">
              <label className="font-label-sm text-on-surface-variant block ml-xs font-semibold" htmlFor="editTicketDueDate">
                Due Date
              </label>
              <input
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                id="editTicketDueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-md pt-md border-t border-outline-variant mt-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors cursor-pointer"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTicketModal;
