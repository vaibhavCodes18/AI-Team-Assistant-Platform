import { useState, useRef, useEffect } from 'react';

const TicketActionMenu = ({ ticket, canManageTickets, onPreview, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer bg-transparent border-none"
        title="Ticket Options"
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-44 rounded-xl bg-surface-container-high border border-outline-variant shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setIsOpen(false);
              onPreview(ticket);
            }}
            className="w-full px-3 py-2 text-xs text-on-surface hover:bg-surface-container-highest flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <span className="material-symbols-outlined text-base text-primary">visibility</span>
            View Details
          </button>

          {canManageTickets && (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onEdit(ticket);
                }}
                className="w-full px-3 py-2 text-xs text-on-surface hover:bg-surface-container-highest flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <span className="material-symbols-outlined text-base text-amber-400">edit</span>
                Edit Ticket
              </button>

              <div className="my-1 border-t border-outline-variant/50"></div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onDelete(ticket);
                }}
                className="w-full px-3 py-2 text-xs text-error hover:bg-error/10 flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <span className="material-symbols-outlined text-base text-error">delete</span>
                Delete Ticket
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketActionMenu;
