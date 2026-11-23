import MiniSearch from 'minisearch';
import { parseLegalQuery } from './query-parser';
import {
  SearchShardRecord,
  SearchResultItem,
  SearchResponse,
  FacetDistribution,
  FacetItem,
  SearchMode
} from './types';
import { SearchFilters } from '../types/schema';
import { VectorEngine } from './vector-search';
import { reciprocalRankFusion } from './hybrid-search';

export class SearchEngine {
  private miniSearch: MiniSearch;
  private vectorEngine: VectorEngine;
  private documents: Map<string, SearchShardRecord> = new Map();
  private loadedShards: Set<string> = new Set();
  private hasVectors: boolean = false;

  constructor() {
    this.miniSearch = new MiniSearch({
      idField: 'jid',
      fields: ['title', 'case_no', 'statutes', 'category', 'disposal', 'excerpt', 'judges'],
      storeFields: ['jid', 'title', 'case_no', 'court_code', 'year', 'date', 'category', 'disposal'],
      searchOptions: {
        boost: {
          title: 3.0,
          case_no: 3.5,
          statutes: 2.5,
          category: 1.5,
          excerpt: 1.0
        },
        prefix: true,
        fuzzy: 0.15,
        combineWith: 'AND'
      }
    });
    this.vectorEngine = new VectorEngine();
  }

  public addRecords(records: SearchShardRecord[], shardId?: string): void {
    const toAdd: SearchShardRecord[] = [];
    for (const r of records) {
      if (!this.documents.has(r.jid)) {
        this.documents.set(r.jid, r);
        toAdd.push(r);
      }
    }
    if (toAdd.length > 0) {
      const indexable = toAdd.map(d => ({
        ...d,
        statutes: Array.isArray(d.statutes) ? d.statutes.join(' ') : (d.statutes || ''),
        judges: Array.isArray(d.judges) ? d.judges.join(' ') : (d.judges || '')
      }));
      this.miniSearch.addAll(indexable);
    }
    if (shardId) {
      this.loadedShards.add(shardId);
    }
  }

  public addVectors(
    jids: string[],
    buffer: ArrayBuffer,
    model: string = 'BAAI/bge-small-en-v1.5',
    tokenizerHash: string = '8a2f4c9b1e0d3f7a6c5b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b'
  ): boolean {
    const verified = this.vectorEngine.verifyModel(model, tokenizerHash);
    if (!verified) {
      console.warn(`Vector model verification failed for ${model}`);
      return false;
    }
    this.vectorEngine.loadVectors(jids, buffer);
    this.hasVectors = true;
    return true;
  }

  public getDocumentCount(): number {
    return this.documents.size;
  }

  public get hasSemanticCapability(): boolean {
    return this.hasVectors;
  }

