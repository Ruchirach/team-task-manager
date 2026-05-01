import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/projects/')) return 'Project Board';
    return 'Overview';
  };

  return (
    <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-surface/30 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-textMuted hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white tracking-wide">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-textMuted focus:outline-none focus:border-primary/50 transition-colors w-64"
          />
        </div>
        
        <button className="relative text-textMuted hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
