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
    <header className="sticky top-0 z-40 bg-[#0C1E3C] border-b border-[#142C54] text-slate-100 shadow-sm transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand with Institutional Seal */}
          <Link to="/search" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-inner">
              <Scale className="w-5 h-5 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5 font-serif">
                {APP_CONFIG.BRAND_NAME}
              </span>
              <span className="text-[10px] block text-slate-300 font-mono tracking-wide -mt-0.5">
                Indian High Court Jurisprudence
              </span>
            </div>
          </Link>

          {/* Center: Search Box & Mode Toggle */}
          <div className="flex-1 max-w-2xl flex items-center gap-2.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search party, case number, section (e.g. 482 CrPC), issue..."
                aria-label="Search judgments by party, case number, section, or issue"
                className="w-full pl-9 pr-12 py-2 bg-[#060F1E] border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
              <span className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                ⌘K
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="hidden md:flex items-center bg-[#060F1E] p-1 rounded-lg text-xs font-medium border border-slate-800">
              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-md transition ${
                  !isWebLinksMode
                    ? 'bg-amber-600/30 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Indexed Corpus
              </Link>
              <Link
                to="/links"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition ${
                  isWebLinksMode
                    ? 'bg-amber-600/30 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Web Links</span>
              </Link>
            </div>
          </div>

          {/* Right Navigation & Tools */}
          <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
            <Link
              to="/folders"
              title="Advocate Case Folders & Matrix"
              aria-label="Advocate Case Folders"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <FolderLock className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              to="/data-quality"
              title="Data Quality & Integrity Dashboard"
              aria-label="Data Quality Dashboard"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              to="/about-data"
              title="Dataset Governance & Privacy"
              aria-label="Dataset Governance & Privacy"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <Info className="w-5 h-5" aria-hidden="true" />
            </Link>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Chamber Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Chamber Dark Mode'}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
