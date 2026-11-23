import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { CitationEdge } from '../types/schema';
import { WebLinksModal } from './WebLinksModal';
import { buildCaseWebLinks } from '../utils/web-links';

interface CitationsDrawerProps {
  citations: CitationEdge[];
  courtCode: string;
  onJumpToPara: (paraIndex: number) => void;
}

export const CitationsDrawer: React.FC<CitationsDrawerProps> = ({
  citations,
  courtCode,
  onJumpToPara
}) => {
  const [activeModal, setActiveModal] = useState<{ title: string; caseNo: string; links: any[] } | null>(null);

  if (!citations || citations.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400">
        No external legal citations extracted from this judgment.
      </div>
    );
  }

  const handleOpenWeb = (cit: CitationEdge) => {
    const raw = cit.raw_citation;
    const title = cit.case_title || raw;
    const links = buildCaseWebLinks({
      court_code: courtCode,
      case_no: raw,
      title
    });
    setActiveModal({ title, caseNo: raw, links });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Cited Precedents & Authorities
        </h5>
        <span className="text-[11px] font-mono text-slate-400">
          {citations.length} cited
        </span>
      </div>

      <div className="space-y-2">
        {citations.map((cit, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                  {cit.case_title || cit.raw_citation}
                </span>
                {cit.case_title && (
                  <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 block">
                    {cit.raw_citation}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleOpenWeb(cit)}
                title="Find precedent on web"
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 flex-shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            </div>

            {cit.paragraph_indices && cit.paragraph_indices.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400">Mentioned in:</span>
                {cit.paragraph_indices.map((pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => onJumpToPara(pIdx)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                  >
                    p.{pIdx}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeModal && (
        <WebLinksModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          caseTitle={activeModal.title}
          caseNo={activeModal.caseNo}
          links={activeModal.links}
        />
      )}
    </div>
  );
};
