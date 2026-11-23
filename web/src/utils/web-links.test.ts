import { describe, it, expect } from 'vitest';
import { buildCaseWebLinks, buildQueryWebLinks } from './web-links';

describe('Multi-Source Web Links Generator', () => {
  it('generates case links including CNR when provided', () => {
    const links = buildCaseWebLinks({
      cnr: 'HCMA010012342022',
      court_code: '33_10',
      case_no: 'Crl.O.P. No. 1234 of 2022',
      title: 'Applicant v. State'
    });

    expect(links.length).toBeGreaterThanOrEqual(5);

    const cnrLink = links.find(l => l.name.includes('CNR'));
    expect(cnrLink).toBeDefined();
    expect(cnrLink?.url).toContain('HCMA010012342022');

    const ikCourtLink = links.find(l => l.category === 'Indian Kanoon' && l.name.includes('Madras High Court'));
    expect(ikCourtLink).toBeDefined();
    expect(ikCourtLink?.url).toContain('doctypes%3Amadras');
  });

  it('generates query links with court scoping', () => {
    const links = buildQueryWebLinks('Section 482 CrPC', '33_10');
    expect(links.length).toBeGreaterThanOrEqual(4);

    const ikScoped = links.find(l => l.url.includes('doctypes%3Amadras'));
    expect(ikScoped).toBeDefined();
  });
});
