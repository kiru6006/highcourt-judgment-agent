/**
 * NyayaReader Multi-Source Web Links Generator
 * Zero-key deep-link builder across official and public legal portals:
 * - eCourts Services (CNR search & national judgment PDF search)
 * - State High Court Judis & Order Portals (Madras, Delhi, Karnataka, Bombay)
 * - Indian Kanoon (General and High-Court scoped search)
 * - Google Scholar Case Law
 */

export interface WebLinkTarget {
  name: string;
  category: 'eCourts' | 'High Court Portal' | 'Indian Kanoon' | 'Google Scholar';
  url: string;
  description: string;
  isDirectCaseLink: boolean;
}

export interface CaseLinkInput {
  cnr?: string;
  court_code: string;
  case_no: string;
  title: string;
  year?: number;
  citations?: string[];
}

const COURT_META: Record<string, { name: string; portalUrl: string; ikDoctype: string }> = {
  '33_10': {
    name: 'Madras High Court',
    portalUrl: 'https://www.hcmadras.tn.nic.in/case_status.php',
    ikDoctype: 'madras'
  },
  '29_3': {
    name: 'Karnataka High Court',
    portalUrl: 'https://karnatakahihecourt.kar.nic.in/',
    ikDoctype: 'karnataka'
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

export function buildCaseWebLinks(caseInput: CaseLinkInput): WebLinkTarget[] {
  const links: WebLinkTarget[] = [];
  const court = COURT_META[caseInput.court_code] || {
    name: `High Court (${caseInput.court_code})`,
    portalUrl: 'https://services.ecourts.gov.in/ecourtindia_v6/',
    ikDoctype: ''
  };

  const cleanCaseNo = encodeURIComponent(caseInput.case_no.trim());
  const cleanTitle = encodeURIComponent(caseInput.title.trim());

  // 1. eCourts CNR Link (direct if CNR available)
  if (caseInput.cnr && caseInput.cnr.trim().length >= 16) {
    const cleanCnr = encodeURIComponent(caseInput.cnr.trim());
    links.push({
      name: 'eCourts CNR Search',
      category: 'eCourts',
      url: `https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index&app_token=1&cino=${cleanCnr}`,
      description: `Direct eCourts record for CNR ${caseInput.cnr}`,
      isDirectCaseLink: true
    });
  }

  // 2. eCourts National Judgment PDF Search by Case No
  links.push({
    name: 'eCourts Judgment Search',
    category: 'eCourts',
    url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${cleanCaseNo}`,
    description: `Search official eCourts judgment repository for ${caseInput.case_no}`,
    isDirectCaseLink: true
  });

  // 3. Official High Court Portal
  links.push({
    name: `${court.name} Portal`,
    category: 'High Court Portal',
    url: court.portalUrl,
    description: `Official case status portal for ${court.name}`,
    isDirectCaseLink: false
  });

  // 4. Indian Kanoon Court-Scoped Search
  const ikQuery = court.ikDoctype
    ? `${cleanCaseNo}+doctypes%3A${court.ikDoctype}`
    : cleanCaseNo;

  links.push({
    name: `Indian Kanoon (${court.name})`,
    category: 'Indian Kanoon',
    url: `https://indiankanoon.org/search/?formInput=${ikQuery}`,
    description: `Search ${court.name} precedents on Indian Kanoon`,
    isDirectCaseLink: true
  });

  // 5. Indian Kanoon by Title
  links.push({
    name: 'Indian Kanoon Title Search',
    category: 'Indian Kanoon',
    url: `https://indiankanoon.org/search/?formInput=${cleanTitle}`,
    description: `Search case title "${caseInput.title}"`,
    isDirectCaseLink: false
  });

  // 6. Google Scholar Legal Search
  links.push({
    name: 'Google Scholar',
    category: 'Google Scholar',
    url: `https://scholar.google.com/scholar?q=${cleanCaseNo}`,
    description: `Search Google Scholar for citations to ${caseInput.case_no}`,
    isDirectCaseLink: false
  });

  return links;
}

export function buildQueryWebLinks(query: string, courtCode?: string): WebLinkTarget[] {
  const cleanQ = encodeURIComponent(query.trim());
  const court = courtCode ? COURT_META[courtCode] : undefined;

  const links: WebLinkTarget[] = [
    {
      name: 'eCourts National PDF Search',
      category: 'eCourts',
      url: `https://judgments.ecourts.gov.in/pdfsearch/?query=${cleanQ}`,
      description: `Full-text judgment search on national eCourts database`,
      isDirectCaseLink: false
    },
    {
      name: 'Indian Kanoon Full-Text Search',
      category: 'Indian Kanoon',
      url: `https://indiankanoon.org/search/?formInput=${cleanQ}`,
      description: `Search Indian Kanoon legal repository`,
      isDirectCaseLink: false
    }
  ];

  if (court && court.ikDoctype) {
    links.push({
      name: `Indian Kanoon — ${court.name}`,
      category: 'Indian Kanoon',
      url: `https://indiankanoon.org/search/?formInput=${cleanQ}+doctypes%3A${court.ikDoctype}`,
      description: `Scoped search within ${court.name}`,
      isDirectCaseLink: false
    });
    links.push({
      name: `${court.name} Official Portal`,
      category: 'High Court Portal',
      url: court.portalUrl,
      description: `Direct portal for ${court.name}`,
      isDirectCaseLink: false
    });
  }

  links.push({
    name: 'Google Scholar Legal Search',
    category: 'Google Scholar',
    url: `https://scholar.google.com/scholar?q=${cleanQ}`,
    description: `Search Google Scholar case law and articles`,
    isDirectCaseLink: false
  });

  return links;
}
