import React from 'react';
import { JudgmentDocument, Paragraph } from '../types/schema';
import { FileText, CheckCircle2 } from 'lucide-react';

interface ExtractiveBriefProps {
  judgment: JudgmentDocument;
  onJumpToPara: (paraIndex: number) => void;
}

export const ExtractiveBrief: React.FC<ExtractiveBriefProps> = ({
  judgment,
  onJumpToPara
}) => {
  // Extract tagged paragraphs
  const getParasForTag = (tag: string): Paragraph[] => {
    return judgment.paragraphs.filter(p => p.section_tag === tag);
  };

  const factsParas = getParasForTag('Facts');
  const issuesParas = getParasForTag('Issues');
  const submissionsParas = [
    ...getParasForTag('Petitioner Submissions'),
    ...getParasForTag('Respondent Submissions')
  ];
  const ratioParas = getParasForTag('Reasoning & Ratio');
  const orderParas = getParasForTag('Final Order');

  const renderSectionBlock = (
    title: string,
    paras: Paragraph[],
    borderClass: string,
    badgeText: string
  ) => {
    if (paras.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{title}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {badgeText} ({paras.length} {paras.length === 1 ? 'para' : 'paras'})
          </span>
        </div>
        <div className="space-y-3">
          {paras.map(p => (
            <div
              key={p.index}
              className={`p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border-l-4 ${borderClass} text-xs text-slate-700 dark:text-slate-300 space-y-1.5`}
            >
              <p className="font-serif leading-relaxed">
                {p.text}
              </p>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onJumpToPara(p.index)}
                  className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  → View in Context (Para {p.index})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasAnyTaggedSections =
    factsParas.length > 0 ||
    issuesParas.length > 0 ||
    submissionsParas.length > 0 ||
    ratioParas.length > 0 ||
    orderParas.length > 0;

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
          <p className="font-semibold">
            Extractive Judgment Brief (Zero Hallucination)
          </p>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            All text presented below is quoted verbatim from designated paragraphs of the certified judicial text. No generative synthesis is applied.
          </p>
        </div>
      </div>

      {!hasAnyTaggedSections ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This judgment does not have formal marked section headers.
          </p>
          <p className="text-[11px] text-slate-400">
            Switch to Original Text mode to read full sequential paragraphs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderSectionBlock('I. Ratio Decidendi & Holding', ratioParas, 'border-amber-500', 'Core Holding')}
          {renderSectionBlock('II. Final Order & Directions', orderParas, 'border-emerald-500', 'Disposal')}
          {renderSectionBlock('III. Factual Matrix', factsParas, 'border-blue-500', 'Facts')}
          {renderSectionBlock('IV. Legal Issues Framed', issuesParas, 'border-purple-500', 'Issues')}
          {renderSectionBlock('V. Submissions of Counsel', submissionsParas, 'border-slate-400', 'Submissions')}
        </div>
      )}
    </div>
  );
};
