import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchFilters } from '../types/schema';
import { SYNTHETIC_JUDGMENTS } from '../fixtures/synthetic-judgments';
import { LeftRailFacets } from '../components/LeftRailFacets';
import { ResultCard } from '../components/ResultCard';
import { SearchEngine } from '../search/search-engine';
import { SearchResponse, SearchShardRecord } from '../search/types';
import { Scale, SlidersHorizontal, Clock, Database, Globe, ExternalLink, FilterX, Sparkles, X } from 'lucide-react';

interface SearchPageProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  filters,
  onFilterChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [engine] = useState(() => new SearchEngine());
  const [isShardsLoaded, setIsShardsLoaded] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid');

  // Sync from URL search params on mount
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const courts = searchParams.getAll('court');
    const benches = searchParams.getAll('bench');
    const categories = searchParams.getAll('cat');
    const disposals = searchParams.getAll('disposal');
    const caseTypes = searchParams.getAll('case_type');
    const yearFrom = searchParams.get('year_from') ? parseInt(searchParams.get('year_from')!, 10) : undefined;
    const yearTo = searchParams.get('year_to') ? parseInt(searchParams.get('year_to')!, 10) : undefined;

    if (
      q !== filters.query ||
      courts.length !== filters.courts.length ||
      benches.length !== filters.benches.length ||
      categories.length !== filters.categories.length ||
      disposals.length !== filters.disposals.length ||
      caseTypes.length !== filters.caseTypes.length ||
      yearFrom !== filters.yearFrom ||
      yearTo !== filters.yearTo
    ) {
      onFilterChange({
        ...filters,
        query: q,
        courts: courts.length > 0 ? courts : filters.courts,
        benches: benches.length > 0 ? benches : filters.benches,
        categories: categories.length > 0 ? categories : filters.categories,
        disposals: disposals.length > 0 ? disposals : filters.disposals,
        caseTypes: caseTypes.length > 0 ? caseTypes : filters.caseTypes,
        yearFrom: yearFrom || filters.yearFrom,
        yearTo: yearTo || filters.yearTo,
      });
    }
  }, []);

  // Update URL search params when filters change
  const updateUrlParams = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    if (newFilters.query.trim()) params.set('q', newFilters.query.trim());
    newFilters.courts.forEach(c => params.append('court', c));
    newFilters.benches.forEach(b => params.append('bench', b));
    newFilters.categories.forEach(c => params.append('cat', c));
    newFilters.disposals.forEach(d => params.append('disposal', d));
    newFilters.caseTypes.forEach(ct => params.append('case_type', ct));
    if (newFilters.yearFrom) params.set('year_from', String(newFilters.yearFrom));
    if (newFilters.yearTo) params.set('year_to', String(newFilters.yearTo));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleFilterChangeInternal = (newFilters: SearchFilters) => {
    onFilterChange(newFilters);
    updateUrlParams(newFilters);
  };

  // Load real shard data from manifest
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const baseHref = import.meta.env.BASE_URL.endsWith('/')
          ? import.meta.env.BASE_URL
          : `${import.meta.env.BASE_URL}/`;

        const manifestUrl = `${baseHref}data-sample/manifest.json`;
        const mRes = await fetch(manifestUrl);
        if (!mRes.ok) throw new Error('Manifest not found');
        const manifest = await mRes.json();

        for (const shard of manifest.shards) {
          if (shard.search?.file) {
            const shardUrl = `${baseHref}data-sample/${shard.search.file}`;
            const sRes = await fetch(shardUrl);
            if (!sRes.ok) continue;

            let records: SearchShardRecord[] = [];
            if (typeof DecompressionStream !== 'undefined' && sRes.body) {
              const ds = sRes.body.pipeThrough(new DecompressionStream('gzip'));
              const decompResp = new Response(ds);
              records = await decompResp.json();
            } else {
              records = await sRes.json();
            }

            if (isMounted && records.length > 0) {
              engine.addRecords(records, shard.shard_id);
            }
          }

          if (shard.vectors?.file) {
            try {
              const vecUrl = `${baseHref}data-sample/${shard.vectors.file}`;
              const metaUrl = shard.vectors.meta_file
                ? `${baseHref}data-sample/${shard.vectors.meta_file}`
                : null;

              const vRes = await fetch(vecUrl);
              if (vRes.ok) {
                const vecBuf = await vRes.arrayBuffer();
                let jids: string[] = [];
                if (metaUrl) {
                  const mRes2 = await fetch(metaUrl);
                  if (mRes2.ok) {
                    const metaJson = await mRes2.json();
                    jids = metaJson.jids || [];
                  }
                }
                if (isMounted && jids.length > 0) {
                  engine.addVectors(jids, vecBuf, shard.vectors.model, shard.vectors.tokenizer_sha256);
                }
              }
            } catch {
              // Ignore vector load failure and fallback to lexical
            }
          }
        }

        if (isMounted) {
          setIsShardsLoaded(engine.getDocumentCount() > 0);
        }
      } catch {
        // If real shards fail to load, engine remains empty and synthetic fallback takes over
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [engine]);

  // Execute Search whenever query, filters, mode, or shard readiness changes
  useEffect(() => {
    if (isShardsLoaded) {
      const resp = engine.search(filters.query, filters, 1, 50, searchMode);
      setSearchResponse(resp);
    }
  }, [filters, isShardsLoaded, engine, searchMode]);

  // Fallback synthetic filter if shards not loaded
  const fallbackFilteredJudgments = useMemo(() => {
    return SYNTHETIC_JUDGMENTS.filter(doc => {
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase();
        const matchesTitle =
          doc.parties.petitioner.toLowerCase().includes(q) ||
          doc.parties.respondent.toLowerCase().includes(q);
        const matchesCaseNo = doc.case_number.toLowerCase().includes(q);
        const matchesStatute = doc.statutes.some(
          s => s.section.toLowerCase().includes(q) || s.act.toLowerCase().includes(q)
        );
        const matchesText = doc.paragraphs.some(p => p.text.toLowerCase().includes(q));

        if (!matchesTitle && !matchesCaseNo && !matchesStatute && !matchesText) {
          return false;
        }
      }

      if (filters.courts.length > 0 && !filters.courts.includes(doc.court_code)) return false;
      if (filters.coramTypes.length > 0 && !filters.coramTypes.includes(doc.coram_type)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(doc.category)) return false;
      if (filters.caseTypes.length > 0 && !filters.caseTypes.includes(doc.case_type)) return false;
      if (
        filters.disposals.length > 0 &&
        !filters.disposals.some(d => d.toLowerCase() === doc.disposal_nature.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const displayResults = isShardsLoaded && searchResponse
    ? searchResponse.results
    : fallbackFilteredJudgments;

  const totalResultsCount = isShardsLoaded && searchResponse
    ? searchResponse.total
    : fallbackFilteredJudgments.length;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <span>Filters ({totalResultsCount})</span>
        </button>
        <span className="text-xs text-slate-500 font-mono">
          {totalResultsCount} results
        </span>
      </div>

      {/* Left Rail Facets (Desktop + Mobile Drawer) */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
        <LeftRailFacets
          filters={filters}
          onChange={handleFilterChangeInternal}
          corpus={isShardsLoaded ? undefined : SYNTHETIC_JUDGMENTS}
          facetDistribution={searchResponse?.facets}
        />
      </div>

      {/* Results Stream */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Judgments
              </span>
              <span>•</span>
              <span className="font-mono">{totalResultsCount} matches found</span>
              {isShardsLoaded ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  <Database className="w-3 h-3" />
                  Live Shard Ingest ({engine.getDocumentCount()} docs)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                  Synthetic Fixture Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Search Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setSearchMode('keyword')}
                  className={`px-2 py-0.5 rounded transition ${
                    searchMode === 'keyword'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Keyword
                </button>
                <button
                  onClick={() => setSearchMode('semantic')}
                  className={`px-2 py-0.5 rounded transition ${
                    searchMode === 'semantic'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Semantic
                </button>
                <button
                  onClick={() => setSearchMode('hybrid')}
                  className={`px-2 py-0.5 rounded transition ${
                    searchMode === 'hybrid'
                      ? 'bg-amber-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Hybrid (RRF)
                </button>
              </div>

              {searchResponse?.executionTimeMs !== undefined && (
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>{searchResponse.executionTimeMs} ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(filters.courts.length > 0 || filters.benches.length > 0 || filters.categories.length > 0 || filters.disposals.length > 0 || filters.caseTypes.length > 0 || filters.yearFrom || filters.yearTo || filters.query) && (
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              {filters.query && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-mono">
                  <span>q: "{filters.query}"</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, query: '' })}
                    className="hover:text-amber-950 dark:hover:text-amber-100"
                    title="Remove query filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.courts.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                  <span>court: {c}</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, courts: filters.courts.filter(x => x !== c) })}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {filters.benches.map(b => (
                <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                  <span>bench: {b}</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, benches: filters.benches.filter(x => x !== b) })}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {filters.categories.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  <span>cat: {c}</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, categories: filters.categories.filter(x => x !== c) })}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {filters.disposals.map(d => (
                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  <span>disp: {d}</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, disposals: filters.disposals.filter(x => x !== d) })}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {filters.caseTypes.map(ct => (
                <span key={ct} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                  <span>type: {ct}</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, caseTypes: filters.caseTypes.filter(x => x !== ct) })}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {(filters.yearFrom || filters.yearTo) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                  <span>year: {filters.yearFrom || '*'}-{filters.yearTo || '*'}</span>
                  <button
                    onClick={() => handleFilterChangeInternal({ ...filters, yearFrom: undefined, yearTo: undefined })}
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results List or Zero-Results Guide */}
          {displayResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
              <div className="text-center space-y-2">
                <Scale className="w-10 h-10 mx-auto text-amber-600/80 dark:text-amber-500/80" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  No judgments matched in local corpus
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {filters.query
                    ? `No records found in local corpus matching "${filters.query}" with current filters.`
                    : 'No judgments match the selected facet constraints.'}
                </p>

                {/* Filter Recovery Actions */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {(filters.courts.length > 0 || filters.benches.length > 0 || filters.categories.length > 0 || filters.disposals.length > 0 || filters.caseTypes.length > 0 || filters.yearFrom || filters.yearTo) && filters.query && (
                    <button
                      onClick={() =>
                        handleFilterChangeInternal({
                          ...filters,
                          courts: [],
                          benches: [],
                          categories: [],
                          disposals: [],
                          caseTypes: [],
                          yearFrom: undefined,
                          yearTo: undefined,
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-600/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-medium hover:bg-amber-100 transition"
                    >
                      <FilterX className="w-3.5 h-3.5" />
                      <span>Broaden filters (Keep query "{filters.query}")</span>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleFilterChangeInternal({
                        query: '',
                        courts: [],
                        benches: [],
                        categories: [],
                        disposals: [],
                        caseTypes: [],
                        purposes: [],
                        coramTypes: [],
                        yearFrom: undefined,
                        yearTo: undefined,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>

              {/* Multi-Source Fallback Card if query typed */}
              {filters.query.trim() && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span>Search Pre-filled on Public & Official Portals</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      Zero-Key Fallback
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    If this matter is from a different High Court or year outside the pilot corpus, launch a direct search with query <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">"{filters.query}"</span>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(filters.query.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition">
                          Indian Kanoon
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Search all High Courts & Supreme Court
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition" />
                    </a>

                    <a
                      href={`https://judgments.ecourts.gov.in/pdfsearch/?query=${encodeURIComponent(filters.query.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition">
                          eCourts Judgments Portal
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Search official national digital court repository
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition" />
                    </a>

                    <a
                      href="https://www.hcmadras.tn.nic.in/case_status.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition">
                          Madras High Court Portal
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Official Principal Seat & Madurai Bench Judis
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition" />
                    </a>

                    <Link
                      to={`/links?q=${encodeURIComponent(filters.query.trim())}`}
                      className="p-3 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-semibold text-xs text-amber-900 dark:text-amber-200 group-hover:underline">
                          Multi-Source Link Hub →
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Configure CNR, Bombay, Delhi, or Kanoon queries
                        </div>
                      </div>
                      <Globe className="w-3.5 h-3.5 text-amber-600" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Research Suggestions when empty query */}
              {!filters.query.trim() && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Popular Legal Research Propositions to Try:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Section 482 CrPC quashing FIR',
                      'Bail Section 439 CrPC',
                      'Section 138 Negotiable Instruments Act',
                      'Bhajan Lal quashing principles',
                      'Article 226 maintainability',
                      'Section 11 Arbitration Act arbitrator',
                      'Crl.O.P. No. 100 of 2022',
                    ].map(sampleQ => (
                      <button
                        key={sampleQ}
                        onClick={() => handleFilterChangeInternal({ ...filters, query: sampleQ })}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 text-slate-600 dark:text-slate-400 transition"
                      >
                        "{sampleQ}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            displayResults.map((doc: any) => (
              <ResultCard key={doc.jid} judgment={doc} />
            ))
          )}

        </div>
      </main>
    </div>
  );
};
