import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderLock,
  Plus,
  Trash2,
  Download,
  Upload,
  Calendar,
  BookOpen,
  Folder,
  Columns3,
  X,
  FileEdit,
  Tag,
  Printer
} from 'lucide-react';
import { FolderStore, CaseFolder, SavedJudgmentItem } from '../workspace/folder-store';

export const FoldersPage: React.FC = () => {
  const [folders, setFolders] = useState<CaseFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderDesc, setNewFolderDesc] = useState<string>('');
  
  // Precedent Comparison Matrix selection: array of JIDs
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showMatrixView, setShowMatrixView] = useState<boolean>(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const f = FolderStore.getFolders();
      setFolders(f);
      if (f.length > 0 && !selectedFolderId) {
        setSelectedFolderId(f[0].id);
      }
    };
    update();
    const unsub = FolderStore.subscribe(update);
    return unsub;
  }, [selectedFolderId]);

  const activeFolder = folders.find(f => f.id === selectedFolderId) || folders[0];

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const created = FolderStore.createFolder(newFolderName.trim(), newFolderDesc.trim());
    setSelectedFolderId(created.id);
    setNewFolderName('');
    setNewFolderDesc('');
    setShowNewFolderModal(false);
    flashStatus('New folder created');
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folders.length <= 1) {
      alert('Must keep at least one case folder in workspace.');
      return;
    }
    if (confirm('Delete this case folder and its saved notes?')) {
      FolderStore.deleteFolder(folderId);
      const remaining = folders.filter(f => f.id !== folderId);
      if (remaining.length > 0) {
        setSelectedFolderId(remaining[0].id);
      }
      flashStatus('Folder deleted');
    }
  };

  const handleRemoveItem = (jid: string) => {
    if (!activeFolder) return;
    FolderStore.removeJudgmentFromFolder(activeFolder.id, jid);
    setSelectedForComparison(prev => prev.filter(id => id !== jid));
    flashStatus('Judgment removed from folder');
  };

  const handleNoteChange = (jid: string, notes: string) => {
    if (!activeFolder) return;
    FolderStore.updateNotes(activeFolder.id, jid, notes);
  };

  const toggleComparisonSelection = (jid: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(jid)) {
        return prev.filter(id => id !== jid);
      } else {
        if (prev.length >= 5) {
          alert('Maximum 5 judgments can be compared simultaneously.');
          return prev;
        }
        return [...prev, jid];
      }
    });
  };

  const flashStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Export JSON file
  const handleExportJSON = () => {
    const jsonStr = FolderStore.exportWorkspaceJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyayareader-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flashStatus('Workspace exported as JSON');
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = FolderStore.importWorkspaceJSON(content);
      if (success) {
        flashStatus('Workspace imported successfully');
        const f = FolderStore.getFolders();
        if (f.length > 0) setSelectedFolderId(f[0].id);
      } else {
        alert('Invalid workspace JSON format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const comparisonItems: SavedJudgmentItem[] = activeFolder
    ? activeFolder.items.filter(i => selectedForComparison.includes(i.jid))
    : [];

  return (
    <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderLock className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Advocate Research Workspace
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Local browser workspace. Organize matters, annotate key ratios, compare precedents side-by-side. 100% private.
          </p>
        </div>

        {/* Global Workspace Actions */}
        <div className="flex items-center gap-2">
          {statusMsg && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mr-2 animate-fadeIn">
              ✓ {statusMsg}
            </span>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
            title="Print Court Research Memorandum (A4 / PDF)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Memo</span>
          </button>

          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Folder Tabs + Right Folder Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block">
        
        {/* Left Rail: Folders List */}
        <div className="lg:col-span-1 space-y-2 print:hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Case Folders ({folders.length})
          </div>
          
          <div className="space-y-1">
            {folders.map(folder => {
              const isSelected = folder.id === activeFolder?.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolderId(folder.id);
                    setSelectedForComparison([]);
                    setShowMatrixView(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 font-semibold shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-200/60 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {folder.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Folder Details & Judgments */}
        <div className="lg:col-span-3 print:col-span-4 print:w-full space-y-5">
          {activeFolder ? (
            <>
              {/* Formal Court Memorandum Print Header (Only visible on paper / PDF export) */}
              <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6 text-black">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                  <span className="font-bold text-xs tracking-wider uppercase font-mono">NYAYAREADER ADVOCATE WORKSPACE</span>
                  <span className="text-[11px] font-mono text-slate-600">Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="mt-3 text-center space-y-1">
                  <h1 className="text-xl font-bold uppercase tracking-wider font-serif">
                    Advocate Research Memorandum & Precedent Brief
                  </h1>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Matter / Case Folder: {activeFolder.name}
                  </h2>
                  {activeFolder.description && (
                    <p className="text-xs italic text-slate-600">
                      Subject: {activeFolder.description}
                    </p>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-700 flex justify-between font-mono">
                  <span>Total Saved Precedents: {activeFolder.items.length}</span>
                  <span>Bench Research & Hearing Preparation</span>
                </div>
              </div>

              {/* Folder Header Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 print:border-slate-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{activeFolder.name}</span>
                    <span className="text-xs font-mono font-normal text-slate-400">
                      ({activeFolder.items.length} {activeFolder.items.length === 1 ? 'judgment' : 'judgments'})
                    </span>
                  </h2>
                  {activeFolder.description && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeFolder.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  {/* Precedent Comparison Toggle */}
                  {activeFolder.items.length >= 2 && (
                    <button
                      onClick={() => setShowMatrixView(!showMatrixView)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        showMatrixView
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                      <span>{showMatrixView ? 'Hide Matrix' : 'Compare Matrix'}</span>
                      {selectedForComparison.length > 0 && (
                        <span className="ml-1 bg-white/20 px-1.5 py-0.2 rounded text-[10px]">
                          {selectedForComparison.length}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteFolder(activeFolder.id)}
                    title="Delete Folder"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Precedent Comparison Matrix View */}
              {showMatrixView && (
                <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Columns3 className="w-4 h-4 text-amber-600" />
                        <span>Precedent Comparison Matrix</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Side-by-side judicial holding and coram analysis across selected matters.
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {selectedForComparison.length === 0 ? (
                        <span className="text-amber-600 font-semibold">Select 2 to 5 judgments below to compare</span>
                      ) : (
                        <span>Comparing {selectedForComparison.length} judgments</span>
                      )}
                    </div>
                  </div>

                  {comparisonItems.length < 2 ? (
                    <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                      <p>Select at least 2 judgments using the checkboxes on the cards below to render the matrix.</p>
                      <button
                        onClick={() => setSelectedForComparison(activeFolder.items.slice(0, 3).map(i => i.jid))}
                        className="text-amber-600 hover:underline font-semibold"
                      >
                        Auto-select first {Math.min(3, activeFolder.items.length)} judgments
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 w-32 min-w-[120px]">Attribute</th>
                            {comparisonItems.map(item => (
                              <th key={item.jid} className="p-3 font-semibold text-slate-900 dark:text-slate-100 min-w-[220px]">
                                <div className="space-y-0.5">
                                  <div className="font-mono text-[11px] text-amber-600">{item.caseNo}</div>
                                  <Link to={`/case/${item.jid}`} className="hover:underline line-clamp-2">
                                    {item.title}
                                  </Link>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr>
                            <td className="p-3 font-semibold text-slate-500">Court / Bench</td>
                            {comparisonItems.map(item => (
                              <td key={item.jid} className="p-3 text-slate-700 dark:text-slate-300">
                                {item.courtName}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-500">Date & Outcome</td>
                            {comparisonItems.map(item => (
                              <td key={item.jid} className="p-3 text-slate-700 dark:text-slate-300">
                                <div className="font-mono text-[11px]">{item.decisionDate}</div>
                                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  item.disposal.toLowerCase().includes('allow')
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {item.disposal}
                                </span>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-500">Key Statutes</td>
                            {comparisonItems.map(item => (
                              <td key={item.jid} className="p-3 text-slate-700 dark:text-slate-300">
                                <div className="flex flex-wrap gap-1">
                                  {item.statutes && item.statutes.length > 0 ? (
                                    item.statutes.slice(0, 3).map((st, i) => (
                                      <span key={i} className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                        {st}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-400 italic">None specified</span>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-500">Ratio / Excerpt</td>
                            {comparisonItems.map(item => (
                              <td key={item.jid} className="p-3 text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-[11px]">
                                {item.ratioExcerpt ? (
                                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded line-clamp-6">
                                    "{item.ratioExcerpt}"
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">No excerpt saved</span>
                                )}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-slate-500">Advocate Notes</td>
                            {comparisonItems.map(item => (
                              <td key={item.jid} className="p-3 text-slate-700 dark:text-slate-300 italic">
                                {item.notes ? (
                                  <div className="text-amber-800 dark:text-amber-300 font-medium">
                                    {item.notes}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">No notes written</span>
                                )}
                              </td>
                            ))}
                          </tr>
                          <tr className="print:hidden">
                            <td className="p-3 font-semibold text-slate-500">Actions</td>
                            {comparisonItems.map(item => (
                              <td key={item.jid} className="p-3">
                                <Link
                                  to={`/case/${item.jid}`}
                                  className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-medium"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Open Judgment</span>
                                </Link>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Judgments List */}
              {activeFolder.items.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                  <Folder className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No judgments saved in this folder yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Search for judgments or open any case record, then click "Save" to add it here.
                  </p>
                  <Link
                    to="/search"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
                  >
                    <span>Go to Search</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeFolder.items.map(item => {
                    const isSelectedForComp = selectedForComparison.includes(item.jid);
                    return (
                      <div
                        key={item.jid}
                        className={`bg-white dark:bg-slate-900 border rounded-xl p-5 transition space-y-3 shadow-sm print:border-slate-300 print:shadow-none print:break-inside-avoid ${
                          isSelectedForComp
                            ? 'border-amber-500/70 dark:border-amber-500/50'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-600 dark:text-slate-300 print:hidden">
                              <input
                                type="checkbox"
                                checked={isSelectedForComp}
                                onChange={() => toggleComparisonSelection(item.jid)}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="text-[11px]">Compare</span>
                            </label>
                            <span className="text-slate-300 dark:text-slate-700 print:hidden">•</span>
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 print:bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-amber-700 dark:text-amber-400 print:text-black font-semibold">
                              {item.caseNo}
                            </span>
                            <span className="text-slate-500 truncate">{item.courtName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                              <Calendar className="w-3.5 h-3.5 print:hidden" />
                              {item.decisionDate}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.jid)}
                              title="Remove from folder"
                              className="text-slate-400 hover:text-red-500 transition p-1 print:hidden"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 print:text-black">
                          <Link to={`/case/${item.jid}`} className="hover:text-amber-600 transition">
                            {item.title}
                          </Link>
                        </h4>

                        {/* Excerpt if present */}
                        {item.ratioExcerpt && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 print:text-black p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 print:border-slate-300 line-clamp-2 print:line-clamp-none font-serif">
                            "{item.ratioExcerpt}"
                          </p>
                        )}

                        {/* Statutes Chips */}
                        {item.statutes && item.statutes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.statutes.map((st, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-600 dark:text-slate-400 print:text-black px-2 py-0.5 rounded print:border print:border-slate-300"
                              >
                                <Tag className="w-2.5 h-2.5 text-amber-600 print:hidden" />
                                {st}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Advocate Notes Textarea & Print View */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 print:border-slate-300">
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 print:text-black mb-1.5">
                            <FileEdit className="w-3.5 h-3.5 text-amber-600 print:hidden" />
                            <span>Advocate Notes / Submissions:</span>
                          </div>
                          {/* Visible on Paper / Print */}
                          <div className="hidden print:block font-serif text-xs p-2.5 bg-slate-50 border border-slate-300 rounded whitespace-pre-wrap text-black">
                            {item.notes ? (
                              item.notes
                            ) : (
                              <span className="italic text-slate-400">No advocate notes recorded.</span>
                            )}
                          </div>
                          {/* Interactive Textarea in Browser */}
                          <textarea
                            rows={2}
                            placeholder="Add case notes, hearing points, distinguished facts, or argument strategy..."
                            value={item.notes || ''}
                            onChange={(e) => handleNoteChange(item.jid, e.target.value)}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-400 print:hidden"
                          />
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center text-xs text-slate-500">
              No folder selected.
            </div>
          )}
        </div>

      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-600" />
                <span>Create New Case Folder</span>
              </h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Folder Name / Matter
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. SLP (Crl) No. 4501/2026 or Company Appeals"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quashing of FIR under Sec 482 CrPC"
                  value={newFolderDesc}
                  onChange={e => setNewFolderDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
