/**
 * NyayaReader Advocate Workspace & Case Folder Store
 * Client-side IndexedDB / LocalStorage workspace.
 * Saves judgments, case notes, web links, and comparison matrices with zero cloud reliance.
 */

export interface SavedJudgmentItem {
  jid: string;
  title: string;
  caseNo: string;
  courtName: string;
  decisionDate: string;
  category: string;
  disposal: string;
  savedAt: string;
  notes?: string;
  statutes?: string[];
  ratioExcerpt?: string;
}

export interface CaseFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  items: SavedJudgmentItem[];
}

const STORAGE_KEY = 'nyayareader_workspace_folders_v1';

const DEFAULT_FOLDERS: CaseFolder[] = [
  {
    id: 'folder-bail',
    name: 'Bail & Quashing Matters',
    description: 'Precedents under Section 482 CrPC and Section 439 CrPC',
    createdAt: '2026-01-01T00:00:00.000Z',
    items: []
  },
  {
    id: 'folder-commercial',
    name: 'Commercial & Arbitration',
    description: 'Section 11 Arbitration Act and Section 138 NI Act precedents',
    createdAt: '2026-01-01T00:00:00.000Z',
    items: []
  }
];

let inMemoryFolders: CaseFolder[] = [...DEFAULT_FOLDERS];
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export const FolderStore = {
  getFolders(): CaseFolder[] {
    if (typeof window === 'undefined') return inMemoryFolders;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return inMemoryFolders;
  },

  saveFolders(folders: CaseFolder[]): void {
    inMemoryFolders = folders;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
      } catch {
        // Fallback
      }
    }
    notify();
  },

  createFolder(name: string, description?: string): CaseFolder {
    const folders = this.getFolders();
    const newFolder: CaseFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
      items: []
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  },

  deleteFolder(folderId: string): void {
    const folders = this.getFolders().filter(f => f.id !== folderId);
    this.saveFolders(folders);
  },

  addJudgmentToFolder(folderId: string, item: SavedJudgmentItem): void {
    const folders = this.getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    // Avoid duplicate in same folder
    if (!folder.items.some(i => i.jid === item.jid)) {
      folder.items.push({
        ...item,
        savedAt: new Date().toISOString()
      });
      this.saveFolders(folders);
    }
  },

  removeJudgmentFromFolder(folderId: string, jid: string): void {
    const folders = this.getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    folder.items = folder.items.filter(i => i.jid !== jid);
    this.saveFolders(folders);
  },

  updateNotes(folderId: string, jid: string, notes: string): void {
    const folders = this.getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const item = folder.items.find(i => i.jid === jid);
    if (item) {
      item.notes = notes;
      this.saveFolders(folders);
    }
  },

  exportWorkspaceJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      folders: this.getFolders()
    };
    return JSON.stringify(data, null, 2);
  },

  importWorkspaceJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.folders)) {
        this.saveFolders(parsed.folders);
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  resetForTests(): void {
    inMemoryFolders = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    notify();
  }
};
