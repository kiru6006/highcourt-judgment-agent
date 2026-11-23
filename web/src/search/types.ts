import { SearchFilters } from '../types/schema';

export interface SearchShardRecord {
  jid: string;
  title: string;
  case_no: string;
  court_code: string;
  bench_code: string;
  year: number;
  date: string;
  category: string;
  disposal: string;
  judges: string[];
  statutes: string[];
  excerpt: string;
  has_structured_brief?: boolean;
}

export interface ManifestShard {
  shard_id: string;
  court: string;
  year: number;
  doc_count: number;
  search?: {
    file: string;
    bytes: number;
    sha256: string;
  };
  docs?: {
    file: string;
    bytes: number;
    sha256: string;
  };
}

export interface Manifest {
  version: string;
  generated_at: string;
  total_shards: number;
  total_docs: number;
  shards: ManifestShard[];
}

export interface FacetItem {
  value: string;
  count: number;
}

export interface FacetDistribution {
  courts: FacetItem[];
  years: FacetItem[];
  categories: FacetItem[];
  disposals: FacetItem[];
  statutes: FacetItem[];
}

export interface SearchResultItem extends SearchShardRecord {
  score?: number;
  matchHighlights?: string[];
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  facets: FacetDistribution;
  executionTimeMs: number;
}

export type WorkerRequest =
  | { type: 'INIT'; payload: { manifest: Manifest; shardData: SearchShardRecord[] } }
  | { type: 'LOAD_SHARD_DATA'; payload: { shardId: string; records: SearchShardRecord[] } }
  | { type: 'SEARCH'; payload: { query: string; filters: Partial<SearchFilters>; page?: number; pageSize?: number } };

export type WorkerResponse =
  | { type: 'INIT_SUCCESS'; payload: { totalDocs: number; shardCount: number } }
  | { type: 'SEARCH_SUCCESS'; payload: SearchResponse }
  | { type: 'ERROR'; payload: { message: string } };
