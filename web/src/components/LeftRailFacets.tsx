import React, { useState, useMemo } from 'react';
import { 
  Filter, ChevronDown, ChevronUp, Search, Calendar, 
  Scale, BookOpen, CheckSquare, RotateCcw, ShieldCheck, 
  Gavel, FileText, CheckCircle2 
} from 'lucide-react';
import { SearchFilters, JudgmentDocument } from '../types/schema';
import { FacetDistribution } from '../search/types';
import { ALL_25_HIGH_COURTS } from '../shared/court-codes/all_courts';
import { LEGAL_DOMAINS_V2 } from '../shared/taxonomy/v2';

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
  // Collapsible accordion group states
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    court: true,
    bench: true,
    date: true,
    category: true,
    caseType: true,
    outcome: true,
    statute: false,
    documentType: false,
    quality: false,
    advancedParams: false
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Search filter query within list
  const [courtSearch, setCourtSearch] = useState('');
  const [caseTypeSearch, setCaseTypeSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Helper to toggle item in array
  const toggleItem = (list: string[] = [], item: string): string[] => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const hasActiveFilters = Boolean(
    (filters.courts && filters.courts.length > 0) ||
    (filters.benches && filters.benches.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.disposals && filters.disposals.length > 0) ||
    (filters.outcomes && filters.outcomes.length > 0) ||
    (filters.coramTypes && filters.coramTypes.length > 0) ||
    (filters.caseTypes && filters.caseTypes.length > 0) ||
    (filters.documentTypes && filters.documentTypes.length > 0) ||
    (filters.statuteActs && filters.statuteActs.length > 0) ||
    (filters.yearFrom !== undefined && filters.yearFrom !== null) ||
    (filters.yearTo !== undefined && filters.yearTo !== null) ||
    (filters.dateShortcut && filters.dateShortcut !== 'all') ||
    filters.exactPhrase ||
    filters.caseNumber ||
    filters.partyName ||
    filters.judgeName ||
    filters.sourceVerifiedOnly ||
    filters.pdfAvailableOnly ||
    filters.fullTextAvailableOnly
  );

  const clearAll = () => {
    onChange({
      ...filters,
      exactPhrase: undefined,
      caseNumber: undefined,
      cnr: undefined,
      partyName: undefined,
      advocateName: undefined,
      judgeName: undefined,
      citationQuery: undefined,
      courts: [],
      benches: [],
      jurisdictionTypes: [],
      coramTypes: [],
      yearFrom: undefined,
      yearTo: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      dateShortcut: 'all',
      categories: [],
      subjects: [],
      caseTypes: [],
      statuteActs: [],
      statuteSections: [],
      documentTypes: [],
      outcomes: [],
      disposals: [],
      purposes: [],
      sourceVerifiedOnly: false,
      fullTextAvailableOnly: false,
      pdfAvailableOnly: false,
      sortBy: 'relevance'
    });
  };

  // Live count lookup maps from facetDistribution
  const courtCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.courts) {
      for (const item of facetDistribution.courts) map.set(item.value, item.count);
    }
    return map;
  }, [facetDistribution]);

  const benchCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.benches) {
      for (const item of facetDistribution.benches) map.set(item.value, item.count);
    }
    return map;
  }, [facetDistribution]);

  const yearCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.years) {
      for (const item of facetDistribution.years) map.set(item.value, item.count);
    }
    return map;
  }, [facetDistribution]);

  const catCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.categories) {
      for (const item of facetDistribution.categories) map.set(item.value, item.count);
    }
    return map;
  }, [facetDistribution]);

  const caseTypeCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.caseTypes) {
      for (const item of facetDistribution.caseTypes) map.set(item.value, item.count);
    }
    return map;
  }, [facetDistribution]);

  const outcomeCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (facetDistribution?.outcomes) {
      for (const item of facetDistribution.outcomes) map.set(item.value.toLowerCase(), item.count);
    }
    if (facetDistribution?.disposals) {
      for (const item of facetDistribution.disposals) {
        if (!map.has(item.value.toLowerCase())) map.set(item.value.toLowerCase(), item.count);
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

  // Dependent Benches: Filter benches based on selected High Courts
  const relevantBenches = useMemo(() => {
    if (filters.courts && filters.courts.length > 0) {
      return ALL_25_HIGH_COURTS
        .filter(c => filters.courts.includes(c.court_code))
        .flatMap(c => c.benches);
    }
    // Default top pilot benches if no court selected
    const madras = ALL_25_HIGH_COURTS.find(c => c.court_id === 'madras');
    const kar = ALL_25_HIGH_COURTS.find(c => c.court_id === 'karnataka');
    const delhi = ALL_25_HIGH_COURTS.find(c => c.court_id === 'delhi');
    const bombay = ALL_25_HIGH_COURTS.find(c => c.court_id === 'bombay');
    return [
      ...(madras ? madras.benches : []),
      ...(kar ? kar.benches : []),
      ...(delhi ? delhi.benches : []),
      ...(bombay ? bombay.benches : [])
    ];
  }, [filters.courts]);

  // Filtered 25 High Courts list
  const filteredCourts = useMemo(() => {
    if (!courtSearch.trim()) return ALL_25_HIGH_COURTS;
    const q = courtSearch.toLowerCase();
    return ALL_25_HIGH_COURTS.filter(c => 
      c.court_name.toLowerCase().includes(q) || 
      c.court_code.toLowerCase().includes(q) ||
      c.states_or_territories_served.some(s => s.toLowerCase().includes(q))
    );
  }, [courtSearch]);

  // Filtered 13 Categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return LEGAL_DOMAINS_V2;
    const q = categorySearch.toLowerCase();
    return LEGAL_DOMAINS_V2.filter(d => 
      d.label.toLowerCase().includes(q) || 
      d.code.toLowerCase().includes(q)
    );
  }, [categorySearch]);

  // Normalized Standard Case Types
  const STANDARD_CASE_TYPES = [
    'Writ Petition',
    'Writ Appeal',
    'FIR Quashing Petition',
    'Bail Application',
    'Anticipatory Bail',
    'Criminal Appeal',
    'Civil Appeal',
    'Criminal Revision',
    'Civil Revision',
    'Arbitration Petition',
    'Contempt Petition',
    'Second Appeal',
    'Miscellaneous Appeal',
    'Tax Appeal',
    'Public Interest Litigation'
  ];

  const filteredCaseTypes = useMemo(() => {
    if (!caseTypeSearch.trim()) return STANDARD_CASE_TYPES;
    const q = caseTypeSearch.toLowerCase();
    return STANDARD_CASE_TYPES.filter(ct => ct.toLowerCase().includes(q));
  }, [caseTypeSearch]);

  const TARGET_YEARS = [2026, 2025, 2024, 2023, 2022];

  const OUTCOMES = [
    'Allowed',
    'Dismissed',
    'Partly Allowed',
    'Disposed of',
    'Remanded',
    'Withdrawn',
    'Bail Granted',
    'Bail Refused'
  ];

  const STATUTE_PRESETS = [
    'IPC', 'CrPC', 'BNS', 'BNSS', 'BSA', 'CPC', 
    'Constitution Art 226', 'NI Act Sec 138', 'NDPS Act', 'POCSO Act', 'GST Act'
  ];

  return (
    <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-5 text-sm overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 font-serif">
          <Filter className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>Advanced Search</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all
          </button>
        )}
      </div>

      {/* Advocate Quick Presets */}
      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          Advocate Quick Presets
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...filters, categories: ['Criminal Law'], query: filters.query || 'bail' })}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 transition"
          >
            Bail Matters
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, categories: ['Criminal Law'], caseTypes: ['FIR Quashing Petition'], query: filters.query || 'quashing 482' })}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 transition"
          >
            Sec 482 Quash
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, categories: ['Corporate and Commercial Law'] })}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 transition"
          >
            Commercial
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, coramTypes: ['Division Bench'] })}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 transition"
          >
            Division Bench
          </button>
        </div>
      </div>

      {/* GROUP A: Explicit Exact Match & Case Search Box */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Case Details (Exact Match)
          </span>
          <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Exact Case Number (e.g. 1234/2022)..."
            value={filters.caseNumber || ''}
            onChange={e => onChange({ ...filters, caseNumber: e.target.value || undefined })}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Exact Party Name (e.g. State of TN)..."
            value={filters.partyName || ''}
            onChange={e => onChange({ ...filters, partyName: e.target.value || undefined })}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Hon'ble Judge Name..."
            value={filters.judgeName || ''}
            onChange={e => onChange({ ...filters, judgeName: e.target.value || undefined })}
            className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* GROUP B: High Courts (All 25 Canonical Courts) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('court')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>High Court (25 Courts)</span>
            {filters.courts.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                {filters.courts.length}
              </span>
            )}
          </div>
          {openGroups.court ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.court && (
          <div className="mt-2 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search High Courts..."
                value={courtSearch}
                onChange={e => setCourtSearch(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              {filteredCourts.map(court => {
                const count = getCourtCount(court.court_code);
                const isChecked = filters.courts.includes(court.court_code);
                return (
                  <label
                    key={court.court_id}
                    className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onChange({
                            ...filters,
                            courts: toggleItem(filters.courts, court.court_code),
                          })
                        }
                        className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                      />
                      <span className={`truncate ${isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {court.court_name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* GROUP B: Dependent Benches & Seats */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('bench')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Official Benches</span>
            {filters.benches.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                {filters.benches.length}
              </span>
            )}
          </div>
          {openGroups.bench ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.bench && (
          <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
            {relevantBenches.length === 0 ? (
              <div className="text-[11px] text-slate-400 py-1">No specific bench choices for selection.</div>
            ) : (
              relevantBenches.map(bench => {
                const isChecked = filters.benches.includes(bench.bench_code);
                const count = benchCountMap.get(bench.bench_code) || 0;
                return (
                  <label
                    key={bench.bench_code}
                    className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onChange({
                            ...filters,
                            benches: toggleItem(filters.benches, bench.bench_code),
                          })
                        }
                        className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                      />
                      <span className={`truncate ${isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {bench.bench_name}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                        {count}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* GROUP C: 5-Year Date Range & Quick Shortcuts (2022-2026) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('date')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>5-Year Period (2022–2026)</span>
            {(filters.yearFrom || filters.yearTo || filters.dateShortcut) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                Active
              </span>
            )}
          </div>
          {openGroups.date ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.date && (
          <div className="mt-2 space-y-2.5">
            {/* Quick Shortcuts */}
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => onChange({ ...filters, dateShortcut: '30d', yearFrom: undefined, yearTo: undefined })}
                className={`py-1 px-1.5 rounded text-center transition ${
                  filters.dateShortcut === '30d' 
                    ? 'bg-amber-600 text-white font-semibold' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, dateShortcut: '90d', yearFrom: undefined, yearTo: undefined })}
                className={`py-1 px-1.5 rounded text-center transition ${
                  filters.dateShortcut === '90d' 
                    ? 'bg-amber-600 text-white font-semibold' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Last 90 Days
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, dateShortcut: '12m', yearFrom: undefined, yearTo: undefined })}
                className={`py-1 px-1.5 rounded text-center transition ${
                  filters.dateShortcut === '12m' 
                    ? 'bg-amber-600 text-white font-semibold' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Last 12 Months
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, dateShortcut: 'all', yearFrom: undefined, yearTo: undefined })}
                className={`py-1 px-1.5 rounded text-center transition ${
                  !filters.dateShortcut || filters.dateShortcut === 'all'
                    ? 'bg-amber-600 text-white font-semibold' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                All 5 Years
              </button>
            </div>

            {/* Individual Year Pills */}
            <div className="flex flex-wrap gap-1">
              {TARGET_YEARS.map(yr => {
                const isSelected = filters.yearFrom === yr && filters.yearTo === yr;
                const count = getYearCount(yr);
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onChange({ ...filters, yearFrom: undefined, yearTo: undefined, dateShortcut: 'all' });
                      } else {
                        onChange({ ...filters, yearFrom: yr, yearTo: yr, dateShortcut: undefined });
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

            {/* Custom Range */}
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="number"
                placeholder="From Year"
                value={filters.yearFrom || ''}
                onChange={e => onChange({ ...filters, yearFrom: e.target.value ? parseInt(e.target.value, 10) : undefined, dateShortcut: undefined })}
                className="w-1/2 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                min={2022}
                max={2026}
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="To Year"
                value={filters.yearTo || ''}
                onChange={e => onChange({ ...filters, yearTo: e.target.value ? parseInt(e.target.value, 10) : undefined, dateShortcut: undefined })}
                className="w-1/2 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                min={2022}
                max={2026}
              />
            </div>
          </div>
        )}
      </div>

      {/* GROUP E: 13 Primary Legal Domains */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('category')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Legal Category (13 Domains)</span>
            {filters.categories.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                {filters.categories.length}
              </span>
            )}
          </div>
          {openGroups.category ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.category && (
          <div className="mt-2 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredCategories.map(cat => {
                const count = catCountMap.get(cat.label) || catCountMap.get(cat.code) || 0;
                const isChecked = filters.categories.includes(cat.label) || filters.categories.includes(cat.code);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onChange({
                            ...filters,
                            categories: toggleItem(filters.categories, cat.label),
                          })
                        }
                        className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                      />
                      <span className={`truncate ${isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {cat.number}. {cat.label}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                        {count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* GROUP D: Case Types (Normalized Procedural Types) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('caseType')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Case Types</span>
            {filters.caseTypes.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                {filters.caseTypes.length}
              </span>
            )}
          </div>
          {openGroups.caseType ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.caseType && (
          <div className="mt-2 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search case types..."
                value={caseTypeSearch}
                onChange={e => setCaseTypeSearch(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {filteredCaseTypes.map(ct => {
                const count = caseTypeCountMap.get(ct) || 0;
                const isChecked = filters.caseTypes.includes(ct);
                return (
                  <label
                    key={ct}
                    className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onChange({
                            ...filters,
                            caseTypes: toggleItem(filters.caseTypes, ct),
                          })
                        }
                        className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                      />
                      <span className={`truncate ${isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {ct}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                        {count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* GROUP H: Outcome & Disposal Nature */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('outcome')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Outcome & Disposal</span>
            {((filters.outcomes?.length || 0) + (filters.disposals?.length || 0)) > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                {(filters.outcomes?.length || 0) + (filters.disposals?.length || 0)}
              </span>
            )}
          </div>
          {openGroups.outcome ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.outcome && (
          <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
            {OUTCOMES.map(out => {
              const count = outcomeCountMap.get(out.toLowerCase()) || 0;
              const isChecked = (filters.outcomes && filters.outcomes.includes(out)) || (filters.disposals && filters.disposals.includes(out));
              return (
                <label
                  key={out}
                  className="flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const newOutcomes = toggleItem(filters.outcomes || [], out);
                        const newDisposals = toggleItem(filters.disposals || [], out);
                        onChange({
                          ...filters,
                          outcomes: newOutcomes,
                          disposals: newDisposals
                        });
                      }}
                      className="rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500/30"
                    />
                    <span className={isChecked ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                      {out}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-medium">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* GROUP F: Statute Presets */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => toggleGroup('statute')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Statutes & Acts</span>
            {filters.statuteActs && filters.statuteActs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-mono">
                {filters.statuteActs.length}
              </span>
            )}
          </div>
          {openGroups.statute ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.statute && (
          <div className="mt-2 space-y-1.5 flex flex-wrap gap-1">
            {STATUTE_PRESETS.map(act => {
              const isChecked = filters.statuteActs?.includes(act) || false;
              return (
                <button
                  key={act}
                  type="button"
                  onClick={() => onChange({
                    ...filters,
                    statuteActs: toggleItem(filters.statuteActs || [], act)
                  })}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    isChecked
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {act}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* GROUP J: Source Verification & Artifact Quality */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => toggleGroup('quality')}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-1"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Source Quality & Provenance</span>
          </div>
          {openGroups.quality ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openGroups.quality && (
          <div className="mt-2 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.sourceVerifiedOnly || false}
                onChange={e => onChange({ ...filters, sourceVerifiedOnly: e.target.checked })}
                className="rounded border-slate-300 text-amber-600"
              />
              <span className="text-slate-700 dark:text-slate-300">Official Source Verified Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.pdfAvailableOnly || false}
                onChange={e => onChange({ ...filters, pdfAvailableOnly: e.target.checked })}
                className="rounded border-slate-300 text-amber-600"
              />
              <span className="text-slate-700 dark:text-slate-300">Official High Court PDF Available</span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};
