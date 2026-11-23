import MiniSearch from 'minisearch';
import { parseLegalQuery } from './query-parser';
import {
  SearchShardRecord,
  SearchResultItem,
  SearchResponse,
  FacetDistribution,
  FacetItem
} from './types';
import { SearchFilters } from '../types/schema';

export class SearchEngine {
  private miniSearch: MiniSearch;
  private documents: Map<string, SearchShardRecord> = new Map();
  private loadedShards: Set<string> = new Set();

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

  public getDocumentCount(): number {
    return this.documents.size;
  }

  public search(
    queryText: string,
    filters: Partial<SearchFilters> = {},
    page: number = 1,
    pageSize: number = 20
  ): SearchResponse {
    const startTime = performance.now();
    const parsed = parseLegalQuery(queryText);

    let candidates: { jid: string; score: number }[] = [];

    const effectiveQuery = parsed.cleanText || parsed.raw;

    if (effectiveQuery.trim().length > 0) {
      // First try AND combination for precision
      let miniResults = this.miniSearch.search(effectiveQuery, {
        boost: parsed.boosts,
        prefix: true,
        fuzzy: 0.15,
        combineWith: 'AND'
      });

      // If no results, fallback to OR combination for recall
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

      // Filter court
      if (filters.courts && filters.courts.length > 0) {
        if (!filters.courts.includes(doc.court_code)) return false;
      }

      // Filter category
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(doc.category)) return false;
      }

      // Filter disposal
      if (filters.disposals && filters.disposals.length > 0) {
        if (!filters.disposals.includes(doc.disposal)) return false;
      }

      // Filter years
      if (filters.yearFrom && doc.year < filters.yearFrom) return false;
      if (filters.yearTo && doc.year > filters.yearTo) return false;

      // Filter bench
      if (filters.benches && filters.benches.length > 0) {
        if (!filters.benches.includes(doc.bench_code)) return false;
      }

      return true;
    });

    // Compute Facet Distribution over all candidates matching the search query (before specific facet filters)
    const facets = this.computeFacets(candidates.map(c => this.documents.get(c.jid)!));

    // Pagination
    const offset = Math.max(0, (page - 1) * pageSize);
    const paged = filteredCandidates.slice(offset, offset + pageSize);

    const results: SearchResultItem[] = paged.map(cand => {
      const doc = this.documents.get(cand.jid)!;
      return {
        ...doc,
        score: cand.score
      };
    });

    const executionTimeMs = performance.now() - startTime;

    return {
      results,
      total: filteredCandidates.length,
      page,
      pageSize,
      facets,
      executionTimeMs: Math.round(executionTimeMs * 100) / 100
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
