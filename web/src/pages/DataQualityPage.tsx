import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  Search,
  ExternalLink,
  Filter,
  FileText,
  Clock,
  Layers,
  Database
} from 'lucide-react';
import { AnomalySummary } from '../types/schema';

// Fallback initial state if fetch fails or running in test/offline environment
import bundledAnomalyData from '../../../data/anomaly-summary.json';

export const DataQualityPage: React.FC = () => {
  const [data, setData] = useState<AnomalySummary>(bundledAnomalyData as AnomalySummary);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'suppressed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const res = await fetch(`${cleanBase}data/anomaly-summary.json`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setData(json);
          }
        }
      } catch {
        // Fall back to bundled data
      }
    };

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered anomalies
  const filteredAnomalies = useMemo(() => {
    return (data.anomalies || []).filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'all' && item.reviewStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDoc = item.documentId.toLowerCase().includes(query);
        const matchesRule = item.ruleId.toLowerCase().includes(query);
        const matchesEvidence = item.evidence.toLowerCase().includes(query);
        const matchesRemediation = item.remediation.toLowerCase().includes(query);
        return matchesDoc || matchesRule || matchesEvidence || matchesRemediation;
      }
      return true;
    });
  }, [data.anomalies, severityFilter, statusFilter, searchQuery]);

  // Client-side JSON Export
  const handleExportJSON = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      filterApplied: { severity: severityFilter, status: statusFilter, searchQuery },
      totalExported: filteredAnomalies.length,
      anomalies: filteredAnomalies,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyayareader-anomalies-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Client-side CSV Export
  const handleExportCSV = () => {
    const headers = ['Rule ID', 'Severity', 'Document ID', 'Review Status', 'Evidence', 'Remediation', 'Detected At'];
    const rows = filteredAnomalies.map((a) => [
      `"${a.ruleId.replace(/"/g, '""')}"`,
      `"${a.severity.toUpperCase()}"`,
      `"${a.documentId.replace(/"/g, '""')}"`,
      `"${a.reviewStatus.toUpperCase()}"`,
      `"${a.evidence.replace(/"/g, '""')}"`,
      `"${a.remediation.replace(/"/g, '""')}"`,
      `"${a.detectedAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyayareader-anomalies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'reviewed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'suppressed':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Provenance */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Data Quality & Anomaly Intelligence
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Deterministic offline audit of corpus integrity, source provenance, document completeness, and classification consistency.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href={`${import.meta.env.BASE_URL || '/'}data/anomaly-summary.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
              title="Inspect raw ingest artifact"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Source Artifact</span>
              <ExternalLink className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key Quality Metrics">
        {/* Total Scanned */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>DOCUMENTS SCANNED</span>
            <FileText className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100" data-testid="kpi-total-scanned">
            {data.totalDocumentsScanned}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Deterministic coverage across all pilot fixtures
          </p>
        </div>

        {/* Total Anomalies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>TOTAL ANOMALIES</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400" data-testid="kpi-total-anomalies">
            {data.totalAnomaliesDetected}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Rules A01, A02, A04, A05 evaluated
          </p>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>SEVERITY BREAKDOWN</span>
            <Layers className="w-4 h-4 text-rose-500" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400" data-testid="kpi-high-count">
              {data.severityCounts?.high || 0} <span className="text-xs font-normal text-slate-500">High</span>
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid="kpi-medium-count">
              {data.severityCounts?.medium || 0} <span className="text-xs font-normal text-slate-500">Med</span>
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="kpi-low-count">
              {data.severityCounts?.low || 0} <span className="text-xs font-normal text-slate-500">Low</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Actionable triage prioritization
          </p>
        </div>

        {/* Review Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>REVIEW STATUS</span>
            <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid="kpi-pending-count">
              {data.statusCounts?.pending || 0} <span className="text-xs font-normal text-slate-500">Pending</span>
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="kpi-reviewed-count">
              {data.statusCounts?.reviewed || 0} <span className="text-xs font-normal text-slate-500">Done</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            YAML-backed audit trail in git
          </p>
        </div>
      </div>

      {/* Anomaly Rules Status Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>Ingest Rule Coverage (v1.2.0 Structured Case Intelligence)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
              <span>A01: Source Provenance</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Validates source_url existence, official HC domain patterns, and HTTP reachability.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
              <span>A02: Case Identity</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Detects SHA-256 duplicate records, court-bench code mismatches, and CNR collisions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
              <span>A04: Document Quality</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Catches empty extractions, truncated OCR orders, and abnormal character ratios.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
              <span>A05: Classification Match</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Flags unverified case types and contradictions between case type and cited enactments.
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 italic">
          Deferred rules (A03 Text Alignment, A06 Cross-References, A07-A10 Pipeline Quality) documented in docs/ANOMALY_RULES.md.
        </p>
      </div>

      {/* Controls & Export Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Document ID, Rule ID, or Evidence..."
              aria-label="Filter anomalies by text"
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Filter Dropdowns & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              <label htmlFor="severity-select" className="sr-only">Filter by severity</label>
              <select
                id="severity-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Severities</option>
                <option value="high">High Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="low">Low Severity</option>
              </select>
            </div>

            {/* Review Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <label htmlFor="status-select" className="sr-only">Filter by status</label>
              <select
                id="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="suppressed">Suppressed</option>
              </select>
            </div>

            {/* Client-side Export Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                title="Download filtered anomalies as JSON"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                title="Download filtered anomalies as CSV"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>CSV</span>
              </button>
            </div>

          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredAnomalies.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{data.anomalies?.length || 0}</strong> detected anomalies
          </span>
          {(severityFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSeverityFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-amber-600 dark:text-amber-400 hover:underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" role="region" aria-label="Detected Anomalies">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3">Rule ID</th>
                <th scope="col" className="px-3 py-3">Severity</th>
                <th scope="col" className="px-4 py-3">Document ID</th>
                <th scope="col" className="px-4 py-3">Evidence</th>
                <th scope="col" className="px-4 py-3">Remediation</th>
                <th scope="col" className="px-3 py-3">Status</th>
                <th scope="col" className="px-3 py-3">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      <p className="font-semibold text-slate-800 dark:text-slate-200">No anomalies match current filter criteria.</p>
                      <p className="text-[11px]">Adjust your severity or search filters above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAnomalies.map((item, idx) => (
                  <tr key={`${item.ruleId}-${item.documentId}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {item.ruleId}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      <Link
                        to={`/case/${item.documentId}`}
                        className="hover:underline flex items-center gap-1"
                        title={`Open judgment ${item.documentId}`}
                      >
                        <span>{item.documentId}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 max-w-xs break-words text-slate-600 dark:text-slate-400">
                      {item.evidence}
                    </td>
                    <td className="px-4 py-3 max-w-xs break-words text-slate-600 dark:text-slate-400">
                      {item.remediation}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-md border ${getStatusBadgeClass(item.reviewStatus)}`}>
                        {item.reviewStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.detectedAt ? item.detectedAt.slice(0, 10) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};
export default DataQualityPage;
