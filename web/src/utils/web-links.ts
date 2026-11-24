/**
 * Nyaya AI Reader — External Portal Link Finder (v1.2.0 Milestone M5)
 * Deterministic, client-side, zero network calls at runtime.
 * Harvested from NyayaLens specifications.
 * 
 * Generates verified deep-links for:
 * 1. eCourts HC Services
 * 2. eCourts Judgments National PDF Search
 * 3. High Court Official Portals (Madras, Karnataka, Kerala, Delhi, Bombay)
 * 4. Indian Kanoon Scoped Search
 * 
 * STRICT INVARIANT: No link is generated with a guessed parameter.
 * Missing inputs omit that link and state why.
 * Every link carries warningNotice: "may require CAPTCHA / manual entry".
 */

export interface PortalLinkInput {
  cnr?: string;
  court: string;
  bench?: string;
  caseType?: string;
  caseNumber?: string;
  year?: number | string;
}

export interface PortalLink {
  id: 'ecourts_services' | 'ecourts_judgments' | 'high_court_portal' | 'indian_kanoon';
  label: string;
  url: string;
  portalName: string;
  warningNotice: 'may require CAPTCHA / manual entry';
  isDirectLink: boolean;
}

export interface OmittedPortalLink {
  id: 'ecourts_services' | 'ecourts_judgments' | 'high_court_portal' | 'indian_kanoon';
  portalName: string;
  omittedReason: string;
}

export interface PortalLinksResult {
  links: PortalLink[];
  omitted: OmittedPortalLink[];
}

export interface WebLinkTarget {
  name: string;
  category: 'eCourts' | 'High Court Portal' | 'Indian Kanoon' | 'Google Scholar';
  url: string;
  description: string;
  isDirectCaseLink: boolean;
  warningNotice?: string;
}

export interface CaseLinkInput {
  cnr?: string;
  court_code: string;
  case_no: string;
  title: string;
  year?: number;
  citations?: string[];
}

// Verified High Court portal definitions from M2 registry
const COURT_PORTAL_REGISTRY: Record<string, { name: string; portalUrl: string; ikDoctype: string }> = {
  '33_10': {
    name: 'Madras High Court',
    portalUrl: 'https://www.hcmadras.tn.nic.in/case_status.php',
    ikDoctype: 'madras'
  },
  '29_3': {
    name: 'Karnataka High Court',
    portalUrl: 'https://karnatakahi.courtrecords.gov.in/',
    ikDoctype: 'karnataka'
  },
  '32_1': {
    name: 'Kerala High Court',
    portalUrl: 'https://hckerala.gov.in/',
    ikDoctype: 'kerala'
  },
  '7_26': {
    name: 'Delhi High Court',
    portalUrl: 'https://delhihighcourt.nic.in/case-search',
    ikDoctype: 'delhi'
  },
  '1_1': {
    name: 'Bombay High Court',
    portalUrl: 'https://bombayhighcourt.nic.in/casequery.php',
    ikDoctype: 'bombay'
  }
};

/**
 * Builds deterministic portal links with zero guessing.
 * Omit links if required parameters are missing.
 */
export function buildPortalLinks(input: PortalLinkInput): PortalLinksResult {
  const links: PortalLink[] = [];
  const omitted: OmittedPortalLink[] = [];
  const normCourt = (input.court || '').replace('~', '_').trim();
  const cnr = (input.cnr || '').trim();
  const caseType = (input.caseType || '').trim();
  const caseNumber = (input.caseNumber || '').trim();

  // 1. eCourts HC Services
  if (cnr && cnr.length >= 14) {
    links.push({
      id: 'ecourts_services',
      label: 'eCourts CNR Status',
      portalName: 'eCourts Services',
      url: `https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index&app_token=1&cino=${encodeURIComponent(cnr)}`,
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: true
    });
  } else if (normCourt && (caseType || caseNumber)) {
    links.push({
      id: 'ecourts_services',
      label: 'eCourts HC Case Search',
      portalName: 'eCourts Services',
      url: 'https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index',
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: false
    });
  } else {
    omitted.push({
      id: 'ecourts_services',
      portalName: 'eCourts Services',
      omittedReason: 'Missing CNR and case number/type required for eCourts Services prefill.'
    });
  }

  // 2. eCourts National Judgment PDF Search
  if (cnr && cnr.length >= 14) {
    links.push({
      id: 'ecourts_judgments',
      label: 'eCourts Judgment Search (CNR)',
      portalName: 'eCourts Judgments',
      url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${encodeURIComponent(cnr)}`,
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: true
    });
  } else if (caseType && caseNumber) {
    const q = `${caseType} ${caseNumber}`;
    links.push({
      id: 'ecourts_judgments',
      label: `eCourts Judgment Search (${caseType} ${caseNumber})`,
      portalName: 'eCourts Judgments',
      url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${encodeURIComponent(q)}`,
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: true
    });
  } else if (caseNumber) {
    links.push({
      id: 'ecourts_judgments',
      label: `eCourts Judgment Search (${caseNumber})`,
      portalName: 'eCourts Judgments',
      url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${encodeURIComponent(caseNumber)}`,
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: true
    });
  } else {
    omitted.push({
      id: 'ecourts_judgments',
      portalName: 'eCourts Judgments',
      omittedReason: 'Missing case number or CNR required for eCourts Judgments search.'
    });
  }

  // 3. Official High Court Portal
  const courtEntry = COURT_PORTAL_REGISTRY[normCourt];
  if (courtEntry && courtEntry.portalUrl) {
    links.push({
      id: 'high_court_portal',
      label: `${courtEntry.name} Portal`,
      portalName: courtEntry.name,
      url: courtEntry.portalUrl,
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: false
    });
  } else {
    omitted.push({
      id: 'high_court_portal',
      portalName: 'High Court Official Portal',
      omittedReason: `Unmapped or unverified High Court portal URL for court code: '${normCourt || 'unknown'}'.`
    });
  }

  // 4. Indian Kanoon Scoped Search
  let ikQuery = '';
  if (caseType && caseNumber) {
    ikQuery = `${caseType} ${caseNumber}`;
  } else if (caseNumber) {
    ikQuery = caseNumber;
  } else if (cnr) {
    ikQuery = cnr;
  }

  if (ikQuery) {
    const doctype = courtEntry ? courtEntry.ikDoctype : '';
    const formattedQuery = doctype
      ? `${encodeURIComponent(ikQuery)}+doctypes%3A${doctype}`
      : encodeURIComponent(ikQuery);

    links.push({
      id: 'indian_kanoon',
      label: courtEntry ? `Indian Kanoon (${courtEntry.name})` : 'Indian Kanoon Search',
      portalName: 'Indian Kanoon',
      url: `https://indiankanoon.org/search/?formInput=${formattedQuery}`,
      warningNotice: 'may require CAPTCHA / manual entry',
      isDirectLink: true
    });
  } else {
    omitted.push({
      id: 'indian_kanoon',
      portalName: 'Indian Kanoon',
      omittedReason: 'Missing case identifier (case number, case type, or CNR) required for Indian Kanoon search.'
    });
  }

  return { links, omitted };
}

