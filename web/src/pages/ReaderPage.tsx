import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  List,
  ExternalLink,
  ChevronRight,
  Share2,
  Calendar,
  AlertTriangle,
  X,
  Scale,
  BookOpen,
  ArrowLeft,
  Loader2,
  Tag,
  Bookmark,
  Printer
} from 'lucide-react';
import { JudgmentDocument } from '../types/schema';
import { fetchJudgmentDocument } from '../reader/doc-loader';
import { ExtractiveBrief } from '../components/ExtractiveBrief';
import { CaseIntelligencePanel } from '../components/CaseIntelligencePanel';
import { StatuteBridgeDrawer } from '../components/StatuteBridgeDrawer';
import { CitationsDrawer } from '../components/CitationsDrawer';
import { GroundedCopilot } from '../components/GroundedCopilot';
import { SaveToFolderModal } from '../components/SaveToFolderModal';

export const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [judgment, setJudgment] = useState<JudgmentDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'original' | 'brief'>('original');
  const [activeRightTab, setActiveRightTab] = useState<'statutes' | 'citations' | 'copilot'>('statutes');
  const [fontSize, setFontSize] = useState<number>(16);
  const [highlightedPara, setHighlightedPara] = useState<number | null>(null);
  const [showRightMobile, setShowRightMobile] = useState(false);
  const [showOutlineMobile, setShowOutlineMobile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDoc() {
      if (!id) return;
      setLoading(true);
      setLoadError(null);
      try {
        const doc = await fetchJudgmentDocument(id);
        if (isMounted) {
          if (doc) {
            setJudgment(doc);
          } else {
            setLoadError('Judgment not found in local index or shards.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err?.message || 'Error loading judgment');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadDoc();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (judgment && window.location.hash) {
      const match = window.location.hash.match(/para-(\d+)/);
      if (match) {
        const pIdx = parseInt(match[1], 10);
        setTimeout(() => scrollToPara(pIdx), 200);
      }
    }
  }, [judgment]);

  // Keyboard navigation for advocate reading: j/k to navigate paragraphs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!judgment || judgment.paragraphs.length === 0) return;

      if (e.key === 'j') {
        setHighlightedPara((prev) => {
          const next = prev === null ? 1 : Math.min(judgment.paragraphs.length, prev + 1);
          scrollToPara(next);
          return next;
        });
      } else if (e.key === 'k') {
        setHighlightedPara((prev) => {
          const next = prev === null ? 1 : Math.max(1, prev - 1);
          scrollToPara(next);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [judgment]);

  const scrollToPara = (paraIndex: number) => {
    setHighlightedPara(paraIndex);
    setShowOutlineMobile(false);
    setShowRightMobile(false);
    const element = document.getElementById(`para-${paraIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Update hash without triggering reload
      window.history.replaceState(null, '', `#para-${paraIndex}`);
    }
  };

  const copyParaLink = (paraIndex: number) => {
    const url = `${window.location.origin}${window.location.pathname}#para-${paraIndex}`;
    navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Loading judgment record...</p>
        </div>
      </div>
    );
  }

  if (loadError || !judgment) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-4">
          <Scale className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Judgment Not Found
          </h2>
          <p className="text-xs text-slate-500">
            {loadError || 'The requested judgment identifier does not exist in the active corpus.'}
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Search</span>
          </Link>
        </div>
      </div>
    );
  }

  const caseTitle = judgment.parties
    ? `${judgment.parties.petitioner} v. ${judgment.parties.respondent}`
    : judgment.case_number;

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
            {judgment.case_number}: {caseTitle}
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
            onClick={() => setShowRightMobile(!showRightMobile)}
            className="xl:hidden p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Context</span>
          </button>

          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${viewMode === 'original'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Original Text
            </button>
            <button
              onClick={() => setViewMode('brief')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${viewMode === 'brief'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Structured Brief
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))} className="px-1 hover:text-amber-600 font-bold">-</button>
            <span className="font-mono text-[11px]">{fontSize}px</span>
            <button onClick={() => setFontSize(f => Math.min(22, f + 1))} className="px-1 hover:text-amber-600 font-bold">+</button>
          </div>

          <button
            onClick={() => setShowSaveModal(true)}
            title="Save to Case Folder"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-medium transition"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Print Court Memorandum"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Memo</span>
          </button>

          {judgment.pdf_source_url && (
            <a
              href={judgment.pdf_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
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
            {judgment.sections && judgment.sections.length > 0 ? (
              judgment.sections.map((sec, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPara(sec.start_para_index)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between text-slate-700 dark:text-slate-300"
                >
                  <span className="font-medium truncate">{sec.tag}</span>
                  <span className="text-[10px] text-slate-400 font-mono">p.{sec.start_para_index}</span>
                </button>
              ))
            ) : (
              <div className="text-[11px] text-slate-400 italic">No tagged sections</div>
            )}
          </nav>

          {/* Quick Paragraph Jump List */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Paragraphs ({judgment.paragraphs.length})
            </h5>
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
              {judgment.paragraphs.map((p) => (
                <button
                  key={p.index}
                  onClick={() => scrollToPara(p.index)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${highlightedPara === p.index
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {p.index}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Pane 2: Center Judgment Text Stream */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-paper-canvas dark:bg-paper-darkCanvas">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-10 shadow-sm">

            {/* Synthetic Banner in Document if synthetic */}
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
                CORAM: {Array.isArray(judgment.judges) ? judgment.judges.join(', ') : judgment.judges}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-mono">
                <span>{judgment.case_number}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {judgment.decision_date}
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-600">{judgment.disposal_nature}</span>
              </div>
            </div>

            {/* Case Classification & Legal Intelligence Panel (M6) */}
            <CaseIntelligencePanel
              judgment={judgment}
              onJumpToPara={scrollToPara}
            />

            {/* Structured Brief View vs Original Paragraph Stream */}
            {viewMode === 'brief' ? (
              <ExtractiveBrief
                judgment={judgment}
                onJumpToPara={scrollToPara}
              />
            ) : (
              <div className="space-y-6" style={{ fontSize: `${fontSize}px` }}>
                {judgment.paragraphs.map(para => (
                  <div
                    key={para.index}
                    id={`para-${para.index}`}
                    className={`group relative pl-10 transition-colors rounded-lg p-2 ${highlightedPara === para.index ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800' : ''
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
                    {para.section_tag && para.section_tag !== 'Untagged' && (
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider block mb-1">
                        [{para.section_tag}]
                      </span>
                    )}

                    {/* Paragraph Text */}
                    <p className="font-serif leading-relaxed text-slate-800 dark:text-slate-200 legal-prose">
                      {para.text}
                    </p>

                    {/* Statutory Mentions inside Paragraph */}
                    {para.statute_mentions && para.statute_mentions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {para.statute_mentions.map((sm, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded"
                          >
                            <Tag className="w-2.5 h-2.5 text-amber-600" />
                            {sm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>

        {/* Pane 3: Right Legal Drawers (Desktop: 320px fixed) */}
        <aside className="hidden xl:block w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto text-xs flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 gap-1">
            <button
              onClick={() => setActiveRightTab('statutes')}
              className={`flex-1 py-1 text-center font-semibold rounded transition ${activeRightTab === 'statutes'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Statute Bridge
            </button>
            <button
              onClick={() => setActiveRightTab('citations')}
              className={`flex-1 py-1 text-center font-semibold rounded transition ${activeRightTab === 'citations'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Citations
            </button>
            <button
              onClick={() => setActiveRightTab('copilot')}
              className={`flex-1 py-1 text-center font-semibold rounded transition ${activeRightTab === 'copilot'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              Copilot
            </button>
          </div>

          {activeRightTab === 'statutes' && (
            <StatuteBridgeDrawer
              statutes={judgment.statutes || []}
              onJumpToPara={scrollToPara}
            />
          )}

          {activeRightTab === 'citations' && (
            <CitationsDrawer
              citations={judgment.citations || []}
              courtCode={judgment.court_code}
              onJumpToPara={scrollToPara}
            />
          )}

          {activeRightTab === 'copilot' && (
            <GroundedCopilot
              judgment={judgment}
              onJumpToPara={scrollToPara}
            />
          )}
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
              {judgment.sections && judgment.sections.map((sec, idx) => (
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

      {/* Mobile Right Drawer Slide-over */}
      {showRightMobile && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm">Legal Context & Copilot</span>
              <button onClick={() => setShowRightMobile(false)} className="p-1"><X className="w-4 h-4" /></button>
            </div>
            {activeRightTab === 'copilot' ? (
              <GroundedCopilot
                judgment={judgment}
                onJumpToPara={scrollToPara}
              />
            ) : activeRightTab === 'citations' ? (
              <CitationsDrawer
                citations={judgment.citations || []}
                courtCode={judgment.court_code}
                onJumpToPara={scrollToPara}
              />
            ) : (
              <StatuteBridgeDrawer
                statutes={judgment.statutes || []}
                onJumpToPara={scrollToPara}
              />
            )}
          </div>
        </div>
      )}

      {/* Save to Folder Modal */}
      <SaveToFolderModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        judgmentItem={{
          jid: judgment.jid,
          title: caseTitle,
          caseNo: judgment.case_number,
          courtName: judgment.court_name,
          decisionDate: judgment.decision_date,
          category: judgment.category || 'General',
          disposal: judgment.disposal_nature,
          savedAt: new Date().toISOString(),
          statutes: judgment.statutes?.map((s: any) => typeof s === 'string' ? s : `${s.act_code || s.act} ${s.section}`) || [],
          ratioExcerpt: judgment.paragraphs?.[0]?.text || ''
        }}
      />
    </div>
  );
};
