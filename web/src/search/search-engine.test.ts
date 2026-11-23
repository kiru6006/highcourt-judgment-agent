import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine } from './search-engine';
import { SearchShardRecord } from './types';

describe('SearchEngine (BM25 + Facet Oracle)', () => {
  let engine: SearchEngine;

  const sampleRecords: SearchShardRecord[] = [
    {
      jid: 'j1',
      title: 'K. S. Shanmugam v. State of Tamil Nadu',
      case_no: 'Crl.O.P. No. 1234 of 2022',
      court_code: '33_10',
      bench_code: '01',
      year: 2022,
      date: '2022-03-15',
      category: 'Criminal',
      disposal: 'Allowed',
      judges: ['Justice Anand Venkatesh'],
      statutes: ['CrPC 482', 'IPC 420'],
      excerpt: 'Criminal original petition filed under Section 482 of CrPC to quash the charge sheet.'
    },
    {
      jid: 'j2',
      title: 'M/s ABC Enterprises v. Commercial Tax Officer',
      case_no: 'W.P. No. 5678 of 2022',
      court_code: '33_10',
      bench_code: '01',
      year: 2022,
      date: '2022-04-20',
      category: 'Tax',
      disposal: 'Dismissed',
      judges: ['Justice C. Saravanan'],
      statutes: ['Constitution 226', 'GST Act 73'],
      excerpt: 'Writ petition challenging assessment order passed under Section 73 of GST Act.'
    },
    {
      jid: 'j3',
      title: 'Ramesh Kumar v. Union of India',
      case_no: 'Crl.A. No. 890 of 2021',
      court_code: '7_26',
      bench_code: '01',
      year: 2021,
      date: '2021-11-10',
      category: 'Criminal',
      disposal: 'Disposed Of',
      judges: ['Justice Mukta Gupta'],
      statutes: ['CrPC 389', 'IPC 302'],
      excerpt: 'Criminal appeal seeking suspension of sentence during pendency of appeal.'
    }
  ];

  beforeEach(() => {
    engine = new SearchEngine();
    engine.addRecords(sampleRecords);
  });

  it('indexes documents and reports total count', () => {
    expect(engine.getDocumentCount()).toBe(3);
  });

  it('searches by keyword with BM25 scoring', () => {
    const res = engine.search('quash charge sheet');
    expect(res.total).toBe(1);
    expect(res.results[0].jid).toBe('j1');
    expect(res.results[0].score).toBeGreaterThan(0);
  });

  it('searches by case number', () => {
    const res = engine.search('Crl.O.P. No. 1234');
    expect(res.total).toBe(1);
    expect(res.results[0].jid).toBe('j1');
  });

  it('returns all documents sorted by date on empty query', () => {
    const res = engine.search('');
    expect(res.total).toBe(3);
    expect(res.results[0].jid).toBe('j2'); // 2022-04-20
    expect(res.results[1].jid).toBe('j1'); // 2022-03-15
    expect(res.results[2].jid).toBe('j3'); // 2021-11-10
  });

  it('applies court and category facet filters', () => {
    const resCourt = engine.search('', { courts: ['7_26'] });
    expect(resCourt.total).toBe(1);
    expect(resCourt.results[0].jid).toBe('j3');

    const resCat = engine.search('', { categories: ['Tax'] });
    expect(resCat.total).toBe(1);
    expect(resCat.results[0].jid).toBe('j2');
  });

  it('computes accurate facet distributions matching query candidates', () => {
    const res = engine.search('Criminal');
    expect(res.facets.courts).toEqual(
      expect.arrayContaining([
        { value: '33_10', count: 1 },
        { value: '7_26', count: 1 }
      ])
    );
    expect(res.facets.categories).toEqual(
      expect.arrayContaining([
        { value: 'Criminal', count: 2 }
      ])
    );
    expect(res.facets.years).toEqual(
      expect.arrayContaining([
        { value: '2022', count: 1 },
        { value: '2021', count: 1 }
      ])
    );
  });

  it('completes query in under 50ms', () => {
    const res = engine.search('Section 482 CrPC');
    expect(res.executionTimeMs).toBeLessThan(50);
  });
});
