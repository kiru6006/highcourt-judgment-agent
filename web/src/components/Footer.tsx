import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../constants/app.constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-medium text-slate-600 dark:text-slate-300">
          {APP_CONFIG.FOOTER_DISCLAIMER}
        </p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link to="/about-data" className="hover:text-amber-600 dark:hover:text-amber-400 transition">
            Dataset Status & Privacy
          </Link>
          <span>•</span>
          <Link to="/coverage" className="hover:text-amber-600 dark:hover:text-amber-400 transition font-medium">
            Corpus Coverage (25 High Courts)
          </Link>
          <span>•</span>
          <Link to="/data-quality" className="hover:text-amber-600 dark:hover:text-amber-400 transition">
            Data Quality & Anomalies
          </Link>
          <span>•</span>
          <Link to="/folders" className="hover:text-amber-600 dark:hover:text-amber-400 transition">
            Advocate Folders
          </Link>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Open legal research platform. For official certified orders, refer to the respective High Court registry or eCourts portal.
        </p>
      </div>
    </footer>
  );
};
