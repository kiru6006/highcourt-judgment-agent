import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';
import { JudgmentDocument } from '../types/schema';

interface ResultCardProps {
  judgment: JudgmentDocument;
}

export const ResultCard: React.FC<ResultCardProps> = ({ judgment }) => {
  // Extract ratio or representative paragraph
  const ratioPara = judgment.paragraphs.find(p => p.section_tag === 'Reasoning & Ratio') || judgment.paragraphs[0];

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all shadow-sm">
      {/* Synthetic Banner Badge if test fixture */}
      {judgment.is_synthetic && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          SYNTHETIC SAMPLE FIXTURE
        </div>
      )}

      {/* Meta Header */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {judgment.court_name}
          </span>
          <span>•</span>
          <span>{judgment.bench_name}</span>
          <span>•</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
            {judgment.case_number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            judgment.disposal_nature.toLowerCase().includes('allow')
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {judgment.disposal_nature}
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{judgment.decision_date}</span>
          </div>
        </div>
      </div>

      {/* Title / Parties */}
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
        <Link to={`/case/${judgment.jid}`} className="hover:text-amber-600 dark:hover:text-amber-400 transition">
          {judgment.parties.petitioner} <span className="text-slate-400 font-normal">v.</span> {judgment.parties.respondent}
        </Link>
      </h3>

      {/* Judge Coram */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <User className="w-3.5 h-3.5 text-slate-400" />
        <span>Coram: {judgment.judges.join(', ')} ({judgment.coram_type})</span>
      </div>

      {/* Statute Chips */}
      {judgment.statutes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {judgment.statutes.map((st, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
            >
              {st.act_code}: Section {st.section}
              {st.transition_mapping && (
                <span className="text-amber-600 dark:text-amber-400 ml-1">
                  → {st.transition_mapping.new_act} s.{st.transition_mapping.new_section}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Ratio Excerpt */}
      {ratioPara && (
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 italic pl-3 border-l-2 border-amber-500/50">
          "{ratioPara.text}"
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/case/${judgment.jid}`}
            className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read Judgment
          </Link>
          <a
            href={judgment.pdf_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Source PDF
          </a>
        </div>
        <Link
          to={`/links?q=${encodeURIComponent(judgment.case_number)}`}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          Find on Web / eCourts
        </Link>
      </div>
    </article>
  );
};
