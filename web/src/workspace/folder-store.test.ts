import { describe, it, expect, beforeEach } from 'vitest';
import { FolderStore, SavedJudgmentItem } from './folder-store';

describe('FolderStore Workspace & Bookmarks', () => {
  beforeEach(() => {
    FolderStore.resetForTests();
  });

  it('initializes with default case folders', () => {
    const folders = FolderStore.getFolders();
    expect(folders.length).toBeGreaterThanOrEqual(2);
    expect(folders[0].name).toContain('Bail');
  });

  it('creates new case folder', () => {
    const created = FolderStore.createFolder('Arbitration Claims 2026', 'Interim injunctions');
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Arbitration Claims 2026');

    const folders = FolderStore.getFolders();
    expect(folders.some(f => f.id === created.id)).toBe(true);
  });

  it('adds judgment to folder and updates advocate notes', () => {
    const folders = FolderStore.getFolders();
    const folderId = folders[0].id;

    const item: SavedJudgmentItem = {
      jid: 'test-jid-001',
      title: 'Petitioner v. Respondent',
      caseNo: 'Crl.O.P. No. 123/2022',
      courtName: 'Madras High Court',
      decisionDate: '2022-05-10',
      category: 'Criminal',
      disposal: 'Allowed',
      savedAt: new Date().toISOString(),
      statutes: ['CrPC 482']
    };

    FolderStore.addJudgmentToFolder(folderId, item);
    const updated = FolderStore.getFolders().find(f => f.id === folderId);
    expect(updated?.items).toHaveLength(1);
    expect(updated?.items[0].jid).toBe('test-jid-001');

    // Update notes
    FolderStore.updateNotes(folderId, 'test-jid-001', 'Crucial precedent for anticipatory bail argument.');
    const withNotes = FolderStore.getFolders().find(f => f.id === folderId);
    expect(withNotes?.items[0].notes).toBe('Crucial precedent for anticipatory bail argument.');
  });

  it('deletes folder and removes judgment', () => {
    const created = FolderStore.createFolder('Temporary Folder');
    FolderStore.deleteFolder(created.id);
    const folders = FolderStore.getFolders();
    expect(folders.some(f => f.id === created.id)).toBe(false);
  });

  it('exports and imports workspace JSON cleanly', () => {
    FolderStore.createFolder('Export Test Folder');
    const jsonStr = FolderStore.exportWorkspaceJSON();
    expect(jsonStr).toContain('Export Test Folder');

    FolderStore.resetForTests();
    expect(FolderStore.getFolders().some(f => f.name === 'Export Test Folder')).toBe(false);

    const success = FolderStore.importWorkspaceJSON(jsonStr);
    expect(success).toBe(true);
    expect(FolderStore.getFolders().some(f => f.name === 'Export Test Folder')).toBe(true);
  });
});
