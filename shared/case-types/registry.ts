/**
 * Nyaya AI Reader v1.3.0 — Comprehensive Case-Type Mapping Registry
 * Maps court-specific official case type codes across Indian High Courts
 * to standard normalized procedural categories while strictly preserving raw codes.
 */

export interface NormalizedCaseTypeMapping {
  code: string;
  officialDescription: string;
  normalizedCategory: 
    | 'Writ Petition'
    | 'Writ Appeal'
    | 'Original Suit'
    | 'Original Petition'
    | 'Civil Appeal'
    | 'Criminal Appeal'
    | 'Civil Revision'
    | 'Criminal Revision'
    | 'Bail Application'
    | 'Anticipatory Bail'
    | 'FIR Quashing Petition'
    | 'Review Petition'
    | 'Contempt Petition'
    | 'Arbitration Petition'
    | 'Company Petition'
    | 'Tax Appeal'
    | 'Matrimonial Appeal'
    | 'Second Appeal'
    | 'Miscellaneous Appeal'
    | 'Public Interest Litigation'
    | 'Other Official Case Type';
  jurisdiction: 'Writ' | 'Appellate' | 'Original' | 'Revisional' | 'Special' | 'Unknown';
}

export const COURT_CASE_TYPE_REGISTRY: Record<string, NormalizedCaseTypeMapping[]> = {
  // Madras High Court (33_10)
  "33_10": [
    { code: "WP", officialDescription: "Writ Petition", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "WA", officialDescription: "Writ Appeal", normalizedCategory: "Writ Appeal", jurisdiction: "Appellate" },
    { code: "CRL.OP", officialDescription: "Criminal Original Petition", normalizedCategory: "FIR Quashing Petition", jurisdiction: "Original" },
    { code: "CRL.A", officialDescription: "Criminal Appeal", normalizedCategory: "Criminal Appeal", jurisdiction: "Appellate" },
    { code: "CRL.RC", officialDescription: "Criminal Revision Case", normalizedCategory: "Criminal Revision", jurisdiction: "Revisional" },
    { code: "CRL.MP", officialDescription: "Criminal Miscellaneous Petition", normalizedCategory: "Bail Application", jurisdiction: "Original" },
    { code: "AS", officialDescription: "Appeal Suit (First Appeal)", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" },
    { code: "SA", officialDescription: "Second Appeal", normalizedCategory: "Second Appeal", jurisdiction: "Appellate" },
    { code: "CMA", officialDescription: "Civil Miscellaneous Appeal", normalizedCategory: "Miscellaneous Appeal", jurisdiction: "Appellate" },
    { code: "CRP", officialDescription: "Civil Revision Petition", normalizedCategory: "Civil Revision", jurisdiction: "Revisional" },
    { code: "CONT.P", officialDescription: "Contempt Petition", normalizedCategory: "Contempt Petition", jurisdiction: "Special" },
    { code: "ARB.OP", officialDescription: "Arbitration Original Petition", normalizedCategory: "Arbitration Petition", jurisdiction: "Original" },
    { code: "TCA", officialDescription: "Tax Case Appeal", normalizedCategory: "Tax Appeal", jurisdiction: "Appellate" },
    { code: "CS", officialDescription: "Civil Suit (Original Side)", normalizedCategory: "Original Suit", jurisdiction: "Original" },
    { code: "REV.APLW", officialDescription: "Review Application (Writ)", normalizedCategory: "Review Petition", jurisdiction: "Writ" },
    { code: "WP(MD)", officialDescription: "Writ Petition (Madurai Bench)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" }
  ],
  // Karnataka High Court (29_3)
  "29_3": [
    { code: "WP", officialDescription: "Writ Petition", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "WA", officialDescription: "Writ Appeal", normalizedCategory: "Writ Appeal", jurisdiction: "Appellate" },
    { code: "CRL.P", officialDescription: "Criminal Petition (482 / Bail)", normalizedCategory: "FIR Quashing Petition", jurisdiction: "Original" },
    { code: "CRL.A", officialDescription: "Criminal Appeal", normalizedCategory: "Criminal Appeal", jurisdiction: "Appellate" },
    { code: "CRL.RP", officialDescription: "Criminal Revision Petition", normalizedCategory: "Criminal Revision", jurisdiction: "Revisional" },
    { code: "RFA", officialDescription: "Regular First Appeal", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" },
    { code: "RSA", officialDescription: "Regular Second Appeal", normalizedCategory: "Second Appeal", jurisdiction: "Appellate" },
    { code: "MFA", officialDescription: "Miscellaneous First Appeal", normalizedCategory: "Miscellaneous Appeal", jurisdiction: "Appellate" },
    { code: "CRP", officialDescription: "Civil Revision Petition", normalizedCategory: "Civil Revision", jurisdiction: "Revisional" },
    { code: "CCC", officialDescription: "Civil Contempt Case", normalizedCategory: "Contempt Petition", jurisdiction: "Special" },
    { code: "CMP", officialDescription: "Civil Miscellaneous Petition (Arbitration Sec 11)", normalizedCategory: "Arbitration Petition", jurisdiction: "Original" },
    { code: "ITA", officialDescription: "Income Tax Appeal", normalizedCategory: "Tax Appeal", jurisdiction: "Appellate" },
    { code: "PIL", officialDescription: "Public Interest Litigation", normalizedCategory: "Public Interest Litigation", jurisdiction: "Writ" }
  ],
  // Delhi High Court (7_26)
  "7_26": [
    { code: "W.P.(C)", officialDescription: "Writ Petition (Civil)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "W.P.(CRL)", officialDescription: "Writ Petition (Criminal)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "LPA", officialDescription: "Letters Patent Appeal", normalizedCategory: "Writ Appeal", jurisdiction: "Appellate" },
    { code: "CRL.M.C.", officialDescription: "Criminal Miscellaneous Main (Sec 482)", normalizedCategory: "FIR Quashing Petition", jurisdiction: "Original" },
    { code: "BAIL APPLN.", officialDescription: "Bail Application", normalizedCategory: "Bail Application", jurisdiction: "Original" },
    { code: "CRL.A.", officialDescription: "Criminal Appeal", normalizedCategory: "Criminal Appeal", jurisdiction: "Appellate" },
    { code: "CRL.REV.P.", officialDescription: "Criminal Revision Petition", normalizedCategory: "Criminal Revision", jurisdiction: "Revisional" },
    { code: "CS(COMM)", officialDescription: "Commercial Civil Suit", normalizedCategory: "Original Suit", jurisdiction: "Original" },
    { code: "ARB.P.", officialDescription: "Arbitration Petition", normalizedCategory: "Arbitration Petition", jurisdiction: "Original" },
    { code: "O.M.P.(COMM)", officialDescription: "Original Miscellaneous Petition (Commercial Arbitration)", normalizedCategory: "Arbitration Petition", jurisdiction: "Original" },
    { code: "CONT.CAS(C)", officialDescription: "Contempt Case (Civil)", normalizedCategory: "Contempt Petition", jurisdiction: "Special" },
    { code: "MAT.APP.(F.C.)", officialDescription: "Matrimonial Appeal (Family Court)", normalizedCategory: "Matrimonial Appeal", jurisdiction: "Appellate" },
    { code: "FAO", officialDescription: "First Appeal from Order", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" },
    { code: "RFA", officialDescription: "Regular First Appeal", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" }
  ],
  // Bombay High Court (1_1)
  "1_1": [
    { code: "WP", officialDescription: "Writ Petition", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "APL", officialDescription: "Criminal Application (Sec 482)", normalizedCategory: "FIR Quashing Petition", jurisdiction: "Original" },
    { code: "BA", officialDescription: "Bail Application", normalizedCategory: "Bail Application", jurisdiction: "Original" },
    { code: "ABA", officialDescription: "Anticipatory Bail Application", normalizedCategory: "Anticipatory Bail", jurisdiction: "Original" },
    { code: "APEAL", officialDescription: "Criminal Appeal", normalizedCategory: "Criminal Appeal", jurisdiction: "Appellate" },
    { code: "REVN", officialDescription: "Criminal Revision Application", normalizedCategory: "Criminal Revision", jurisdiction: "Revisional" },
    { code: "FA", officialDescription: "First Appeal", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" },
    { code: "SA", officialDescription: "Second Appeal", normalizedCategory: "Second Appeal", jurisdiction: "Appellate" },
    { code: "CRA", officialDescription: "Civil Revision Application", normalizedCategory: "Civil Revision", jurisdiction: "Revisional" },
    { code: "CARBAP", officialDescription: "Commercial Arbitration Application", normalizedCategory: "Arbitration Petition", jurisdiction: "Original" },
    { code: "CP", officialDescription: "Contempt Petition", normalizedCategory: "Contempt Petition", jurisdiction: "Special" },
    { code: "PIL", officialDescription: "Public Interest Litigation", normalizedCategory: "Public Interest Litigation", jurisdiction: "Writ" }
  ],
  // Calcutta High Court (19_16)
  "19_16": [
    { code: "WPA", officialDescription: "Writ Petition (Appellate Side)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "WPO", officialDescription: "Writ Petition (Original Side)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "CRM", officialDescription: "Criminal Miscellaneous (Bail/Anticipatory Bail)", normalizedCategory: "Bail Application", jurisdiction: "Original" },
    { code: "CRR", officialDescription: "Criminal Revision", normalizedCategory: "Criminal Revision", jurisdiction: "Revisional" },
    { code: "CRA", officialDescription: "Criminal Appeal", normalizedCategory: "Criminal Appeal", jurisdiction: "Appellate" },
    { code: "FMA", officialDescription: "First Miscellaneous Appeal", normalizedCategory: "Miscellaneous Appeal", jurisdiction: "Appellate" },
    { code: "FA", officialDescription: "First Appeal", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" },
    { code: "SAT", officialDescription: "Second Appeal Tender", normalizedCategory: "Second Appeal", jurisdiction: "Appellate" },
    { code: "AP", officialDescription: "Arbitration Petition (Original Side)", normalizedCategory: "Arbitration Petition", jurisdiction: "Original" },
    { code: "CP", officialDescription: "Contempt Petition", normalizedCategory: "Contempt Petition", jurisdiction: "Special" }
  ],
  // Allahabad High Court (13_1)
  "13_1": [
    { code: "WRIC", officialDescription: "Writ - C (Civil)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "WRIA", officialDescription: "Writ - A (Service)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "WRIB", officialDescription: "Writ - B (Consolidation/Revenue)", normalizedCategory: "Writ Petition", jurisdiction: "Writ" },
    { code: "BAIL", officialDescription: "Criminal Miscellaneous Bail Application", normalizedCategory: "Bail Application", jurisdiction: "Original" },
    { code: "ABAIL", officialDescription: "Anticipatory Bail Application", normalizedCategory: "Anticipatory Bail", jurisdiction: "Original" },
    { code: "A482", officialDescription: "Application Under Section 482 CrPC", normalizedCategory: "FIR Quashing Petition", jurisdiction: "Original" },
    { code: "CRLA", officialDescription: "Criminal Appeal", normalizedCategory: "Criminal Appeal", jurisdiction: "Appellate" },
    { code: "CRLR", officialDescription: "Criminal Revision", normalizedCategory: "Criminal Revision", jurisdiction: "Revisional" },
    { code: "FA", officialDescription: "First Appeal", normalizedCategory: "Civil Appeal", jurisdiction: "Appellate" },
    { code: "SA", officialDescription: "Second Appeal", normalizedCategory: "Second Appeal", jurisdiction: "Appellate" },
    { code: "CONT", officialDescription: "Contempt Application (Civil)", normalizedCategory: "Contempt Petition", jurisdiction: "Special" }
  ]
};

export function normalizeCourtCaseType(
  courtCode: string,
  rawCode: string
): { normalizedType: string; jurisdiction: string; isKnown: boolean } {
  const normCourt = courtCode.replace('~', '_');
  const courtEntries = COURT_CASE_TYPE_REGISTRY[normCourt];
  if (courtEntries) {
    const cleanRaw = rawCode.trim().toUpperCase().replace(/\s+/g, '');
    const found = courtEntries.find(e => e.code.toUpperCase().replace(/\s+/g, '') === cleanRaw);
    if (found) {
      return {
        normalizedType: found.normalizedCategory,
        jurisdiction: found.jurisdiction,
        isKnown: true
      };
    }
  }

  // Cross-court standard heuristics fallback (without inventing fake categories)
  const upper = rawCode.toUpperCase();
  if (upper.includes("BAIL")) return { normalizedType: "Bail Application", jurisdiction: "Original", isKnown: true };
  if (upper.startsWith("WP") || upper.includes("WRIT")) return { normalizedType: "Writ Petition", jurisdiction: "Writ", isKnown: true };
  if (upper.includes("482")) return { normalizedType: "FIR Quashing Petition", jurisdiction: "Original", isKnown: true };
  if (upper.startsWith("WA") || upper.includes("LPA")) return { normalizedType: "Writ Appeal", jurisdiction: "Appellate", isKnown: true };
  if (upper.includes("CRL.A") || upper.includes("CRLA")) return { normalizedType: "Criminal Appeal", jurisdiction: "Appellate", isKnown: true };
  if (upper.includes("ARB")) return { normalizedType: "Arbitration Petition", jurisdiction: "Original", isKnown: true };
  if (upper.includes("CONT")) return { normalizedType: "Contempt Petition", jurisdiction: "Special", isKnown: true };

  return {
    normalizedType: "Other Official Case Type",
    jurisdiction: "Unknown",
    isKnown: false
  };
}