/**
 * Backward-compatible helper for existing UI components.
 */
export function buildCaseWebLinks(caseInput: CaseLinkInput): WebLinkTarget[] {
  const portalResults = buildPortalLinks({
    cnr: caseInput.cnr,
    court: caseInput.court_code,
    caseNumber: caseInput.case_no,
    year: caseInput.year
  });

  const targets: WebLinkTarget[] = portalResults.links.map(l => ({
    name: l.label,
    category: l.id === 'ecourts_services' || l.id === 'ecourts_judgments'
      ? 'eCourts'
      : l.id === 'high_court_portal'
      ? 'High Court Portal'
      : 'Indian Kanoon',
    url: l.url,
    description: `${l.portalName} (${l.warningNotice})`,
    isDirectCaseLink: l.isDirectLink,
    warningNotice: l.warningNotice
  }));

  // Append Google Scholar search
  if (caseInput.case_no) {
    targets.push({
      name: 'Google Scholar',
      category: 'Google Scholar',
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(caseInput.case_no.trim())}`,
      description: 'Search Google Scholar for citations (may require CAPTCHA / manual entry)',
      isDirectCaseLink: false,
      warningNotice: 'may require CAPTCHA / manual entry'
    });
  }

  return targets;
}

export function buildQueryWebLinks(query: string, courtCode?: string): WebLinkTarget[] {
  const cleanQ = encodeURIComponent(query.trim());
  const normCourt = (courtCode || '').replace('~', '_').trim();
  const court = COURT_PORTAL_REGISTRY[normCourt];

  const links: WebLinkTarget[] = [
    {
      name: 'eCourts National PDF Search',
      category: 'eCourts',
      url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${cleanQ}`,
      description: 'Full-text judgment search on national eCourts database (may require CAPTCHA / manual entry)',
      isDirectCaseLink: false,
      warningNotice: 'may require CAPTCHA / manual entry'
    },
    {
      name: 'Indian Kanoon Full-Text Search',
      category: 'Indian Kanoon',
      url: `https://indiankanoon.org/search/?formInput=${cleanQ}`,
      description: 'Search Indian Kanoon legal repository (may require CAPTCHA / manual entry)',
      isDirectCaseLink: false,
      warningNotice: 'may require CAPTCHA / manual entry'
    }
  ];

  if (court && court.ikDoctype) {
    links.push({
      name: `Indian Kanoon — ${court.name}`,
      category: 'Indian Kanoon',
      url: `https://indiankanoon.org/search/?formInput=${cleanQ}+doctypes%3A${court.ikDoctype}`,
      description: `Scoped search within ${court.name} (may require CAPTCHA / manual entry)`,
      isDirectCaseLink: false,
      warningNotice: 'may require CAPTCHA / manual entry'
    });
    links.push({
      name: `${court.name} Official Portal`,
      category: 'High Court Portal',
      url: court.portalUrl,
      description: `Direct portal for ${court.name} (may require CAPTCHA / manual entry)`,
      isDirectCaseLink: false,
      warningNotice: 'may require CAPTCHA / manual entry'
    });
  }

  links.push({
    name: 'Google Scholar Legal Search',
    category: 'Google Scholar',
    url: `https://scholar.google.com/scholar?q=${cleanQ}`,
    description: 'Search Google Scholar case law and articles (may require CAPTCHA / manual entry)',
    isDirectCaseLink: false,
    warningNotice: 'may require CAPTCHA / manual entry'
  });

  return links;
}
