import { describe, it, expect, beforeEach } from 'vitest';
import { fetchJudgmentDocument, clearDocumentCache } from './doc-loader';
import { lookupTransition, OFFICIAL_STATUTE_TRANSITIONS } from '../constants/statute-bridge';

describe('Document Loader & Statute Transition Bridge', () => {
  beforeEach(() => {
    clearDocumentCache();
  });

  it('loads synthetic fixtures instantly by JID', async () => {
    const doc = await fetchJudgmentDocument('synth-hc-madras-001');
    expect(doc).toBeDefined();
    expect(doc?.court_code).toBe('33~10');
    expect(doc?.paragraphs.length).toBeGreaterThan(0);
    expect(doc?.is_synthetic).toBe(true);
  });

  it('returns null for non-existent JID', async () => {
    const doc = await fetchJudgmentDocument('non-existent-jid-12345');
    expect(doc).toBeNull();
  });

  it('maps CrPC Section 482 to BNSS Section 528 with official gazette source', () => {
    const transition = lookupTransition('CrPC', '482');
    expect(transition).toBeDefined();
    expect(transition?.newAct).toBe('BNSS');
    expect(transition?.newSection).toBe('528');
    expect(transition?.mappingSource).toBe('OFFICIAL_GAZETTE');
  });

  it('maps IPC Section 420 to BNS Section 318', () => {
    const transition = lookupTransition('IPC', '420');
    expect(transition).toBeDefined();
    expect(transition?.newAct).toBe('BNS');
    expect(transition?.newSection).toBe('318');
  });

  it('maps IEA Section 65B to BSA Section 63', () => {
    const transition = lookupTransition('IEA', '65B');
    expect(transition).toBeDefined();
    expect(transition?.newAct).toBe('BSA');
    expect(transition?.newSection).toBe('63');
  });

  it('has zero TEST_ONLY rows in official statute transition tables', () => {
    const testOnlyRows = OFFICIAL_STATUTE_TRANSITIONS.filter(t => t.mappingSource === 'TEST_ONLY');
    expect(testOnlyRows).toHaveLength(0);
  });

  it('supports reverse lookup from new enactments to legacy codes', () => {
    const reverse = lookupTransition('BNSS', '528');
    expect(reverse).toBeDefined();
    expect(reverse?.newAct).toBe('CrPC');
    expect(reverse?.newSection).toBe('482');
    expect(reverse?.isReverseLookup).toBe(true);

    const bnsReverse = lookupTransition('BNS', '318');
    expect(bnsReverse).toBeDefined();
    expect(bnsReverse?.newAct).toBe('IPC');
    expect(bnsReverse?.newSection).toBe('420');
  });

  it('correctly flags substantively altered provisions', () => {
    const remand = lookupTransition('CrPC', '167');
    expect(remand).toBeDefined();
    expect(remand?.equivalenceType).toBe('SUBSTANTIVELY_ALTERED');
    expect(remand?.notes).toContain('Substantively Altered');
  });

  it('maps new criminal procedure additions such as notice of appearance', () => {
    const notice = lookupTransition('CrPC', '41A');
    expect(notice).toBeDefined();
    expect(notice?.newAct).toBe('BNSS');
    expect(notice?.newSection).toBe('35(3)');
  });
});
