import React from 'react';
import { APP_CONFIG } from '../constants/app.constants';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">
          {APP_CONFIG.FOOTER_DISCLAIMER}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Open legal research platform. For official certified orders, refer to the respective High Court registry or eCourts portal.
        </p>
      </div>
    </footer>
  );
};
