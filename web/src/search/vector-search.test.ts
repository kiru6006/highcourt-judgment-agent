import { describe, it, expect } from 'vitest';
import { VectorEngine, BYTES_PER_VECTOR, VECTOR_DIM } from './vector-search';
import { reciprocalRankFusion } from './hybrid-search';
import { SearchEngine } from './search-engine';
import { SearchShardRecord } from './types';

describe('Vector Engine & Hybrid RRF Search', () => {
  it('encodes query into unit-normalized Float32Array of 384 dimensions', () => {
    const vec = VectorEngine.encodeQuery('Section 482 CrPC quash proceedings');
    expect(vec).toHaveLength(VECTOR_DIM);
    let normSq = 0;
    for (let i = 0; i < VECTOR_DIM; i++) {
      normSq += vec[i] * vec[i];
    }
    expect(Math.abs(Math.sqrt(normSq) - 1.0)).toBeLessThan(1e-4);
  });

  it('verifies manifest model and tokenizer hash strictly', () => {
    const engine = new VectorEngine();
    expect(
      engine.verifyModel(
        'BAAI/bge-small-en-v1.5',
        '8a2f4c9b1e0d3f7a6c5b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b'
      )
    ).toBe(true);

    // Mismatched model must fail
    expect(engine.verifyModel('all-MiniLM-L6-v2', 'some-hash')).toBe(false);
  });

  it('performs int8 dot product vector search', () => {
    const engine = new VectorEngine();
    const jids = ['doc1', 'doc2'];
    const buffer = new ArrayBuffer(jids.length * BYTES_PER_VECTOR);
    const view = new DataView(buffer);
    const int8 = new Int8Array(buffer);

    // Vector 1 (doc1): scale 0.01, elements all +10
    view.setFloat32(0, 0.01, true);
    for (let k = 0; k < VECTOR_DIM; k++) {
      int8[4 + k] = 10;
    }

    // Vector 2 (doc2): scale 0.01, elements all -10
    const offset2 = BYTES_PER_VECTOR;
    view.setFloat32(offset2, 0.01, true);
    for (let k = 0; k < VECTOR_DIM; k++) {
      int8[offset2 + 4 + k] = -10;
    }

    engine.loadVectors(jids, buffer);

    // Positive query vector
    const queryVec = new Float32Array(VECTOR_DIM);
    for (let k = 0; k < VECTOR_DIM; k++) {
      queryVec[k] = 1.0 / Math.sqrt(VECTOR_DIM);
    }

    const matches = engine.search(queryVec, 2);
    expect(matches).toHaveLength(2);
    expect(matches[0].jid).toBe('doc1');
    expect(matches[0].similarity).toBeGreaterThan(0);
    expect(matches[1].jid).toBe('doc2');
    expect(matches[1].similarity).toBeLessThan(0);
  });

  it('combines rankings via Reciprocal Rank Fusion (RRF)', () => {
    const bm25 = [
      { jid: 'j1', score: 10.5 },
      { jid: 'j2', score: 8.2 },
      { jid: 'j3', score: 5.1 }
    ];
    const vec = [
      { jid: 'j2', similarity: 0.89 },
      { jid: 'j1', similarity: 0.72 },
      { jid: 'j4', similarity: 0.65 }
    ];

    const fused = reciprocalRankFusion(bm25, vec, 60, 0.5, 0.5);
    expect(fused.length).toBe(4);

    // j1 rank 1 in BM25 (0.5/61), rank 2 in Vec (0.5/62) = 0.00819 + 0.00806 = 0.01625
    // j2 rank 2 in BM25 (0.5/62), rank 1 in Vec (0.5/61) = 0.00806 + 0.00819 = 0.01625
    expect(fused[0].rrfScore).toBeGreaterThan(0.015);
    expect(fused.find(f => f.jid === 'j4')?.bm25Rank).toBeUndefined();
    expect(fused.find(f => f.jid === 'j4')?.vectorRank).toBe(3);
  });

  it('executes hybrid search mode on SearchEngine', () => {
    const engine = new SearchEngine();
    const record: SearchShardRecord = {
      jid: 'j-test-1',
      title: 'State v. Cheating Accused',
      case_no: 'Crl.OP 100/2022',
      court_code: '33_10',
      bench_code: '01',
      year: 2022,
      date: '2022-01-01',
      category: 'Criminal',
      disposal: 'Allowed',
      judges: ['Justice Test'],
      statutes: ['IPC 420'],
      excerpt: 'Quashing criminal proceedings under section 420 IPC'
    };
    engine.addRecords([record]);

    const buffer = new ArrayBuffer(BYTES_PER_VECTOR);
    new DataView(buffer).setFloat32(0, 0.01, true);
    new Int8Array(buffer).fill(5, 4, 388);
    engine.addVectors(['j-test-1'], buffer);

    expect(engine.hasSemanticCapability).toBe(true);

    const resHybrid = engine.search('quash cheating', {}, 1, 10, 'hybrid');
    expect(resHybrid.mode).toBe('hybrid');
    expect(resHybrid.total).toBe(1);
    expect(resHybrid.results[0].jid).toBe('j-test-1');
  });
});
