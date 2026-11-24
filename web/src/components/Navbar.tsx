import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Search, Link2, FolderLock, Info, Sun, Moon, ShieldAlert } from 'lucide-react';
import { APP_CONFIG } from '../constants/app.constants';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  isDark,
  toggleTheme,
}) => {
  const location = useLocation();
  const isWebLinksMode = location.pathname === '/links';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand */}
          <Link to="/search" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-amber-600/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                {APP_CONFIG.BRAND_NAME}
              </span>
              <span className="text-[10px] block text-slate-500 dark:text-slate-400 -mt-1 font-medium">
                High Court Judgments
              </span>
            </div>
          </Link>

          {/* Center: Search Box & Mode Toggle */}
          <div className="flex-1 max-w-2xl flex items-center gap-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search party, case number, section (e.g. 482 CrPC), issue..."
                aria-label="Search judgments by party, case number, section, or issue"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            {/* Mode Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-md transition ${
                  !isWebLinksMode
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Indexed Corpus
              </Link>
              <Link
                to="/links"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition ${
                  isWebLinksMode
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                Web Links
              </Link>
            </div>
          </div>

          {/* Right Navigation & Theme */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/folders"
              title="Research Folders"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <FolderLock className="w-5 h-5" />
            </Link>
            <Link
              to="/data-quality"
              title="Data Quality & Integrity Dashboard"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <ShieldAlert className="w-5 h-5" />
            </Link>
            <Link
              to="/about-data"
              title="Dataset Status"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <Info className="w-5 h-5" />
            </Link>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
