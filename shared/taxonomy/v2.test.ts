import { describe, it, expect } from 'vitest';
import { LEGAL_DOMAINS_V2, UNCLASSIFIED_DOMAIN, getDomainById, getAllSubjects } from './v2';

describe('Legal Category Taxonomy v2.0', () => {
  it('defines exactly 13 primary legal domains', () => {
    expect(LEGAL_DOMAINS_V2).toHaveLength(13);
  });

  it('includes newly specified v1.3.0 categories (Cyber, Environmental, Education)', () => {
    const cyber = getDomainById('domain_cyber_technology');
    expect(cyber).toBeDefined();
    expect(cyber?.label).toBe('Cyber and Technology Law');
    expect(cyber?.subjects.map(s => s.label)).toContain('Banking Account Freeze');

    const env = getDomainById('domain_environmental_infrastructure');
    expect(env).toBeDefined();
    expect(env?.label).toBe('Environmental and Infrastructure Law');

    const edu = getDomainById('domain_education_social_welfare');
    expect(edu).toBeDefined();
    expect(edu?.label).toBe('Education and Social Welfare Law');
  });

  it('provides safe unclassified domain definition without hallucinated labels', () => {
    expect(UNCLASSIFIED_DOMAIN.code).toBe('UNKNOWN');
    expect(UNCLASSIFIED_DOMAIN.label).toBe('Unknown / Unclassified');
  });

  it('ensures all subjects across 13 domains have non-empty search keywords', () => {
    const subjects = getAllSubjects();
    expect(subjects.length).toBeGreaterThan(50);
    for (const subj of subjects) {
      expect(subj.keywords.length).toBeGreaterThan(0);
    }
  });
});
