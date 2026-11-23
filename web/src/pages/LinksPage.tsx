import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, ExternalLink, Globe, Search, Copy, Check } from 'lucide-react';

export const LinksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || 'Section 482 CrPC delay quashing';
  const [query, setQuery] = useState(initialQuery);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const cleanQ = encodeURIComponent(query.trim());

  const linkSources = [
    {
      category: 'Official Court / eCourts',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      items: [
        {
          name: 'eCourts National Judicial Data Grid (NJDG)',
          desc: 'Official case status and daily orders across all High Courts',
          url: `https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index&app_token=1&search_text=${cleanQ}`,
        },
        {
          name: 'eCourts Judgment Search Portal',
          desc: 'National open portal for High Court & District Court judgments',
          url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${cleanQ}`,
        },
        {
          name: 'Madras High Court Official Case Status',
          desc: 'Direct search on Principal Seat & Madurai Bench portals',
          url: `https://www.hcmadras.tn.nic.in/case_status.php`,
        },
        {
          name: 'Karnataka High Court Orders Portal',
          desc: 'Bengaluru, Dharwad, and Kalaburagi bench orders',
          url: `https://karnatakahihecourt.kar.nic.in/`,
        },
      ],
    },
    {
      category: 'Indian Kanoon Search',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      items: [
        {
          name: 'Indian Kanoon — All High Courts',
          desc: 'Full-text keyword and section search across historical judgments',
          url: `https://indiankanoon.org/search/?formInput=${cleanQ}`,
        },
        {
          name: 'Indian Kanoon — Madras High Court Only',
          desc: 'Scoped search within Madras High Court jurisprudence',
          url: `https://indiankanoon.org/search/?formInput=${cleanQ}+doctypes%3Amadras`,
        },
        {
          name: 'Indian Kanoon — Karnataka High Court Only',
          desc: 'Scoped search within Karnataka High Court jurisprudence',
          url: `https://indiankanoon.org/search/?formInput=${cleanQ}+doctypes%3Akarnataka`,
        },
      ],
    },
    {
      category: 'Legal News & Precedent Portals',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      items: [
        {
          name: 'LiveLaw (Google Site Search)',
          desc: 'Search reported High Court judgments and case analysis',
          url: `https://www.google.com/search?q=site:livelaw.in+${cleanQ}`,
        },
        {
          name: 'Bar & Bench (Google Site Search)',
          desc: 'Search legal news reporting and judgment summaries',
          url: `https://www.google.com/search?q=site:barandbench.com+${cleanQ}`,
        },
      ],
    },
  ];

  const handleCopy = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Multi-Source Web Links Generator
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Instant client-side deep links to official eCourts repositories, High Court registries, and Indian Kanoon. Zero scraping, zero API keys.
        </p>
      </div>

      {/* Query Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter case number, party name, or legal proposition..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Link Groups */}
      <div className="space-y-6">
        {linkSources.map((group, gIdx) => (
          <div key={gIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{group.category}</span>
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${group.badgeClass}`}>
                Verified Templates
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {group.items.map((item, iIdx) => {
                const uniqueKey = gIdx * 100 + iIdx;
                return (
                  <div key={iIdx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(item.url, uniqueKey)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition"
                        title="Copy link URL"
                      >
                        {copiedIndex === uniqueKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
