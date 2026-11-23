import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { StatuteReference } from '../types/schema';
import { lookupTransition } from '../constants/statute-bridge';

interface StatuteBridgeDrawerProps {
  statutes: StatuteReference[];
  onJumpToPara: (paraIndex: number) => void;
}

export const StatuteBridgeDrawer: React.FC<StatuteBridgeDrawerProps> = ({
  statutes,
  onJumpToPara
}) => {
  if (statutes.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400">
        No specific statutory provisions tagged in this judgment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Statute Transition Bridge
        </h5>
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono font-medium">
          <ShieldCheck className="w-3 h-3" />
          Official Gazette
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Automatic deterministic bridge between legacy codes (CrPC, IPC, IEA) and new criminal laws (BNS, BNSS, BSA).
      </p>

      <div className="space-y-2">
        {statutes.map((st, idx) => {
          const actCode = st.act_code || (st.act.includes('Criminal') ? 'CrPC' : st.act.includes('Penal') ? 'IPC' : 'Other');
          const transition = st.transition_mapping
            ? {
                oldAct: actCode,
                oldSection: st.section,
                newAct: st.transition_mapping.new_act,
                newSection: st.transition_mapping.new_section,
                mappingSource: st.transition_mapping.mapping_source,
                notes: ''
              }
            : lookupTransition(actCode, st.section);

          return (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between font-mono font-semibold">
                <span className="text-slate-900 dark:text-slate-200">
                  {actCode} § {st.section}
                </span>
                {transition ? (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{transition.newAct} § {transition.newSection}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-sans font-normal">
                    No transition
                  </span>
                )}
              </div>

              {transition?.equivalenceType && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    transition.equivalenceType === 'SUBSTANTIVELY_ALTERED'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : transition.equivalenceType === 'CONSOLIDATED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {transition.equivalenceType === 'SUBSTANTIVELY_ALTERED' ? '⚠️ Substantively Altered' : transition.equivalenceType === 'CONSOLIDATED' ? 'Consolidated Section' : 'Exact Equivalent'}
                  </span>
                  {transition.isReverseLookup && (
                    <span className="text-[9px] font-mono text-slate-500">
                      (Legacy Code Equivalent)
                    </span>
                  )}
                </div>
              )}

              {transition?.notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                  {transition.notes}
                </p>
              )}

              {st.paragraph_indices && st.paragraph_indices.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400">Cited in:</span>
                  {st.paragraph_indices.map((pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => onJumpToPara(pIdx)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-900 dark:text-amber-300 transition"
                    >
                      p.{pIdx}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
