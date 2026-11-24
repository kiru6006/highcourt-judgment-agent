import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchFilters, JudgmentDocument } from '../types/schema';
import { FacetDistribution } from '../search/types';
import { APP_CONFIG } from '../constants/app.constants';

interface LeftRailFacetsProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  corpus?: JudgmentDocument[];
  facetDistribution?: FacetDistribution;
}

export const LeftRailFacets: React.FC<LeftRailFacetsProps> = ({
  filters,
  onChange,
  corpus = [],
  facetDistribution
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper to toggle item in array
  const toggleItem = (list: string[], item: string): string[] => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const hasActiveFilters =
    filters.courts.length > 0 ||
    filters.benches.length > 0 ||
    filters.categories.length > 0 ||
    filters.disposals.length > 0 ||
    filters.coramTypes.length > 0 ||
    filters.caseTypes.length > 0 ||
    (filters.yearFrom !== undefined && filters.yearFrom !== null) ||
    (filters.yearTo !== undefined && filters.yearTo !== null);

  const clearAll = () => {
    onChange({
      ...filters,
      courts: [],
      benches: [],
      coramTypes: [],
      categories: [],
      caseTypes: [],
      disposals: [],
      purposes: [],
      yearFrom: undefined,
      yearTo: undefined
    });
  };

  // Coverage statistics computation across corpus (defaults to 100% when shards/distribution loaded without full raw corpus)
  const totalDocs = corpus && corpus.length > 0 ? corpus.length : 50;
  const courtCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.court_code).length / totalDocs) * 100) : 100;
  const benchCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.bench_code || !!d.bench_name).length / totalDocs) * 100) : 100;
  const yearCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.decision_date).length / totalDocs) * 100) : 100;
  const categoryCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.category).length / totalDocs) * 100) : 100;
  const disposalCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.disposal_nature).length / totalDocs) * 100) : 100;
  const coramCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.coram_type).length / totalDocs) * 100) : 100;
  const caseTypeCoverage = corpus && corpus.length > 0 ? Math.round((corpus.filter(d => !!d.case_type).length / totalDocs) * 100) : 100;

  // Live count lookup maps from facetDistribution if available
  const courtCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.courts) {
      for (const item of facetDistribution.courts) {
        map.set(item.value, item.count);
      }
    }
    return map;
  }, [facetDistribution]);

  const yearCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.years) {
      for (const item of facetDistribution.years) {
        map.set(item.value, item.count);
      }
    }
    return map;
  }, [facetDistribution]);

  const catCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.categories) {
      for (const item of facetDistribution.categories) {
        map.set(item.value, item.count);
      }
    }
    return map;
  }, [facetDistribution]);

  const dispCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.disposals) {
      for (const item of facetDistribution.disposals) {
        map.set(item.value.toLowerCase(), item.count);
      }
    }
    return map;
  }, [facetDistribution]);

  const getCourtCount = (courtCode: string) => {
    if (facetDistribution) return courtCountMap.get(courtCode) || 0;
    return corpus.filter(d => d.court_code === courtCode).length;
  };

  const getYearCount = (yr: number) => {
    if (facetDistribution) return yearCountMap.get(String(yr)) || 0;
    return corpus.filter(d => d.decision_date?.startsWith(String(yr)) || (d as any).year === yr).length;
  };

  const getBenchCount = (benchCode: string) => {
    return corpus.filter(d => d.bench_code === benchCode).length;
  };

  const relevantBenches = React.useMemo(() => {
    if (filters.courts.length === 0) return APP_CONFIG.BENCHES.slice(0, 4);
    return APP_CONFIG.BENCHES.filter(b => filters.courts.includes(b.court_code));
  }, [filters.courts]);

  const getCategoryCount = (cat: string) => {
    if (facetDistribution) return catCountMap.get(cat) || 0;
    return corpus.filter(d => d.category === cat).length;
  };

  const getDisposalCount = (disp: string) => {
    if (facetDistribution) return dispCountMap.get(disp.toLowerCase()) || 0;
    return corpus.filter(d => d.disposal_nature.toLowerCase() === disp.toLowerCase()).length;
  };

  const getCoramCount = (coram: string) => {
    return corpus.filter(d => d.coram_type === coram).length;
  };

  const availableCaseTypes = React.useMemo(() => {
    return Array.from(
      new Set(
        corpus
          .filter(d => filters.courts.length === 0 || filters.courts.includes(d.court_code))
          .map(d => d.case_type)
      )
    ).sort();
  }, [corpus, filters.courts]);

  return (
    <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <Filter className="w-4 h-4 text-amber-600" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* High Court Filter */}
      {courtCoverage >= 5 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              High Court
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
              {courtCoverage}%
            </span>
          </div>
          <div className="space-y-1.5">
            {APP_CONFIG.DEFAULT_COURTS.map(court => {
              const count = getCourtCount(court.code);
              const isChecked = filters.courts.includes(court.code);
              return (
                <label
                  key={court.code}
                  className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onChange({
                          ...filters,
                          courts: toggleItem(filters.courts, court.code),
                        })
                      }
                      className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                    />
                    <span className={isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {court.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Bench Selection */}
      {benchCoverage >= 5 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bench / Seat
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
              {benchCoverage}%
            </span>
          </div>
          <div className="space-y-1.5">
            {relevantBenches.map(bench => {
              const isChecked = filters.benches.includes(bench.code);
              const count = getBenchCount(bench.code);
              return (
                <label
                  key={bench.code}
                  className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onChange({
                          ...filters,
                          benches: toggleItem(filters.benches, bench.code),
                        })
                      }
                      className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                    />
                    <span className={isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {bench.name}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision Year Range */}
      {yearCoverage >= 5 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Decision Year
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
                {yearCoverage}%
              </span>
            </div>
            {(filters.yearFrom || filters.yearTo) && (
              <button
                onClick={() => onChange({ ...filters, yearFrom: undefined, yearTo: undefined })}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              placeholder="From"
              value={filters.yearFrom || ''}
              onChange={e =>
                onChange({
                  ...filters,
                  yearFrom: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              className="w-1/2 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              min={1950}
              max={2030}
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              placeholder="To"
              value={filters.yearTo || ''}
              onChange={e =>
                onChange({
                  ...filters,
                  yearTo: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              className="w-1/2 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              min={1950}
              max={2030}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {APP_CONFIG.YEAR_PRESETS.map(yr => {
              const isSelected = filters.yearFrom === yr && filters.yearTo === yr;
              const count = getYearCount(yr);
              return (
                <button
                  key={yr}
                  onClick={() => {
                    if (isSelected) {
                      onChange({ ...filters, yearFrom: undefined, yearTo: undefined });
                    } else {
                      onChange({ ...filters, yearFrom: yr, yearTo: yr });
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    isSelected
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {yr} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Category (Always Visible) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Subject Category
          </h4>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
            {categoryCoverage}%
          </span>
        </div>
        <div className="space-y-1.5">
          {APP_CONFIG.CATEGORIES.map(cat => {
            const count = getCategoryCount(cat);
            const isChecked = filters.categories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      onChange({
                        ...filters,
                        categories: toggleItem(filters.categories, cat),
                      })
                    }
                    className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                  />
                  <span className={isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                    {cat}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Disposal Nature */}
      {disposalCoverage >= 5 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disposal Nature
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
              {disposalCoverage}%
            </span>
          </div>
          <div className="space-y-1.5">
            {APP_CONFIG.DISPOSAL_STATUSES.map(disp => {
              const count = getDisposalCount(disp);
              const isChecked = filters.disposals.includes(disp);
              return (
                <label
                  key={disp}
                  className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onChange({
                          ...filters,
                          disposals: toggleItem(filters.disposals, disp),
                        })
                      }
                      className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                    />
                    <span className={isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {disp}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Bench Strength */}
      {coramCoverage >= 5 && corpus.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bench Strength
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
              {coramCoverage}%
            </span>
          </div>
          <div className="space-y-1.5">
            {APP_CONFIG.CORAM_TYPES.map(coram => {
              const count = getCoramCount(coram);
              const isChecked = filters.coramTypes.includes(coram);
              return (
                <label
                  key={coram}
                  className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onChange({
                          ...filters,
                          coramTypes: toggleItem(filters.coramTypes, coram),
                        })
                      }
                      className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                    />
                    <span className={isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {coram}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Case Type Prefix */}
      {caseTypeCoverage >= 5 && availableCaseTypes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Case Prefix
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title="Corpus non-null coverage">
              {caseTypeCoverage}%
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableCaseTypes.map(ct => {
              const isChecked = filters.caseTypes.includes(ct);
              return (
                <button
                  key={ct}
                  onClick={() =>
                    onChange({
                      ...filters,
                      caseTypes: toggleItem(filters.caseTypes, ct),
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    isChecked
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {ct}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle (for filters with < 5% coverage) */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1"
        >
          <span className="font-medium">Advanced Filters (&lt; 5% coverage)</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500">
            <p className="text-[11px] text-slate-400">
              Low-coverage or specialized attributes are stored here to keep main search clean.
            </p>
            {courtCoverage < 5 && <div className="text-[11px]">Court coverage is under 5%.</div>}
            {benchCoverage < 5 && <div className="text-[11px]">Bench coverage is under 5%.</div>}
            {yearCoverage < 5 && <div className="text-[11px]">Year coverage is under 5%.</div>}
            {categoryCoverage < 5 && <div className="text-[11px]">Category coverage is under 5%.</div>}
            {disposalCoverage < 5 && <div className="text-[11px]">Disposal coverage is under 5%.</div>}
            {coramCoverage < 5 && <div className="text-[11px]">Coram coverage is under 5%.</div>}
            {caseTypeCoverage < 5 && <div className="text-[11px]">Case Type coverage is under 5%.</div>}
            {courtCoverage >= 5 && benchCoverage >= 5 && yearCoverage >= 5 && categoryCoverage >= 5 && disposalCoverage >= 5 && coramCoverage >= 5 && caseTypeCoverage >= 5 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                All primary search attributes currently exceed the 5% coverage threshold.
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
