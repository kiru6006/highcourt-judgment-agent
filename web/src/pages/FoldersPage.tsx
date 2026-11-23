import React from 'react';
import { FolderLock, Bookmark, Plus, FileText, Download } from 'lucide-react';

export const FoldersPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderLock className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Advocate Research Folders
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Local browser workspace. Save cases, pin key paragraphs, and export court briefs. Zero cloud storage required.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Empty State / Local Storage Notice */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
        <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No saved research folders yet
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          In upcoming phases, you can organize judgments by matter (e.g., "Bail Petitions 2024", "Commercial Arbitration"), write case notes, and export consolidated court briefs.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>Sample Memo Layout</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium">
            <Download className="w-3.5 h-3.5" />
            <span>Backup / Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
