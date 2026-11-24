import { SearchFilters } from '../types/schema';

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export interface SearchShardRecord {
  jid: string;
  cnr?: string;
  title: string;
  case_no: string;
  raw_case_type?: string;
  normalized_case_type?: string;
  court_code: string;
  bench_code: string;
  bench_name?: string;
  jurisdiction_type?: string;
  coram_type?: string;
  year: number;
  date: string;
  category: string;
  subjects?: string[];
  disposal: string;
  outcome?: string;
  document_type?: string;
  judges: string[];
  advocates?: string[];
  parties?: {
    petitioner?: string;
    respondent?: string;
  };
  statutes: string[];
  statute_sections?: string[];
  cited_cases?: string[];
  source_provider?: string;
  source_verified?: boolean;
  has_full_text?: boolean;
  has_pdf?: boolean;
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
  vectors?: {
    file: string;
    meta_file?: string | null;
    bytes: number;
    sha256: string;
    model: string;
    revision?: string;
    tokenizer_sha256?: string;
    dim: number;
    quantization: string;
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
  benches?: FacetItem[];
  years: FacetItem[];
  categories: FacetItem[];
  caseTypes?: FacetItem[];
  corams?: FacetItem[];
  disposals: FacetItem[];
  outcomes?: FacetItem[];
  documentTypes?: FacetItem[];
  statutes: FacetItem[];
}

export interface SearchResultItem extends SearchShardRecord {
  score?: number;
  vectorSimilarity?: number;
  rrfScore?: number;
  matchHighlights?: string[];
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  facets: FacetDistribution;
  executionTimeMs: number;
  mode?: SearchMode;
}

export type WorkerRequest =
  | { type: 'INIT'; payload: { manifest: Manifest; shardData: SearchShardRecord[] } }
  | { type: 'LOAD_SHARD_DATA'; payload: { shardId: string; records: SearchShardRecord[] } }
  | {
      type: 'SEARCH';
      payload: {
        query: string;
        filters: Partial<SearchFilters>;
        mode?: SearchMode;
        page?: number;
        pageSize?: number;
      };
    };

export type WorkerResponse =
  | { type: 'INIT_SUCCESS'; payload: { totalDocs: number; shardCount: number } }
  | { type: 'SEARCH_SUCCESS'; payload: SearchResponse }
  | { type: 'ERROR'; payload: { message: string } };
