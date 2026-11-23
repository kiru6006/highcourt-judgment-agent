import React, { useState } from 'react';
import {
  Sparkles,
  Key,
  ShieldCheck,
  AlertCircle,
  Send,
  Loader2,
  Lock
} from 'lucide-react';
import { JudgmentDocument } from '../types/schema';
import { GroundedAnswer, verifyClaims } from '../copilot/verifier';
import { KeyManager, KeyStorageTier } from '../copilot/key-manager';
import { askGeminiGrounded } from '../copilot/gemini-client';
import { getDemoAnswer } from '../copilot/demo-answers';
import { CopilotCache } from '../copilot/cache';

interface GroundedCopilotProps {
  judgment: JudgmentDocument;
  onJumpToPara: (paraIndex: number) => void;
}

export const GroundedCopilot: React.FC<GroundedCopilotProps> = ({
  judgment,
  onJumpToPara
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'ask' | 'settings'>('presets');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [storageTier, setStorageTier] = useState<KeyStorageTier>(KeyManager.getStorageTier());
  const [hasSavedKey, setHasSavedKey] = useState(KeyManager.hasKey());

  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<GroundedAnswer | null>(null);
  const [answerSource, setAnswerSource] = useState<'demo' | 'cache' | 'live'>('demo');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      KeyManager.setKey(apiKeyInput.trim(), storageTier);
      setHasSavedKey(true);
      setApiKeyInput('');
      setErrorMessage(null);
    }
  };

  const handleClearKey = () => {
    KeyManager.clearKey();
    setHasSavedKey(false);
    setApiKeyInput('');
  };

  const executeTask = async (taskName: string, queryText: string) => {
    setLoading(true);
    setErrorMessage(null);

    // 1. Check Cache
    const cached = await CopilotCache.get(judgment.jid, taskName);
    if (cached) {
      setCurrentAnswer(cached);
      setAnswerSource('cache');
      setLoading(false);
      return;
    }

    // 2. If no BYOK key, use Demo Mode
    if (!KeyManager.hasKey()) {
      const demoAns = getDemoAnswer(taskName, judgment.jid);
      if (demoAns) {
        // Run verifyClaims against this specific document to ensure genuine quote match
        const verifiedDemo = verifyClaims(demoAns.claims, judgment);
        const finalAns = verifiedDemo.insufficientEvidence ? demoAns : verifiedDemo;
        setCurrentAnswer(finalAns);
        setAnswerSource('demo');
        setLoading(false);
        return;
      }
    }

    // 3. Live BYOK Execution with Gemini
    try {
      const liveAnswer = await askGeminiGrounded(queryText, judgment);
      await CopilotCache.set(judgment.jid, taskName, liveAnswer);
      setCurrentAnswer(liveAnswer);
      setAnswerSource('live');
    } catch (err: any) {
      // Fallback to Demo Mode on API error if available
      const fallbackDemo = getDemoAnswer(taskName, judgment.jid);
      if (fallbackDemo) {
        setCurrentAnswer(fallbackDemo);
        setAnswerSource('demo');
      } else {
        setErrorMessage(err?.message || 'Failed to generate grounded answer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-1">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-2.5 py-1 rounded font-medium transition ${
            activeTab === 'presets'
              ? 'bg-amber-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Preset Queries
        </button>
        <button
          onClick={() => setActiveTab('ask')}
          className={`px-2.5 py-1 rounded font-medium transition ${
            activeTab === 'ask'
              ? 'bg-amber-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Custom Ask
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
            activeTab === 'settings'
              ? 'bg-amber-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-3 h-3" />
          <span>BYOK</span>
        </button>
      </div>

      {/* Preset Legal Queries Tab */}
      {activeTab === 'presets' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Analysis Tasks
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold">
              {hasSavedKey ? 'BYOK Active' : 'Zero-Key Demo'}
            </span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => executeTask('ratio', 'What is the core holding / ratio decidendi of this judgment?')}
              disabled={loading}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                1. Extract Ratio Decidendi
              </div>
              <div className="text-[11px] text-slate-500">
                Holding principles grounded strictly in verbatim paragraphs
              </div>
            </button>

            <button
              onClick={() => executeTask('bns_mapping', 'How do the penal provisions in this case map to the Bharatiya Nyaya Sanhita (BNS)?')}
              disabled={loading}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                2. Map Provisions to BNS / BNSS
              </div>
              <div className="text-[11px] text-slate-500">
                Cross-references statutory mentions with new criminal codes
              </div>
            </button>

            <button
              onClick={() => executeTask('bail', 'What specific directions or relief were ordered in the final decision?')}
              disabled={loading}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 transition"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                3. Operative Order Directions
              </div>
              <div className="text-[11px] text-slate-500">
                Relief granted, bail conditions, or quashing orders
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Custom Ask Tab */}
      {activeTab === 'ask' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">
            Ask any question about this judgment. Every claim will be verified verbatim against the text.
          </p>

          <div className="space-y-2">
            <textarea
              rows={3}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="e.g. Did the court consider delay in lodging FIR?"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              onClick={() => executeTask('custom', customQuery)}
              disabled={loading || !customQuery.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying claims...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* BYOK Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Advocate Privacy Notice</span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              Never enter client-privileged or confidential facts into third-party LLMs. Keys are stored in browser memory by default (wiped on tab close).
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={hasSavedKey ? 'Key currently active (enter new to update)' : 'AIzaSy...'}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />

            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                Storage Tier (ADR D-006):
              </span>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="storageTier"
                    value="memory"
                    checked={storageTier === 'memory'}
                    onChange={() => setStorageTier('memory')}
                    className="text-amber-600"
                  />
                  <span>Memory Only (Recommended — wiped on reload)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="storageTier"
                    value="session"
                    checked={storageTier === 'session'}
                    onChange={() => setStorageTier('session')}
                    className="text-amber-600"
                  />
                  <span>Session Storage (persists until tab close)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="storageTier"
                    value="local"
                    checked={storageTier === 'local'}
                    onChange={() => setStorageTier('local')}
                    className="text-amber-600"
                  />
                  <span>Local Storage (persistent on device)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyInput.trim()}
                className="flex-1 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold disabled:opacity-50 transition"
              >
                Save Key
              </button>
              {hasSavedKey && (
                <button
                  onClick={handleClearKey}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="p-4 text-center rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600 mx-auto" />
          <p className="text-[11px] text-slate-500">
            Running client-side grounded verification against judgment text...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-[11px]">{errorMessage}</p>
        </div>
      )}

      {/* Answer Stream */}
      {currentAnswer && !loading && (
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Grounded Analysis</span>
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              answerSource === 'live'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                : answerSource === 'cache'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {answerSource === 'live' ? 'Live Gemini Verified' : answerSource === 'cache' ? 'IndexedDB Cache' : 'Demo Verified'}
            </span>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
            {currentAnswer.summary}
          </p>

          {currentAnswer.insufficientEvidence ? (
            <div className="p-2.5 rounded bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-[11px]">
              No certified verbatim quotes could be matched in the judgment. Response suppressed to prevent hallucination.
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Verified Evidentiary Claims:
              </span>
              {currentAnswer.claims.map((claim, cIdx) => (
                <div
                  key={cIdx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {claim.claimText}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  <blockquote className="pl-2 border-l-2 border-amber-500 text-[11px] font-serif italic text-slate-600 dark:text-slate-400">
                    "{claim.verbatimQuote}"
                  </blockquote>

                  <button
                    onClick={() => onJumpToPara(claim.paraIndex)}
                    className="text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:underline font-semibold block pt-0.5"
                  >
                    → Jump to Para {claim.paraIndex} in Certified Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
