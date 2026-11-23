import React, { useMemo } from 'react';
import { SearchFilters } from '../types/schema';
import { SYNTHETIC_JUDGMENTS } from '../fixtures/synthetic-judgments';
import { LeftRailFacets } from '../components/LeftRailFacets';
import { ResultCard } from '../components/ResultCard';
import { Scale, SlidersHorizontal } from 'lucide-react';

interface SearchPageProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  filters,
  onFilterChange,
}) => {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Filter judgments based on query and facets
  const filteredJudgments = useMemo(() => {
    return SYNTHETIC_JUDGMENTS.filter(doc => {
      // Query filter
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

      // High Court filter
      if (filters.courts.length > 0 && !filters.courts.includes(doc.court_code)) {
        return false;
      }

      // Coram filter
      if (filters.coramTypes.length > 0 && !filters.coramTypes.includes(doc.coram_type)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(doc.category)) {
        return false;
      }

      // Case Type Prefix filter
      if (filters.caseTypes.length > 0 && !filters.caseTypes.includes(doc.case_type)) {
        return false;
      }

      // Disposal filter
      if (
        filters.disposals.length > 0 &&
        !filters.disposals.some(d => d.toLowerCase() === doc.disposal_nature.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Mobile Filter Toggle Button */}
      <div className="md:hidden p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <span>Filters ({filteredJudgments.length})</span>
        </button>
        <span className="text-xs text-slate-500 font-mono">
          {filteredJudgments.length} results
        </span>
      </div>

      {/* Left Rail Facets (Desktop + Mobile Drawer) */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
        <LeftRailFacets
          filters={filters}
          onChange={onFilterChange}
          corpus={SYNTHETIC_JUDGMENTS}
        />
      </div>

      {/* Results Stream */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Header Info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredJudgments.length}</span> judgments
              {filters.query && (
                <span> for "<strong className="text-amber-600">{filters.query}</strong>"</span>
              )}
            </div>
            <div className="text-[11px] font-mono">
              Indexed Corpus Mode
            </div>
          </div>

          {/* Cards List */}
          {filteredJudgments.length > 0 ? (
            <div className="space-y-4">
              {filteredJudgments.map(judgment => (
                <ResultCard key={judgment.jid} judgment={judgment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
              <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                No matching judgments found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Try loosening your filter criteria or searching for general legal sections like "482 CrPC", "Bail", or "Trade Marks".
              </p>
              <button
                onClick={() =>
                  onFilterChange({
                    query: '',
                    courts: [],
                    benches: [],
                    coramTypes: [],
                    categories: [],
                    caseTypes: [],
                    disposals: [],
                    purposes: [],
                  })
                }
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
