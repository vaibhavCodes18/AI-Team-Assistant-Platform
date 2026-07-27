import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logoutUser } from '../../api/authApi';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogoutConfirm = async () => {
    try {
      setSubmitting(true);
      if (onConfirm) {
        await onConfirm();
      } else {
        const logoutRes = await logoutUser();
        toast.success(logoutRes?.msg || logoutRes?.message || 'Logged out successfully');
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout encountered an issue, redirecting...');
      localStorage.removeItem('accessToken');
      navigate('/login');
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-md">
      <div className="bg-surface-container border border-outline-variant rounded-2xl p-lg max-w-md w-full space-y-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-on-background">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer bg-transparent border-none"
          disabled={submitting}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-left space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">logout</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface text-xl">Sign Out</h3>
          <p className="text-body-md text-on-surface-variant text-sm leading-relaxed">
            Are you sure you want to sign out? You will need to log back in to access your workspaces, projects, and tickets.
          </p>
        </div>

        <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogoutConfirm}
            className="px-5 py-2 bg-error text-on-error font-bold text-xs rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs cursor-pointer shadow-lg shadow-error/20"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-on-error border-t-transparent rounded-full animate-spin"></div>
                <span>Signing Out...</span>
              </>
            ) : (
              'Sign Out'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;
