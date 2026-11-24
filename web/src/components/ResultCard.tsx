import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, BookOpen, AlertCircle, Globe, Bookmark, Scale } from 'lucide-react';
import { WebLinksModal } from './WebLinksModal';
import { SaveToFolderModal } from './SaveToFolderModal';
import { buildCaseWebLinks } from '../utils/web-links';

interface ResultCardProps {
  judgment: any;
}

export const ResultCard: React.FC<ResultCardProps> = ({ judgment }) => {
  const [showWebLinks, setShowWebLinks] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Normalize across JudgmentDocument and SearchShardRecord
  const jid = judgment.jid;
  const isSynthetic = !!judgment.is_synthetic;
  const courtName = judgment.court_name || `High Court (${judgment.court_code || 'HC'})`;
  const benchName = judgment.bench_name || (judgment.bench_code === '01' ? 'Principal Bench' : judgment.bench_code || 'Bench');
  const caseNo = judgment.case_number || judgment.case_no || 'Case';
  const decisionDate = judgment.decision_date || judgment.date || '';
  const disposal = judgment.disposal_nature || judgment.disposal || 'Disposed';
  const category = judgment.category || 'General';

  const title = judgment.parties
    ? `${judgment.parties.petitioner} v. ${judgment.parties.respondent}`
    : judgment.title || 'Untitled Judgment';

  const judges = Array.isArray(judgment.judges)
    ? judgment.judges.join(', ')
    : judgment.judges || "Hon'ble Judge";

  const excerpt = judgment.excerpt || (judgment.paragraphs?.[0]?.text) || '';

  const statutes = Array.isArray(judgment.statutes)
    ? judgment.statutes.map((s: any) => (typeof s === 'string' ? s : `${s.act_code || s.act} ${s.section}`))
    : [];

  const webLinks = buildCaseWebLinks({
    cnr: judgment.cnr,
    court_code: judgment.court_code || '33_10',
    case_no: caseNo,
    title,
    year: judgment.year
  });

  // Outcome styling for left accent strip & badge
  const isAllowed = disposal.toLowerCase().includes('allow');
  const isDismissed = disposal.toLowerCase().includes('dismiss');
  
  const outcomeStripClass = isAllowed
    ? 'border-l-4 border-l-emerald-600'
    : isDismissed
    ? 'border-l-4 border-l-rose-600'
    : 'border-l-4 border-l-amber-600';

  const outcomeBadgeClass = isAllowed
    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
    : isDismissed
    ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';

  return (
    <article className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${outcomeStripClass} rounded-xl p-5 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all shadow-sm hover:shadow-md`}>
      {/* Synthetic Banner Badge if test fixture */}
      {isSynthetic && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 mb-3 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>SYNTHETIC AUDIT SAMPLE</span>
        </div>
      )}

      {/* Meta Header */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {courtName}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>{benchName}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {caseNo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {judgment.rrfScore !== undefined && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900">
              RRF: {judgment.rrfScore.toFixed(4)}
            </span>
          )}
          {judgment.vectorSimilarity !== undefined && judgment.rrfScore === undefined && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-900">
              Sim: {(judgment.vectorSimilarity * 100).toFixed(1)}%
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${outcomeBadgeClass}`}>
            {disposal}
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{decisionDate}</span>
          </div>
        </div>
      </div>

      {/* Title / Parties in Authoritative Serif */}
      <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100 mb-2 leading-snug">
        <Link to={`/case/${jid}`} className="hover:text-amber-700 dark:hover:text-amber-400 transition">
          {title}
        </Link>
      </h3>

      {/* Judge Coram */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
        <User className="w-3.5 h-3.5 flex-shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
        <span className="truncate font-medium">{judges}</span>
      </div>

      {/* Ratio / Excerpt Snippet with Formal Callout */}
      {excerpt && (
        <div className="text-xs text-slate-700 dark:text-slate-300 bg-[#FAF9F6] dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 text-xs mb-1">
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ratio Decidendi / Key Excerpt:</span>
          </div>
          <p className="line-clamp-3 leading-relaxed font-serif text-[13px] text-slate-800 dark:text-slate-200">
            "{excerpt}"
          </p>
        </div>
      )}

      {/* Footer Tags & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Statutes & Category */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900">
            {category}
          </span>
          {statutes.slice(0, 3).map((st: string, idx: number) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
            >
              {st}
            </span>
          ))}
          {statutes.length > 3 && (
            <span className="text-[11px] text-slate-500 font-mono">+{statutes.length - 3} more</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            title="Save to Case Folder"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={() => setShowWebLinks(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium transition"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Find on web</span>
          </button>
          <Link
            to={`/case/${jid}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C1E3C] hover:bg-[#142C54] text-white font-semibold text-xs shadow-sm transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Read judgment</span>
          </Link>
        </div>
      </div>

      {/* Save to Folder Modal */}
      <SaveToFolderModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        judgmentItem={{
          jid,
          title,
          caseNo,
          courtName,
          decisionDate,
          category,
          disposal,
          savedAt: new Date().toISOString(),
          statutes,
          ratioExcerpt: excerpt
        }}
      />

      {/* Web Links Modal */}
      <WebLinksModal
        isOpen={showWebLinks}
        onClose={() => setShowWebLinks(false)}
        caseTitle={title}
        caseNo={caseNo}
        links={webLinks}
      />
    </article>
  );
};
export default ResultCard;
