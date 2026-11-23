import { describe, it, expect } from 'vitest';
import { SYNTHETIC_JUDGMENTS } from './synthetic-judgments';

describe('Synthetic Judgments Fixture Suite', () => {
  it('should load all 8 synthetic judgments', () => {
    expect(SYNTHETIC_JUDGMENTS.length).toBe(8);
  });

  it('all judgments should have permanent is_synthetic banner flag', () => {
    for (const doc of SYNTHETIC_JUDGMENTS) {
      expect(doc.is_synthetic).toBe(true);
      expect(doc.jid).toBeTruthy();
      expect(doc.cnr).toBeTruthy();
      expect(doc.court_code).toBeTruthy();
      expect(doc.court_name).toBeTruthy();
    }
  });

  it('each judgment must contain numbered paragraphs and valid sections', () => {
    for (const doc of SYNTHETIC_JUDGMENTS) {
      expect(doc.paragraphs.length).toBeGreaterThan(0);
      expect(doc.sections.length).toBeGreaterThan(0);
      
      // Paragraph indices should be sequential starting from 1
      doc.paragraphs.forEach((p, idx) => {
        expect(p.index).toBe(idx + 1);
        expect(p.text.length).toBeGreaterThan(10);
      });
    }
  });

  it('statute references should have act and section defined', () => {
    const withStatutes = SYNTHETIC_JUDGMENTS.filter(d => d.statutes.length > 0);
    expect(withStatutes.length).toBeGreaterThan(0);

    for (const doc of withStatutes) {
      for (const st of doc.statutes) {
        expect(st.act).toBeTruthy();
        expect(st.section).toBeTruthy();
      }
    }
  });

  it('should cover Madras, Karnataka, Delhi, and Bombay High Courts', () => {
    const courts = new Set(SYNTHETIC_JUDGMENTS.map(d => d.court_code));
    expect(courts.has('33~10')).toBe(true); // Madras
    expect(courts.has('29~3')).toBe(true);  // Karnataka
    expect(courts.has('7~26')).toBe(true);  // Delhi
    expect(courts.has('1~1')).toBe(true);   // Bombay
  });

  it('should accurately filter by court and category', () => {
    const madrasCriminal = SYNTHETIC_JUDGMENTS.filter(
      d => d.court_code === '33~10' && d.category === 'Criminal'
    );
    expect(madrasCriminal.length).toBe(1);
    expect(madrasCriminal[0].case_number).toContain('Crl.O.P.');

    const commercialDocs = SYNTHETIC_JUDGMENTS.filter(d => d.category === 'Commercial');
    expect(commercialDocs.length).toBe(2);
  });

  it('should filter by query matching section or case number', () => {
    const q = '482';
    const matches = SYNTHETIC_JUDGMENTS.filter(d =>
      d.statutes.some(s => s.section.includes(q)) ||
      d.paragraphs.some(p => p.text.includes(q))
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].case_number).toBe('Crl.O.P. No. 10452 of 2023');
  });
});
