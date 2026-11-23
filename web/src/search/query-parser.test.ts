import { describe, it, expect } from 'vitest';
import { parseLegalQuery } from './query-parser';

describe('Legal Query Parser', () => {
  it('parses empty query', () => {
    const res = parseLegalQuery('');
    expect(res.raw).toBe('');
    expect(res.caseNumbers).toHaveLength(0);
    expect(res.statutes).toHaveLength(0);
  });

  it('extracts writ petition and criminal OP case numbers', () => {
    const res1 = parseLegalQuery('WP No. 1234/2022 regular bail');
    expect(res1.caseNumbers).toContain('WP No. 1234/2022');
    expect(res1.cleanText).toContain('regular bail');

    const res2 = parseLegalQuery('Crl.O.P. No. 100 of 2022 quash proceedings');
    expect(res2.caseNumbers.length).toBeGreaterThan(0);
    expect(res2.caseNumbers[0]).toContain('Crl.O.P. No. 100 of 2022');
  });

  it('extracts statutory citations', () => {
    const res1 = parseLegalQuery('Application under Section 482 CrPC for quashing');
    expect(res1.statutes).toHaveLength(1);
    expect(res1.statutes[0]).toMatch(/Section 482 Cr\.?P\.?C/i);

    const res2 = parseLegalQuery('Writ under Article 226 Constitution of India');
    expect(res2.statutes).toHaveLength(1);
    expect(res2.statutes[0]).toMatch(/Article 226 Constitution/i);

    const res3 = parseLegalQuery('Cheque bounce Sec. 138 NI Act');
    expect(res3.statutes).toHaveLength(1);
    expect(res3.statutes[0]).toMatch(/Sec\.? 138 NI Act/i);
  });

  it('extracts petitioner and respondent from party title', () => {
    const res = parseLegalQuery('State of Haryana v. Bhajan Lal guidelines on FIR');
    expect(res.parties).toBeDefined();
    expect(res.parties?.petitioner).toContain('State of Haryana');
    expect(res.parties?.respondent).toContain('Bhajan Lal');
  });

  it('handles combination of case number, statute, and free text', () => {
    const res = parseLegalQuery('WP 500/2022 Section 482 CrPC interim stay');
    expect(res.caseNumbers.length).toBeGreaterThan(0);
    expect(res.statutes.length).toBeGreaterThan(0);
    expect(res.cleanText).toContain('interim stay');
  });
});
