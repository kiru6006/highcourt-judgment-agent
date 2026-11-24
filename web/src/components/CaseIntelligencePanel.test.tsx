import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CaseIntelligencePanel } from './CaseIntelligencePanel';
import { JudgmentDocument } from '../types/schema';

describe('CaseIntelligencePanel (M6)', () => {
  const mockJumpToPara = vi.fn();

  const mockFullDoc: JudgmentDocument = {
    jid: 'test_doc_001',
    cnr: 'HCMA010012342023',
    court_code: '33_10',
    court_name: 'Madras High Court',
    bench_code: '01',
    bench_name: 'Principal Seat at Madras',
    coram_type: 'Single Judge',
    judges: ["Hon'ble Justice A"],
    case_type: 'CRL.OP',
    raw_case_type: 'CRL.OP',
    case_number: 'Crl.O.P. 1234/2023',
    decision_date: '2023-05-15',
    parties: {
      petitioner: 'Applicant A',
      respondent: 'State of Tamil Nadu'
    },
    disposal_nature: 'Allowed',
    purpose_stage: 'Final Hearing',
    category: 'Criminal',
    pdf_source_url: 'https://www.hcmadras.tn.nic.in/order.pdf',
    language: 'en',
    statutes: [{ act_code: 'CrPC', act: 'Code of Criminal Procedure', section: '439', paragraph_indices: [2] }],
    paragraphs: [
      { index: 1, text: 'Para 1 facts', section_tag: 'Facts', statute_mentions: [], citation_mentions: [], token_count: 10 },
      { index: 2, text: 'Para 2 bail application under Section 439 CrPC', section_tag: 'Reasoning & Ratio', statute_mentions: [], citation_mentions: [], token_count: 15 }
    ],
    sections: [],
    citations: [],
    is_synthetic: false,
    derived_fields: {
      category: false,
      purpose_stage: false,
      coram_type: false
    },
    classification_metadata: {
      reviewStatus: 'pending',
      statedClassification: {
        method: 'registry',
        taxonomyVersion: '1.0',
        domainId: 'domain_criminal',
        domainLabel: 'Criminal Law',
        subjectIds: [],
        jurisdictionType: 'Original',
        normalizedCaseType: 'Crl.O.P.',
        officialDescription: 'Criminal Original Petition',
        confidence: 1.0,
        evidenceParagraphs: [],
        reviewStatus: 'pending',
        sourceUrl: 'https://www.hcmadras.tn.nic.in/case_status.php',
        status: 'verified'
      } as any,
      inferredClassification: [
        {
          ruleId: 'RULE_CRIM_BAIL',
          method: 'rule',
          taxonomyVersion: '1.0',
          domainId: 'domain_criminal',
          domainLabel: 'Criminal Law',
          subjectIds: ['subj_crim_bail'],
          jurisdictionType: 'Original',
          confidence: 0.85,
          evidenceParagraphs: [2],
          reviewStatus: 'pending'
        }
      ],
      anomaliesDetected: []
    }
  };

  it('renders Stated, Inferred, and Unknown sections with visual separation', () => {
    const html = renderToString(<CaseIntelligencePanel judgment={mockFullDoc} onJumpToPara={mockJumpToPara} />);

    expect(html).toContain('Case Classification &amp; Legal Intelligence');

    // Stated section
    expect(html).toContain('Stated');
    expect(html).toContain('Criminal Law');
    expect(html).toContain('Criminal Original Petition');
    expect(html).toContain('Verified Registry Source');

    // Inferred section
    expect(html).toContain('Inferred');
    expect(html).toContain('RULE_CRIM_BAIL');
    expect(html).toContain('Para <!-- -->2');

    // Unknown/Preserved section
    expect(html).toContain('Raw / Unknown');
    expect(html).toContain('CRL.OP');
  });

  it('renders gracefully on documents with zero classification or unmapped codes', () => {
    const unclassifiedDoc: JudgmentDocument = {
      ...mockFullDoc,
      case_type: 'CUSTOM_UNKNOWN_CODE',
      raw_case_type: 'CUSTOM_UNKNOWN_CODE',
      classification_metadata: undefined
    };

    const html = renderToString(<CaseIntelligencePanel judgment={unclassifiedDoc} onJumpToPara={mockJumpToPara} />);

    expect(html).toContain('No verified court registry match');
    expect(html).toContain('Zero rule-based subjects triggered');
    expect(html).toContain('CUSTOM_UNKNOWN_CODE');
  });

  it('never merges Stated, Inferred, and Unknown sections in markup', () => {
    const html = renderToString(<CaseIntelligencePanel judgment={mockFullDoc} onJumpToPara={mockJumpToPara} />);
    
    // Check that Stated (blue), Inferred (emerald), and Unknown (dashed slate) exist as distinct sections
    expect(html).toContain('border-blue-200');
    expect(html).toContain('border-emerald-200');
    expect(html).toContain('border-dashed');
  });
});
