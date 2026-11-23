import React from 'react';
import { Filter, X } from 'lucide-react';
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
  // Helper to toggle item in array
  const toggleItem = (list: string[], item: string): string[] => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const hasActiveFilters =
    filters.courts.length > 0 ||
    filters.categories.length > 0 ||
    filters.disposals.length > 0 ||
    filters.coramTypes.length > 0 ||
    filters.caseTypes.length > 0 ||
    (filters.yearFrom !== undefined && filters.yearFrom !== null);

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

      {/* High Court */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          High Court
        </h4>
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

      {/* Subject Category */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Subject Category
        </h4>
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
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Disposal Nature
        </h4>
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

      {/* Coram Type (if corpus provided) */}
      {corpus.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Bench Strength
          </h4>
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

      {/* Case Type Prefix (if available) */}
      {availableCaseTypes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Case Prefix
          </h4>
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
    </aside>
  );
};
