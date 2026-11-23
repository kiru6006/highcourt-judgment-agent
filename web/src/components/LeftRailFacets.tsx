import React from 'react';
import { Filter, X, Info } from 'lucide-react';
import { SearchFilters, JudgmentDocument } from '../types/schema';
import { APP_CONFIG } from '../constants/app.constants';

interface LeftRailFacetsProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  corpus: JudgmentDocument[];
}

export const LeftRailFacets: React.FC<LeftRailFacetsProps> = ({
  filters,
  onChange,
  corpus,
}) => {
  // Compute dynamic case type prefixes based on selected courts (or all if none)
  const availableCaseTypes = Array.from(
    new Set(
      corpus
        .filter(d => filters.courts.length === 0 || filters.courts.includes(d.court_code))
        .map(d => d.case_type)
    )
  ).sort();

  // Helper to toggle item in array
  const toggleItem = (list: string[], item: string): string[] => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const hasActiveFilters =
    filters.courts.length > 0 ||
    filters.categories.length > 0 ||
    filters.disposals.length > 0 ||
    filters.coramTypes.length > 0 ||
    filters.caseTypes.length > 0;

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
    });
  };

  // Live count calculators
  const getCourtCount = (courtCode: string) =>
    corpus.filter(d => d.court_code === courtCode).length;

  const getCategoryCount = (cat: string) =>
    corpus.filter(d => d.category === cat).length;

  const getDisposalCount = (disp: string) =>
    corpus.filter(d => d.disposal_nature.toLowerCase() === disp.toLowerCase()).length;

  const getCoramCount = (coram: string) =>
    corpus.filter(d => d.coram_type === coram).length;

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
                    onChange={() => onChange({ ...filters, courts: toggleItem(filters.courts, court.code) })}
                    className="rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className={isChecked ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}>
                    {court.name}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Coram Strength */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Coram Strength
        </h4>
        <div className="space-y-1.5">
          {['Single Judge', 'Division Bench'].map(coram => {
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
                    onChange={() => onChange({ ...filters, coramTypes: toggleItem(filters.coramTypes, coram) })}
                    className="rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className={isChecked ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}>
                    {coram}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Category (Derived) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Category
          </h4>
          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
            <Info className="w-2.5 h-2.5" /> derived
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
                    onChange={() => onChange({ ...filters, categories: toggleItem(filters.categories, cat) })}
                    className="rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className={isChecked ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}>
                    {cat}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Dynamic Case Type Prefixes */}
      {availableCaseTypes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Case Type Prefix
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {availableCaseTypes.map(type => {
              const isChecked = filters.caseTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...filters, caseTypes: toggleItem(filters.caseTypes, type) })}
                  className={`px-2 py-1 text-xs font-mono rounded border transition ${
                    isChecked
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Disposal Nature */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Disposal Status
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
                    onChange={() => onChange({ ...filters, disposals: toggleItem(filters.disposals, disp) })}
                    className="rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className={isChecked ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}>
                    {disp}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{count}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
