/**
 * NyayaReader Legal Query Parser
 * Parses natural legal search input into structured intents:
 * - Case Numbers: WP 1234/2022, Crl.OP No. 567 of 2021, WA 89/2020
 * - Statutory Citations: Section 482 CrPC, Article 226, Sec 138 NI Act
 * - Party Names: X v. Y, State of ... v. ...
 * - Free text terms with weighted BM25 boosts
 */

export interface ParsedLegalQuery {
  raw: string;
  cleanText: string;
  caseNumbers: string[];
  statutes: string[];
  parties?: {
    petitioner?: string;
    respondent?: string;
  };
  boosts: {
    caseTitle: number;
    caseNo: number;
    statutes: number;
    category: number;
    body: number;
  };
}

const CASE_NO_PATTERNS = [
  /\b(?:W\.?P\.?(?:\s*\([A-Z]+\))?|Crl\.?O\.?P\.?|Crl\.?A\.?|C\.?S\.?|W\.?A\.?|O\.?S\.?A\.?|S\.?L\.?P\.?|Arb\.?O\.?P\.?|Cont\.?P\.?|Comp\.?App)\s*(?:No\.?|Nos\.?)?\s*[\d/–-]+(?:\s*(?:of|\/)\s*\d{4})?\b/gi,
  /\b(?:W\.?P\.?|Crl\.?O\.?P\.?|Crl\.?A\.?|C\.?S\.?)\s*(?:No\.?)?\s*\d+(?:\s*\/\s*\d{4})?\b/gi
];

const STATUTE_PATTERNS = [
  /\b(?:Section|Sec\.?|S\.)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:Cr\.?P\.?C\.?|Code\s*of\s*Criminal\s*Procedure)\b/gi,
  /\b(?:Section|Sec\.?|S\.)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:I\.?P\.?C\.?|Indian\s*Penal\s*Code)\b/gi,
  /\b(?:Section|Sec\.?|S\.)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:N\.?I\.?\s*Act|Negotiable\s*Instruments\s*Act)\b/gi,
  /\b(?:Article|Art\.?)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:Constitution(?:\s*of\s*India)?)\b/gi,
  /\b(?:Section|Sec\.?|S\.)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:BNS|Bharatiya\s*Nyaya\s*Sanhita)\b/gi,
  /\b(?:Section|Sec\.?|S\.)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:BNSS|Bharatiya\s*Nagarik\s*Suraksha\s*Sanhita)\b/gi,
  /\b(?:Section|Sec\.?|S\.)\s*([0-9]+[A-Z]?)\s*(?:of\s*(?:the\s*)?)?(?:BSA|Bharatiya\s*Sakshya\s*Adhiniyam)\b/gi
];

const VS_PATTERN = /(?:^|\b)(.+?)\s+(?:v\.?|vs\.?|versus)\s+([^,;]+?)(?:\s+(?:guidelines|case|matter|judgment|order)|$)/i;

export function parseLegalQuery(query: string): ParsedLegalQuery {
  const raw = query.trim();
  if (!raw) {
    return {
      raw: '',
      cleanText: '',
      caseNumbers: [],
      statutes: [],
      boosts: { caseTitle: 3.0, caseNo: 3.5, statutes: 2.5, category: 1.5, body: 1.0 }
    };
  }

  const caseNumbers: string[] = [];
  let working = raw;

  // Extract case numbers
  for (const regex of CASE_NO_PATTERNS) {
    const matches = working.match(regex);
    if (matches) {
      for (const m of matches) {
        if (!caseNumbers.includes(m)) {
          caseNumbers.push(m);
        }
      }
    }
  }

  // Extract statutes
  const statutes: string[] = [];
  for (const regex of STATUTE_PATTERNS) {
    const matches = working.matchAll(regex);
    for (const match of matches) {
      statutes.push(match[0].trim());
    }
  }

  // Extract parties if vs pattern present
  let parties: { petitioner?: string; respondent?: string } | undefined = undefined;
  const vsMatch = working.match(VS_PATTERN);
  if (vsMatch && vsMatch[1] && vsMatch[2]) {
    const p1 = vsMatch[1].trim();
    const p2 = vsMatch[2].trim();
    if (p1.length > 2 && p2.length > 2) {
      parties = {
        petitioner: p1,
        respondent: p2
      };
    }
  }

  // Normalize working clean text
  let cleanText = working;
  for (const cn of caseNumbers) {
    cleanText = cleanText.replace(cn, ' ');
  }
  for (const st of statutes) {
    cleanText = cleanText.replace(st, ' ');
  }
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  // If entire query was parsed into case numbers or statutes, keep cleanText as original for fallback tokenization
  if (!cleanText && (caseNumbers.length > 0 || statutes.length > 0)) {
    cleanText = raw;
  }

  return {
    raw,
    cleanText,
    caseNumbers,
    statutes,
    parties,
    boosts: {
      caseTitle: 3.0,
      caseNo: 3.5,
      statutes: 2.5,
      category: 1.5,
      body: 1.0
    }
  };
}
