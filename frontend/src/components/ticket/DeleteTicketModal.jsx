import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { deleteTicket } from '../../api/ticketApi';

const DeleteTicketModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!ticket?.id) return;

    try {
      setSubmitting(true);
      await deleteTicket(ticket.id);
      toast.success('Ticket deleted successfully!');
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast.error(error.response?.data?.message || error.response?.data?.msg || 'Failed to delete ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none"
          disabled={submitting}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-left space-y-2">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">delete_forever</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface">Delete Ticket #{ticket.id}</h3>
          <p className="text-body-md text-on-surface-variant">
            Are you sure you want to delete <span className="font-semibold text-on-surface">"{ticket.title}"</span>? This action cannot be undone.
          </p>
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
            type="button"
            onClick={handleDelete}
            className="px-5 py-2 bg-error text-on-error font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs cursor-pointer"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTicketModal;
