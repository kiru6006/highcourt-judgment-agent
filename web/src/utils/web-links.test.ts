import { describe, it, expect } from 'vitest';
import { buildPortalLinks, buildCaseWebLinks, buildQueryWebLinks } from './web-links';

describe('External Portal Link Finder (M5)', () => {
  it('generates all 4 portal links for full Madras High Court fixture', () => {
    const result = buildPortalLinks({
      cnr: 'HCMA010012342023',
      court: '33_10',
      caseType: 'CRL.OP',
      caseNumber: '1234/2023',
      year: 2023
    });

    expect(result.links).toHaveLength(4);
    expect(result.omitted).toHaveLength(0);

    const ecServices = result.links.find(l => l.id === 'ecourts_services');
    expect(ecServices).toBeDefined();
    expect(ecServices?.url).toContain('cino=HCMA010012342023');
    expect(ecServices?.warningNotice).toBe('may require CAPTCHA / manual entry');

    const ecJudgments = result.links.find(l => l.id === 'ecourts_judgments');
    expect(ecJudgments).toBeDefined();
    expect(ecJudgments?.url).toContain('query=HCMA010012342023');

    const hcPortal = result.links.find(l => l.id === 'high_court_portal');
    expect(hcPortal).toBeDefined();
    expect(hcPortal?.url).toBe('https://www.hcmadras.tn.nic.in/case_status.php');

    const ik = result.links.find(l => l.id === 'indian_kanoon');
    expect(ik).toBeDefined();
    expect(ik?.url).toContain('indiankanoon.org/search/?formInput=');
    expect(ik?.url).toContain('doctypes%3Amadras');
  });

  it('omits eCourts CNR link when CNR is missing and falls back to case search without guessing', () => {
    const result = buildPortalLinks({
      court: '7_26',
      caseType: 'W.P.(C)',
      caseNumber: '500/2023'
    });

    const ecServices = result.links.find(l => l.id === 'ecourts_services');
    expect(ecServices).toBeDefined();
    expect(ecServices?.url).toContain('casestatus/index');
    expect(ecServices?.isDirectLink).toBe(false);

    const ecJudgments = result.links.find(l => l.id === 'ecourts_judgments');
    expect(ecJudgments?.url).toContain('W.P.(C)%20500%2F2023');
  });

  it('omits High Court portal link and states why for unmapped court code', () => {
    const result = buildPortalLinks({
      court: '99_99',
      caseNumber: '100/2023'
    });

    const hcPortal = result.links.find(l => l.id === 'high_court_portal');
    expect(hcPortal).toBeUndefined();

    const omittedHc = result.omitted.find(o => o.id === 'high_court_portal');
    expect(omittedHc).toBeDefined();
    expect(omittedHc?.omittedReason).toContain("Unmapped or unverified High Court portal URL for court code: '99_99'");
  });

  it('omits all links with reasons when all case identifiers are missing', () => {
    const result = buildPortalLinks({
      court: ''
    });

    expect(result.links).toHaveLength(0);
    expect(result.omitted).toHaveLength(4);

    const omittedIds = result.omitted.map(o => o.id);
    expect(omittedIds).toContain('ecourts_services');
    expect(omittedIds).toContain('ecourts_judgments');
    expect(omittedIds).toContain('high_court_portal');
    expect(omittedIds).toContain('indian_kanoon');

    for (const om of result.omitted) {
      expect(om.omittedReason.length).toBeGreaterThan(10);
    }
  });

  it('backward-compatible buildCaseWebLinks attaches warningNotice to every target', () => {
    const targets = buildCaseWebLinks({
      cnr: 'HCKA010099992023',
      court_code: '29_3',
      case_no: 'WP 9999/2023',
      title: 'Company v. Commissioner'
    });

    expect(targets.length).toBeGreaterThanOrEqual(4);
    for (const t of targets) {
      expect(t.warningNotice).toBe('may require CAPTCHA / manual entry');
    }
  });

  it('generates query web links with court scoping and warning notice', () => {
    const links = buildQueryWebLinks('Section 482 CrPC', '33_10');
    expect(links.length).toBeGreaterThanOrEqual(4);

    const ikScoped = links.find(l => l.url.includes('doctypes%3Amadras'));
    expect(ikScoped).toBeDefined();
    expect(ikScoped?.warningNotice).toBe('may require CAPTCHA / manual entry');
  });
});
