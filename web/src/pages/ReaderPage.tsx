import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  List,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Share2,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';
import { SYNTHETIC_JUDGMENTS } from '../fixtures/synthetic-judgments';

export const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<'original' | 'brief'>('original');
  const [fontSize, setFontSize] = useState<number>(16);
  const [highlightedPara, setHighlightedPara] = useState<number | null>(null);
  const [showCopilotMobile, setShowCopilotMobile] = useState(false);
  const [showOutlineMobile, setShowOutlineMobile] = useState(false);

  const judgment = SYNTHETIC_JUDGMENTS.find(j => j.jid === id) || SYNTHETIC_JUDGMENTS[0];

  const scrollToPara = (paraIndex: number) => {
    setHighlightedPara(paraIndex);
    setShowOutlineMobile(false);
    setShowCopilotMobile(false);
    const element = document.getElementById(`para-${paraIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const copyParaLink = (paraIndex: number) => {
    const url = `${window.location.origin}${window.location.pathname}#para-${paraIndex}`;
    navigator.clipboard.writeText(url);
  };

  // Structured extractive brief paragraphs
  const briefSections = judgment.sections.filter(s =>
    ['Facts', 'Issues', 'Reasoning & Ratio', 'Final Order'].includes(s.tag)
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Top Reader Subheader Bar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between text-xs flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link to="/search" className="text-amber-600 hover:underline flex items-center gap-1 font-medium flex-shrink-0">
            Search
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
            {judgment.case_number}: {judgment.parties.petitioner} v. {judgment.parties.respondent}
          </span>
        </div>

        {/* View Controls & Stepper */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Drawers Buttons */}
          <button
            onClick={() => setShowOutlineMobile(!showOutlineMobile)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
          >
            <List className="w-3.5 h-3.5 text-amber-600" />
            <span>Outline</span>
          </button>
          <button
            onClick={() => setShowCopilotMobile(!showCopilotMobile)}
            className="xl:hidden p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Copilot</span>
          </button>

          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'original'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Original Text
            </button>
            <button
              onClick={() => setViewMode('brief')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'brief'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Structured Brief (Extractive)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))} className="px-1 hover:text-amber-600 font-bold">-</button>
            <span className="font-mono text-[11px]">{fontSize}px</span>
            <button onClick={() => setFontSize(f => Math.min(22, f + 1))} className="px-1 hover:text-amber-600 font-bold">+</button>
          </div>

          <a
            href={judgment.pdf_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            PDF
          </a>
        </div>
      </div>

      {/* Main 3-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Pane 1: Left Outline (Desktop: 260px fixed) */}
        <aside className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto text-xs flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
            <List className="w-4 h-4 text-amber-600" />
            <span>Outline</span>
          </div>
          <nav className="space-y-1">
            {judgment.sections.map((sec, idx) => (
              <button
                key={idx}
                onClick={() => scrollToPara(sec.start_para_index)}
                className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span className="font-medium truncate">{sec.tag}</span>
                <span className="text-[10px] text-slate-400 font-mono">p.{sec.start_para_index}</span>
              </button>
            ))}
          </nav>

          {/* Sourced Statutes Drawer in Outline */}
          {judgment.statutes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                Cited Statutes
              </h5>
              <div className="space-y-1">
                {judgment.statutes.map((st, i) => (
                  <div key={i} className="text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold block">{st.act_code}: Section {st.section}</span>
                    {st.transition_mapping && (
                      <span className="text-[10px] text-amber-600 block mt-0.5">
                        → {st.transition_mapping.new_act} s.{st.transition_mapping.new_section} (Verified)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Pane 2: Center Judgment Text Stream */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-paper-canvas dark:bg-paper-darkCanvas">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-10 shadow-sm">
            
            {/* Synthetic Banner in Document */}
            {judgment.is_synthetic && (
              <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>SYNTHETIC FIXTURE: Names, case numbers, and facts are synthetic.</span>
              </div>
            )}

            {/* Document Header */}
            <div className="text-center pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 space-y-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                IN THE HIGH COURT OF JUDICATURE AT {judgment.court_name.toUpperCase()}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                {judgment.bench_name} • {judgment.coram_type}
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                CORAM: {judgment.judges.join(', ')}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500 font-mono">
                <span>{judgment.case_number}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {judgment.decision_date}
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-600">{judgment.disposal_nature}</span>
              </div>
            </div>

            {/* Structured Brief View vs Original Paragraph Stream */}
            {viewMode === 'brief' ? (
              <div className="space-y-6">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  <strong>Extractive Structured Brief:</strong> Extracted verbatim from court reasoning and ratio paragraphs. Not AI generated.
                </div>
                {briefSections.map((sec, sIdx) => {
                  const paras = judgment.paragraphs.filter(
                    p => p.index >= sec.start_para_index && p.index <= sec.end_para_index
                  );
                  return (
                    <div key={sIdx} className="space-y-2">
                      <h3 className="font-serif font-bold text-base text-amber-700 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                        {sec.tag}
                      </h3>
                      {paras.map(p => (
                        <p key={p.index} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif pl-3 border-l-2 border-amber-500/40">
                          {p.text} <span className="text-xs font-mono text-slate-400">[Para {p.index}]</span>
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6" style={{ fontSize: `${fontSize}px` }}>
                {judgment.paragraphs.map(para => (
                  <div
                    key={para.index}
                    id={`para-${para.index}`}
                    className={`group relative pl-10 transition-colors rounded-lg p-2 ${
                      highlightedPara === para.index ? 'highlight-flash' : ''
                    }`}
                  >
                    {/* Anchor Chip */}
                    <button
                      onClick={() => copyParaLink(para.index)}
                      title={`Copy link to Paragraph ${para.index}`}
                      className="absolute left-1 top-2.5 opacity-60 group-hover:opacity-100 text-[11px] font-mono text-slate-400 hover:text-amber-600 flex items-center gap-0.5"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{para.index}</span>
                    </button>

                    {/* Section Tag Indicator */}
                    {para.section_tag !== 'Untagged' && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        [{para.section_tag}]
                      </span>
                    )}

                    {/* Paragraph Text */}
                    <p className="font-serif leading-relaxed text-slate-800 dark:text-slate-200 legal-prose">
                      {para.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>

        {/* Pane 3: Right AI Copilot Drawer (Desktop: 320px fixed) */}
        <aside className="hidden xl:block w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto text-xs flex-shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Grounded AI Copilot</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded">
              Demo Mode Active
            </span>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
              Preset Actions
            </h5>
            <div className="space-y-1.5">
              <button
                onClick={() => scrollToPara(6)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 transition"
              >
                <div className="font-semibold">Summarize Ratio Decidendi</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Identifies holding principles with paragraph citations</div>
              </button>
              <button
                onClick={() => scrollToPara(1)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 transition"
              >
                <div className="font-semibold">Map to BNS / BNSS / BSA</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Statutory conversion against official tables</div>
              </button>
            </div>

            {/* Evidence Verified Demo Card */}
            <div className="mt-6 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Ratio Analysis</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Verified</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                Commercial breach of contract cannot be prosecuted as cheating under Section 420 IPC absent dishonest inducement at inception.
              </p>
              <button
                onClick={() => scrollToPara(6)}
                className="text-[11px] text-amber-600 hover:underline font-semibold block"
              >
                → View Cited Para 6 & 7
              </button>
            </div>
          </div>
        </aside>

      </div>

      {/* Mobile Outline Slide-over */}
      {showOutlineMobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm">Judgment Outline</span>
              <button onClick={() => setShowOutlineMobile(false)} className="p-1"><X className="w-4 h-4" /></button>
            </div>
            <nav className="space-y-1">
              {judgment.sections.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPara(sec.start_para_index)}
                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs"
                >
                  <span className="font-medium truncate">{sec.tag}</span>
                  <span className="text-[10px] text-slate-400 font-mono">p.{sec.start_para_index}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Copilot Slide-over */}
      {showCopilotMobile && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Grounded AI Copilot
              </span>
              <button onClick={() => setShowCopilotMobile(false)} className="p-1"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs space-y-3">
              <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                Demo Mode Active (Zero-Key Access)
              </div>
              <button
                onClick={() => scrollToPara(6)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="font-semibold">Summarize Ratio Decidendi</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Jump to ratio paragraphs 6 & 7</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
