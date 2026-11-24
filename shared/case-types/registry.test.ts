import { describe, it, expect } from 'vitest';
import { COURT_CASE_TYPE_REGISTRY, normalizeCourtCaseType } from './registry';

describe('Case Type Registry & Normalizer', () => {
  it('exposes official court registry mappings for major High Courts', () => {
    expect(COURT_CASE_TYPE_REGISTRY['33_10']).toBeDefined();
    expect(COURT_CASE_TYPE_REGISTRY['29_3']).toBeDefined();
    expect(COURT_CASE_TYPE_REGISTRY['7_26']).toBeDefined();
    expect(COURT_CASE_TYPE_REGISTRY['1_1']).toBeDefined();
  });

  it('normalizes Madras High Court CRL.OP to FIR Quashing Petition', () => {
    const res = normalizeCourtCaseType('33_10', 'CRL.OP');
    expect(res.normalizedType).toBe('FIR Quashing Petition');
    expect(res.jurisdiction).toBe('Original');
    expect(res.isKnown).toBe(true);
  });

  it('normalizes Karnataka High Court CRL.P', () => {
    const res = normalizeCourtCaseType('29_3', 'CRL.P');
    expect(res.normalizedType).toBe('FIR Quashing Petition');
    expect(res.isKnown).toBe(true);
  });

  it('normalizes Delhi High Court BAIL APPLN.', () => {
    const res = normalizeCourtCaseType('7_26', 'BAIL APPLN.');
    expect(res.normalizedType).toBe('Bail Application');
    expect(res.isKnown).toBe(true);
  });

  it('normalizes Bombay High Court CARBAP to Arbitration Petition', () => {
    const res = normalizeCourtCaseType('1_1', 'CARBAP');
    expect(res.normalizedType).toBe('Arbitration Petition');
    expect(res.isKnown).toBe(true);
  });

  it('preserves unmapped codes as Other Official Case Type with isKnown false', () => {
    const res = normalizeCourtCaseType('33_10', 'XYZ.UNKNOWN.CODE');
    expect(res.normalizedType).toBe('Other Official Case Type');
    expect(res.isKnown).toBe(false);
  });
});
