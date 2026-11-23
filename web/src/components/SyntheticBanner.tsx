import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const SyntheticBanner: React.FC = () => {
  return (
    <aside aria-label="Synthetic sample disclaimer" className="bg-amber-500 text-slate-900 border-b border-amber-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm">
      <AlertTriangle className="w-4 h-4 text-slate-950 flex-shrink-0" />
      <span>SYNTHETIC SAMPLE FIXTURE — NOT A REAL JUDGMENT — FOR PROOF-OF-CONCEPT TESTING ONLY</span>
    </aside>
  );
};
