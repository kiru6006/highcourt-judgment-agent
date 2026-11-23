import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Bookmark, Check, Folder } from 'lucide-react';
import { FolderStore, CaseFolder, SavedJudgmentItem } from '../workspace/folder-store';
import { Link } from 'react-router-dom';

interface SaveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  judgmentItem: SavedJudgmentItem;
}

export const SaveToFolderModal: React.FC<SaveToFolderModalProps> = ({
  isOpen,
  onClose,
  judgmentItem
}) => {
  const [folders, setFolders] = useState<CaseFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [savedFolderId, setSavedFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFolders(FolderStore.getFolders());
      setSavedFolderId(null);
      setShowNewInput(false);
      setNewFolderName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveToFolder = (folderId: string) => {
    FolderStore.addJudgmentToFolder(folderId, judgmentItem);
    setSavedFolderId(folderId);
    setFolders(FolderStore.getFolders());
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCreateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const folder = FolderStore.createFolder(newFolderName.trim());
    FolderStore.addJudgmentToFolder(folder.id, judgmentItem);
    setSavedFolderId(folder.id);
    setFolders(FolderStore.getFolders());
    setNewFolderName('');
    setShowNewInput(false);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Save to Case Folder
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Case Info Preview */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 block font-semibold mb-0.5">
            {judgmentItem.caseNo}
          </span>
          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {judgmentItem.title}
          </p>
        </div>

        {/* Folder List */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Select Destination Folder:</span>
            <Link
              to="/folders"
              onClick={onClose}
              className="text-amber-600 hover:underline font-medium"
            >
              Open Workspace
            </Link>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {folders.map(folder => {
              const isAlreadySaved = folder.items.some(i => i.jid === judgmentItem.jid);
              const isJustSaved = savedFolderId === folder.id;

              return (
                <button
                  key={folder.id}
                  onClick={() => handleSaveToFolder(folder.id)}
                  disabled={isAlreadySaved || isJustSaved}
                  className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between text-xs ${
                    isJustSaved
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : isAlreadySaved
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Folder className={`w-4 h-4 flex-shrink-0 ${isJustSaved ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div className="truncate">
                      <div className="font-semibold truncate">{folder.name}</div>
                      {folder.description && (
                        <div className="text-[10px] text-slate-400 truncate">{folder.description}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isJustSaved ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </span>
                    ) : isAlreadySaved ? (
                      <span className="text-[11px] font-medium text-slate-400">Already saved</span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium">Save here</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Create New Folder Inline */}
          {showNewInput ? (
            <form onSubmit={handleCreateAndSave} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Matter / Folder name (e.g. Criminal Appeals 2026)"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewInput(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-3 py-1 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  Create & Save
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500 flex items-center justify-center gap-1.5 transition"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create New Case Folder</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
