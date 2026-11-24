import React from 'react';
import { Scale, CheckCircle2, HelpCircle, ExternalLink, Hash } from 'lucide-react';
import { JudgmentDocument } from '../types/schema';

interface CaseIntelligencePanelProps {
  judgment: JudgmentDocument;
  onJumpToPara: (paraIndex: number) => void;
}

export const CaseIntelligencePanel: React.FC<CaseIntelligencePanelProps> = ({
  judgment,
  onJumpToPara
}) => {
  const meta = judgment.classification_metadata;
  const stated = meta?.statedClassification;
  const inferred = meta?.inferredClassification || [];
  const rawCaseType = judgment.raw_case_type || judgment.case_type || 'Unspecified';
  const isStatedVerified = stated && stated.status === 'verified';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4 mb-6 print:border print:shadow-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans">
            Case Classification & Legal Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Taxonomy v1.0
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            Status: {meta?.reviewStatus || 'pending'}
          </span>
        </div>
      </div>

      {/* Grid: Stated vs Inferred vs Unknown (Never Merged) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Stated Classification */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Stated
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Registry
              </span>
            </div>

            {isStatedVerified ? (
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {stated?.domainLabel}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{stated?.normalizedCaseType}</span> — {stated?.officialDescription}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Jurisdiction: <strong className="text-slate-700 dark:text-slate-300">{stated?.jurisdictionType}</strong></span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic py-1">
                No verified court registry match for code '{rawCaseType}'.
              </div>
            )}
          </div>

          {stated?.sourceUrl && (
            <a
              href={stated.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-blue-200/60 dark:border-blue-900/40"
            >
              <span>Verified Registry Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* 2. Inferred Classification (With Evidence Paragraph Anchors) */}
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Inferred
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                Rule-Based (85%)
              </span>
            </div>

            {inferred.length > 0 ? (
              <div className="space-y-2">
                {inferred.map((inf, idx) => (
                  <div key={idx} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {inf.domainLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {inf.ruleId}
                      </span>
                    </div>
                    {/* Evidence Paragraph Anchors */}
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-500">Evidence:</span>
                      {inf.evidenceParagraphs.map(pIdx => (
                        <button
                          key={pIdx}
                          onClick={() => onJumpToPara(pIdx)}
                          title={`Jump to paragraph ${pIdx} evidence`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-200/70 hover:bg-emerald-300 text-emerald-900 dark:bg-emerald-800/60 dark:hover:bg-emerald-700 dark:text-emerald-100 transition"
                        >
                          <Hash className="w-2.5 h-2.5" />
                          <span>Para {pIdx}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic py-1">
                Zero rule-based subjects triggered. No evidence found.
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
            Rules fire only with retrievable text anchors.
          </p>
        </div>

        {/* 3. Unknown / Preserved Raw Strings */}
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-3 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                Raw / Unknown
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                Preserved
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Raw Court Code:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{judgment.court_code || 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Raw Case Type:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{rawCaseType}</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Raw strings preserved without automated truncation or unverified coercion.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            Review status: <strong>{meta?.reviewStatus || 'pending'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
