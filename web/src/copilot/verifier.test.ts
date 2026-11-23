import { describe, it, expect } from 'vitest';
import { verifyClaims, GroundedClaim } from './verifier';
import { KeyManager } from './key-manager';
import { JudgmentDocument } from '../types/schema';

describe('Grounded AI Claim Verifier & BYOK Key Manager', () => {
  const mockDoc: JudgmentDocument = {
    jid: 'j-test-123',
    cnr: 'CNR123',
    court_code: '33_10',
    court_name: 'Madras High Court',
    bench_code: '01',
    bench_name: 'Principal Seat',
    coram_type: 'Single Judge',
    judges: ['Justice Test'],
    case_type: 'CRL.OP',
    case_number: 'Crl.O.P. No. 100/2022',
    decision_date: '2022-01-01',
    parties: { petitioner: 'Applicant', respondent: 'State' },
    disposal_nature: 'Allowed',
    purpose_stage: 'Quashing',
    category: 'Criminal',
    pdf_source_url: '',
    language: 'en',
    derived_fields: { category: true, purpose_stage: true, coram_type: false },
    statutes: [],
    citations: [],
    sections: [],
    paragraphs: [
      {
        index: 1,
        text: 'This criminal original petition has been filed under Section 482 of CrPC seeking to quash the charge sheet.',
        section_tag: 'Facts',
        statute_mentions: ['CrPC 482'],
        citation_mentions: [],
        token_count: 20
      },
      {
        index: 2,
        text: 'A mere civil breach of contract cannot give rise to criminal liability under Section 420 of IPC without fraudulent inducement.',
        section_tag: 'Reasoning & Ratio',
        statute_mentions: ['IPC 420'],
        citation_mentions: [],
        token_count: 22
      }
    ]
  };

  it('accepts claims with genuine verbatim quotes', () => {
    const claims: GroundedClaim[] = [
      {
        claimText: 'Petition filed under section 482 CrPC',
        jid: 'j-test-123',
        paraIndex: 1,
        verbatimQuote: 'filed under Section 482 of CrPC seeking to quash the charge sheet'
      },
      {
        claimText: 'Civil breach cannot be cheating',
        jid: 'j-test-123',
        paraIndex: 2,
        verbatimQuote: 'civil breach of contract cannot give rise to criminal liability'
      }
    ];

    const result = verifyClaims(claims, mockDoc);
    expect(result.insufficientEvidence).toBe(false);
    expect(result.claims).toHaveLength(2);
    expect(result.claims[0].verified).toBe(true);
    expect(result.claims[1].verified).toBe(true);
  });

  it('drops hallucinated claims where quote does not exist in paragraph', () => {
    const claims: GroundedClaim[] = [
      {
        claimText: 'Legitimate claim',
        jid: 'j-test-123',
        paraIndex: 2,
        verbatimQuote: 'civil breach of contract cannot give rise'
      },
      {
        claimText: 'Hallucinated claim with fake quote',
        jid: 'j-test-123',
        paraIndex: 2,
        verbatimQuote: 'The accused must be sentenced to rigorous imprisonment for ten years'
      }
    ];

    const result = verifyClaims(claims, mockDoc);
    expect(result.insufficientEvidence).toBe(false);
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].claimText).toBe('Legitimate claim');
  });

  it('drops claims with invalid or out-of-range paragraph index', () => {
    const claims: GroundedClaim[] = [
      {
        claimText: 'Out of bounds claim',
        jid: 'j-test-123',
        paraIndex: 999,
        verbatimQuote: 'some quote'
      }
    ];

    const result = verifyClaims(claims, mockDoc);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.claims).toHaveLength(0);
  });

  it('falls back to insufficient evidence when all claims are hallucinated', () => {
    const claims: GroundedClaim[] = [
      {
        claimText: 'Fake 1',
        jid: 'j-test-123',
        paraIndex: 1,
        verbatimQuote: 'Completely made up text not in judgment'
      }
    ];

    const result = verifyClaims(claims, mockDoc);
    expect(result.insufficientEvidence).toBe(true);
    expect(result.claims).toHaveLength(0);
    expect(result.summary).toContain('Insufficient evidence in judgment');
  });

  it('enforces memory-first BYOK storage policy', () => {
    KeyManager.clearKey();
    expect(KeyManager.hasKey()).toBe(false);

    KeyManager.setKey('AIzaSyTestKey123', 'memory');
    expect(KeyManager.hasKey()).toBe(true);
    expect(KeyManager.getKey()).toBe('AIzaSyTestKey123');
    expect(KeyManager.getStorageTier()).toBe('memory');

    KeyManager.clearKey();
    expect(KeyManager.hasKey()).toBe(false);
  });
});
