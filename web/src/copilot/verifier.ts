import { JudgmentDocument } from '../types/schema';

export interface GroundedClaim {
  claimText: string;
  jid: string;
  paraIndex: number;
  verbatimQuote: string;
  verified?: boolean;
  sectionTag?: string;
}

export interface DroppedClaim {
  claimText: string;
  paraIndex: number;
  verbatimQuote: string;
  dropReason: 'quote_not_found' | 'paragraph_not_found' | 'quote_too_short' | 'counsel_submission_not_ratio';
}

export interface GroundedAnswer {
  summary: string;
  claims: GroundedClaim[];
  droppedClaims?: DroppedClaim[];
  insufficientEvidence?: boolean;
  insufficientReason?: string;
  limitedExtractableText?: boolean;
}

/**
 * Normalizes text for comparison by collapsing whitespace and quotation variations.
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[“”"'’`]/g, '"')
    .replace(/[.,;:!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Client-Side Grounded Claim Verifier
 * Audits every AI claim by checking whether the supplied verbatimQuote
 * is genuinely found in the designated paragraph of the judgment.
 * Any ungrounded claim or mismatched quote is strictly dropped and tracked.
 */
export function verifyClaims(
  claims: GroundedClaim[],
  doc: JudgmentDocument
): GroundedAnswer {
  const verifiedClaims: GroundedClaim[] = [];
  const droppedClaims: DroppedClaim[] = [];

  const totalTextLength = doc.paragraphs.reduce((acc, p) => acc + p.text.length, 0);
  const isLimitedText = doc.paragraphs.length <= 1 || totalTextLength < 150;

  for (const claim of claims) {
    // 1. Quote length check (Must be >= 15 characters to prevent trivial matches)
    if (!claim.verbatimQuote || claim.verbatimQuote.trim().length < 15) {
      droppedClaims.push({
        claimText: claim.claimText,
        paraIndex: claim.paraIndex,
        verbatimQuote: claim.verbatimQuote || '',
        dropReason: 'quote_too_short'
      });
      continue;
    }

    // 2. Find target paragraph by index
    const targetPara = doc.paragraphs.find(p => p.index === claim.paraIndex);
    if (!targetPara) {
      droppedClaims.push({
        claimText: claim.claimText,
        paraIndex: claim.paraIndex,
        verbatimQuote: claim.verbatimQuote,
        dropReason: 'paragraph_not_found'
      });
      continue;
    }

    const normQuote = normalizeForComparison(claim.verbatimQuote);
    const normPara = normalizeForComparison(targetPara.text);

    // 3. Verbatim inclusion check
    if (!normPara.includes(normQuote)) {
      droppedClaims.push({
        claimText: claim.claimText,
        paraIndex: claim.paraIndex,
        verbatimQuote: claim.verbatimQuote,
        dropReason: 'quote_not_found'
      });
      continue;
    }

    // 4. Section boundary check: if paragraph is merely counsel submissions, prevent attributing as court ratio
    const claimLower = claim.claimText.toLowerCase();
    const claimsCourtHolding = claimLower.includes('court held') || claimLower.includes('court ruled') || claimLower.includes('judged that');
    const isSubmission = targetPara.section_tag === 'Petitioner Submissions' || targetPara.section_tag === 'Respondent Submissions';
    if (isSubmission && claimsCourtHolding) {
      droppedClaims.push({
        claimText: claim.claimText,
        paraIndex: claim.paraIndex,
        verbatimQuote: claim.verbatimQuote,
        dropReason: 'counsel_submission_not_ratio'
      });
      continue;
    }

    verifiedClaims.push({
      ...claim,
      verified: true,
      sectionTag: targetPara.section_tag
    });
  }

  if (verifiedClaims.length === 0) {
    return {
      summary: isLimitedText
        ? 'Judgment has minimal extractable text or scanned annexures. Unable to ground answers with certified verbatim quotes.'
        : 'Insufficient evidence in judgment. No claims could be verified verbatim against certified paragraphs.',
      claims: [],
      droppedClaims,
      insufficientEvidence: true,
      insufficientReason: isLimitedText
        ? 'Scanned or minimal order text prevents verifiable extraction.'
        : 'Zero claims passed verbatim character matching.',
      limitedExtractableText: isLimitedText
    };
  }

  const dropNotice = droppedClaims.length > 0
    ? ` (${droppedClaims.length} unverified ${droppedClaims.length === 1 ? 'claim' : 'claims'} dropped to prevent hallucination)`
    : '';

  return {
    summary: `Verified ${verifiedClaims.length} grounded ${verifiedClaims.length === 1 ? 'claim' : 'claims'} with exact verbatim paragraph quotes${dropNotice}.`,
    claims: verifiedClaims,
    droppedClaims,
    insufficientEvidence: false,
    limitedExtractableText: isLimitedText
  };
}
