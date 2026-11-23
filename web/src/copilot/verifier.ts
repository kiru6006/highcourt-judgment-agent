import { JudgmentDocument } from '../types/schema';

export interface GroundedClaim {
  claimText: string;
  jid: string;
  paraIndex: number;
  verbatimQuote: string;
  verified?: boolean;
}

export interface GroundedAnswer {
  summary: string;
  claims: GroundedClaim[];
  insufficientEvidence?: boolean;
}

/**
 * Normalizes text for comparison by collapsing whitespace and punctuation quirks.
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[“”"'’]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Client-Side Grounded Claim Verifier
 * Audits every AI claim by checking whether the supplied verbatimQuote
 * is genuinely found in the designated paragraph of the judgment.
 * Any ungrounded claim or mismatched quote is strictly dropped.
 */
export function verifyClaims(
  claims: GroundedClaim[],
  doc: JudgmentDocument
): GroundedAnswer {
  const verifiedClaims: GroundedClaim[] = [];

  for (const claim of claims) {
    if (!claim.verbatimQuote || !claim.verbatimQuote.trim()) {
      continue;
    }

    // Find target paragraph by index
    const targetPara = doc.paragraphs.find(p => p.index === claim.paraIndex);
    if (!targetPara) {
      continue;
    }

    const normQuote = normalizeForComparison(claim.verbatimQuote);
    const normPara = normalizeForComparison(targetPara.text);

    // Verbatim substring inclusion check
    if (normPara.includes(normQuote)) {
      verifiedClaims.push({
        ...claim,
        verified: true
      });
    }
  }

  if (verifiedClaims.length === 0) {
    return {
      summary: 'Insufficient evidence in judgment. No claims could be verified against certified paragraphs.',
      claims: [],
      insufficientEvidence: true
    };
  }

  return {
    summary: `Verified ${verifiedClaims.length} grounded ${verifiedClaims.length === 1 ? 'claim' : 'claims'} with exact verbatim paragraph quotes.`,
    claims: verifiedClaims,
    insufficientEvidence: false
  };
}
