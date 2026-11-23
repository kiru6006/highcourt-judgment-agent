import React from 'react';
import { Database, ShieldCheck, ExternalLink, HardDrive, AlertOctagon, Mail, Clock, Lock } from 'lucide-react';
import { APP_CONFIG } from '../constants/app.constants';

export const AboutDataPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Dataset Status, Governance & Judicial Privacy
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Transparency report detailing upstream sources, licensing compliance, statutory privacy safeguards, and takedown procedures.
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

        {/* Provenance Chain */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Data Provenance Chain:</div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">eCourts / High Court Registries</span>
            <span>→</span>
            <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">AWS Open Data Registry</span>
            <span>→</span>
            <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">NyayaReader Static Shards</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
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

      {/* Statutory Privacy & Automated Quarantine Policy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Statutory Privacy & Judicial Redaction Policy</span>
        </h3>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            In accordance with Supreme Court directives and Indian statutory mandates, NyayaReader executes automated regex quarantining and manual takedown workflows to prevent non-consensual disclosure of sensitive individual identities:
          </p>

          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Protection of Children (POCSO Act, Section 74):</strong> Automated exclusion of records referencing POCSO Act sections, ensuring zero publication of minor victim names, addresses, or identifiers.
            </li>
            <li>
              <strong>Sexual Offence Victim Protection (IPC Section 228A / BNS Section 72):</strong> Complete masking and redaction of victim identities in rape, sexual assault, and related criminal proceedings.
            </li>
            <li>
              <strong>Matrimonial & Family Court Anonymity:</strong> Voluntary de-indexing and redaction upon request in family court, adoption, and custody disputes.
            </li>
            <li>
              <strong>Information Technology Rules, 2021:</strong> Strict adherence to judicial removal orders issued by competent High Court registries or judicial officers.
            </li>
          </ul>
        </div>
      </div>

      {/* Takedown Request Portal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertOctagon className="w-4 h-4" />
          <span>Judicial Takedown & Redaction Request Workflow</span>
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          If you are an advocate, party, or registrar seeking the removal or redaction of an unanonymized judgment, please submit a formal takedown notice to our compliance desk:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Submission Email</span>
            </div>
            <div className="font-mono text-amber-700 dark:text-amber-400 text-[11px]">
              legal-redactions@nyayareader.org
            </div>
            <p className="text-[11px] text-slate-500">
              Include High Court Registry order number or statutory grounds.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Standard Response SLA</span>
            </div>
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              48 Hours (Expedited)
            </div>
            <p className="text-[11px] text-slate-500">
              Purged from static shards, vector embeddings, and search manifests on next CI cycle.
            </p>
          </div>
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
