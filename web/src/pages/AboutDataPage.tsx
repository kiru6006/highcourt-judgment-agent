import React from 'react';
import { Database, ShieldCheck, ExternalLink, HardDrive } from 'lucide-react';
import { APP_CONFIG } from '../constants/app.constants';

export const AboutDataPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Dataset Status, Coverage & Licensing
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Transparency report detailing upstream sources, licensing compliance, and technical extraction boundaries.
        </p>
      </div>

      {/* Upstream Attribution Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Creative Commons Attribution 4.0 International (CC-BY-4.0)</span>
        </div>
        
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The underlying judicial records are sourced from the open-access <strong>Indian High Court Judgments</strong> repository curated by Vanga, archived on the AWS Open Data Registry (<code>s3://indian-high-court-judgments</code>, region <code>ap-south-1</code>).
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://github.com/vanga/indian-high-court-judgments"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <span>vanga/indian-high-court-judgments</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://registry.opendata.aws/indian-high-court-judgments/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <span>AWS Open Data Registry</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Pilot Coverage Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-400" />
          <span>Active Pilot Corpus Scope</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {APP_CONFIG.DEFAULT_COURTS.map(court => (
            <div key={court.code} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{court.name}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Court Code: {court.code}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Legal Disclaimer</h4>
        <p className="leading-relaxed">
          {APP_CONFIG.FOOTER_DISCLAIMER} NyayaReader is an academic and legal research index. Case outcomes and ratio summaries are provided for preliminary analysis. Advocates and litigators must always obtain and rely on certified copies issued by the concerned High Court Registry.
        </p>
      </div>

    </div>
  );
};
