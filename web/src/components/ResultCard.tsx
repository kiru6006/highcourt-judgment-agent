import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, BookOpen, AlertCircle, Globe } from 'lucide-react';
import { WebLinksModal } from './WebLinksModal';
import { buildCaseWebLinks } from '../utils/web-links';

interface ResultCardProps {
  judgment: any;
}

export const ResultCard: React.FC<ResultCardProps> = ({ judgment }) => {
  const [showWebLinks, setShowWebLinks] = useState(false);

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

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all shadow-sm">
      {/* Synthetic Banner Badge if test fixture */}
      {isSynthetic && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          SYNTHETIC SAMPLE FIXTURE
        </div>
      )}

      {/* Meta Header */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {courtName}
          </span>
          <span>•</span>
          <span>{benchName}</span>
          <span>•</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
            {caseNo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {judgment.rrfScore !== undefined && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold">
              RRF: {judgment.rrfScore.toFixed(4)}
            </span>
          )}
          {judgment.vectorSimilarity !== undefined && judgment.rrfScore === undefined && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold">
              Sim: {(judgment.vectorSimilarity * 100).toFixed(1)}%
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            disposal.toLowerCase().includes('allow')
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {disposal}
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{decisionDate}</span>
          </div>
        </div>
      </div>

      {/* Title / Parties */}
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
        <Link to={`/case/${jid}`} className="hover:text-amber-600 dark:hover:text-amber-400 transition">
          {title}
        </Link>
      </h3>

      {/* Judge Coram */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <User className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
        <span className="truncate">{judges}</span>
      </div>

      {/* Ratio / Excerpt Snippet */}
      {excerpt && (
        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 mb-3.5">
          <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-1">
            Ratio / Key Excerpt:
          </span>
          <p className="line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </div>
      )}

      {/* Footer Tags & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {/* Statutes & Category */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
            {category}
          </span>
          {statutes.slice(0, 3).map((st: string, idx: number) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]"
            >
              {st}
            </span>
          ))}
          {statutes.length > 3 && (
            <span className="text-[11px] text-slate-400">+{statutes.length - 3} more</span>
          )}
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWebLinks(true)}
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Find on web</span>
          </button>
          <Link
            to={`/case/${jid}`}
            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read judgment</span>
          </Link>
        </div>
      </div>

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
