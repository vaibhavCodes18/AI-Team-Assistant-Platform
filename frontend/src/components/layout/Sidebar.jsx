import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutModal from '../common/LogoutModal';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 px-4 py-2 transition-all rounded-md ";
    if (currentPath === path) {
      return baseClass + "text-primary bg-secondary-container/30 border-l-2 border-primary";
    }
    return baseClass + "text-on-surface-variant hover:bg-surface-container-high transition-colors";
  };

  return (
    <>
      <aside className="w-64 h-screen border-r border-outline-variant bg-surface flex flex-col shrink-0 hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                auto_awesome
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">AI Team Hub</span>
          </div>
          <p className="text-on-surface-variant font-label-sm text-label-sm ml-11">Enterprise Plan</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
          <Link to="/profile" className={getLinkClass('/profile')}>
            <span className="material-symbols-outlined">person</span>
            <span className="font-body-md">Profile</span>
          </Link>
          <Link to="/" className={getLinkClass('/')}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Dashboard</span>
          </Link>
          <Link to="/workspaces" className={getLinkClass('/workspaces')}>
            <span className="material-symbols-outlined">workspaces</span>
            <span className="font-body-md">Workspace</span>
          </Link>
          <a href="#" className={getLinkClass('/projects')}>
            <span className="material-symbols-outlined">folder_open</span>
            <span className="font-body-md">Projects</span>
          </a>
          <a href="#" className={getLinkClass('/tasks')}>
            <span className="material-symbols-outlined">assignment</span>
            <span className="font-body-md">Tasks</span>
          </a>
          <a href="#" className={getLinkClass('/tickets')}>
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="font-body-md">Tickets</span>
          </a>
          <a href="#" className={getLinkClass('/documents')}>
            <span className="material-symbols-outlined">description</span>
            <span className="font-body-md">Documents</span>
          </a>
          <a href="#" className={getLinkClass('/ai')}>
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-body-md">AI</span>
          </a>
          <a href="#" className={getLinkClass('/notifications')}>
            <span className="material-symbols-outlined">notifications</span>
            <span className="font-body-md">Notifications</span>
          </a>
          
          <a href="#" className={getLinkClass('/admin')}>
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span className="font-body-md">Admin</span>
          </a>
        </nav>

        <div className="mt-auto p-4 border-t border-outline-variant space-y-1">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full mb-4 bg-error-container text-on-error-container hover:bg-red-800 hover:text-white py-2 rounded-lg font-body-md font-bold flex items-center justify-center gap-sm transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