  public search(
    queryText: string,
    filters: Partial<SearchFilters> = {},
    page: number = 1,
    pageSize: number = 20,
    mode: SearchMode = 'keyword'
  ): SearchResponse {
    const startTime = performance.now();
    const parsed = parseLegalQuery(queryText);
    const effectiveQuery = parsed.cleanText || parsed.raw;

    let candidates: { jid: string; score: number; vectorSimilarity?: number; rrfScore?: number }[] = [];

    // Mode fallback: if semantic/hybrid requested but no vectors loaded, fallback to keyword
    const effectiveMode = (mode === 'semantic' || mode === 'hybrid') && !this.hasVectors
      ? 'keyword'
      : mode;

    if (effectiveQuery.trim().length > 0) {
      if (effectiveMode === 'semantic') {
        // Pure Semantic Vector Search
        const queryVec = VectorEngine.encodeQuery(effectiveQuery);
        const vecMatches = this.vectorEngine.search(queryVec, 100);
        candidates = vecMatches.map(m => ({
          jid: m.jid,
          score: m.similarity,
          vectorSimilarity: m.similarity
        }));
      } else if (effectiveMode === 'hybrid') {
        // Hybrid Retrieval: BM25 + Vector Search fused via RRF
        let bm25Matches = this.miniSearch.search(effectiveQuery, {
          boost: parsed.boosts,
          prefix: true,
          fuzzy: 0.15,
          combineWith: 'AND'
        });
        if (bm25Matches.length === 0) {
          bm25Matches = this.miniSearch.search(effectiveQuery, {
            boost: parsed.boosts,
            prefix: true,
            fuzzy: 0.15,
            combineWith: 'OR'
          });
        }

        const queryVec = VectorEngine.encodeQuery(effectiveQuery);
        const vecMatches = this.vectorEngine.search(queryVec, 100);

        const fused = reciprocalRankFusion(
          bm25Matches.map(m => ({ jid: m.id, score: m.score })),
          vecMatches,
          60,
          0.5,
          0.5
        );

        candidates = fused.map(f => ({
          jid: f.jid,
          score: f.rrfScore,
          rrfScore: f.rrfScore,
          vectorSimilarity: f.vectorSimilarity
        }));
      } else {
        // Pure Keyword BM25 Search
        let miniResults = this.miniSearch.search(effectiveQuery, {
          boost: parsed.boosts,
          prefix: true,
          fuzzy: 0.15,
          combineWith: 'AND'
        });
        if (miniResults.length === 0) {
          miniResults = this.miniSearch.search(effectiveQuery, {
            boost: parsed.boosts,
            prefix: true,
            fuzzy: 0.15,
            combineWith: 'OR'
          });
        }
        candidates = miniResults.map(r => ({
          jid: r.id,
          score: r.score
        }));
      }
    } else {
      // Empty query: all documents ordered by date descending
      for (const doc of this.documents.values()) {
        candidates.push({ jid: doc.jid, score: 1.0 });
      }
      candidates.sort((a, b) => {
        const da = this.documents.get(a.jid)?.date || '';
        const db = this.documents.get(b.jid)?.date || '';
        return db.localeCompare(da);
      });
    }

    // Filter by facets
    const filteredCandidates = candidates.filter(cand => {
      const doc = this.documents.get(cand.jid);
      if (!doc) return false;

      if (filters.courts && filters.courts.length > 0) {
        if (!filters.courts.includes(doc.court_code)) return false;
      }
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(doc.category)) return false;
      }
      if (filters.disposals && filters.disposals.length > 0) {
        if (!filters.disposals.includes(doc.disposal)) return false;
      }
      if (filters.yearFrom && doc.year < filters.yearFrom) return false;
      if (filters.yearTo && doc.year > filters.yearTo) return false;
      if (filters.benches && filters.benches.length > 0) {
        if (!filters.benches.includes(doc.bench_code)) return false;
      }

      return true;
    });

    // Compute Facet Distribution over candidates
    const facets = this.computeFacets(
      candidates
        .map(c => this.documents.get(c.jid))
        .filter((d): d is SearchShardRecord => !!d)
    );

    // Pagination
    const offset = Math.max(0, (page - 1) * pageSize);
    const paged = filteredCandidates.slice(offset, offset + pageSize);

    const results: SearchResultItem[] = paged.map(cand => {
      const doc = this.documents.get(cand.jid)!;
      return {
        ...doc,
        score: cand.score,
        vectorSimilarity: cand.vectorSimilarity,
        rrfScore: cand.rrfScore
      };
    });

    const executionTimeMs = performance.now() - startTime;

    return {
      results,
      total: filteredCandidates.length,
      page,
      pageSize,
      facets,
      executionTimeMs: Math.round(executionTimeMs * 100) / 100,
      mode: effectiveMode
    };
  }

  private computeFacets(docs: SearchShardRecord[]): FacetDistribution {
    const courtMap = new Map<string, number>();
    const yearMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    const disposalMap = new Map<string, number>();
    const statuteMap = new Map<string, number>();

    for (const doc of docs) {
      if (doc.court_code) {
        courtMap.set(doc.court_code, (courtMap.get(doc.court_code) || 0) + 1);
      }
      if (doc.year) {
        const yStr = String(doc.year);
        yearMap.set(yStr, (yearMap.get(yStr) || 0) + 1);
      }
      if (doc.category) {
        categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
      }
      if (doc.disposal) {
        disposalMap.set(doc.disposal, (disposalMap.get(doc.disposal) || 0) + 1);
      }
      if (doc.statutes && Array.isArray(doc.statutes)) {
        for (const st of doc.statutes) {
          statuteMap.set(st, (statuteMap.get(st) || 0) + 1);
        }
      }
    }

    const toSortedItems = (m: Map<string, number>): FacetItem[] => {
      return Array.from(m.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      courts: toSortedItems(courtMap),
      years: toSortedItems(yearMap),
      categories: toSortedItems(categoryMap),
      disposals: toSortedItems(disposalMap),
      statutes: toSortedItems(statuteMap)
    };
  }
}
