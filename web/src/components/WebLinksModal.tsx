import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Globe } from 'lucide-react';
import { WebLinkTarget } from '../utils/web-links';

interface WebLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  caseNo: string;
  links: WebLinkTarget[];
}

export const WebLinksModal: React.FC<WebLinksModalProps> = ({
  isOpen,
  onClose,
  caseTitle,
  caseNo,
  links
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Find Case on Web
              </h3>
              <p className="text-xs text-slate-500 font-mono">{caseNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 italic mb-2">
            "{caseTitle}"
          </p>

          <div className="space-y-2">
            {links.map((link, idx) => {
              const isCopied = copiedUrl === link.url;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-xs text-slate-900 dark:text-slate-200">
                        {link.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {link.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {link.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(link.url)}
                      title="Copy URL"
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
          Zero-key verified deep links. Note: External court portals may require CAPTCHA or manual entry.
        </div>
      </div>
    </div>
  );
};
