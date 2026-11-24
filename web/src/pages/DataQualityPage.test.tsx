import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DataQualityPage } from './DataQualityPage';
import anomalySummary from '../../../data/anomaly-summary.json';

describe('DataQualityPage (M7)', () => {
  it('renders dashboard with totals matching source anomaly artifact', () => {
    const html = renderToString(
      <MemoryRouter>
        <DataQualityPage />
      </MemoryRouter>
    );

    // Header & title
    expect(html).toContain('Data Quality &amp; Anomaly Intelligence');

    // Totals match artifact exactly
    expect(html).toContain(String(anomalySummary.totalDocumentsScanned));
    expect(html).toContain(String(anomalySummary.totalAnomaliesDetected));
    expect(html).toContain(String(anomalySummary.severityCounts.high));
    expect(html).toContain(String(anomalySummary.statusCounts.pending));

    // Link to source artifact
    expect(html).toContain('Source Artifact');
    expect(html).toContain('anomaly-summary.json');
  });

  it('renders all four active audit rule descriptions (A01, A02, A04, A05)', () => {
    const html = renderToString(
      <MemoryRouter>
        <DataQualityPage />
      </MemoryRouter>
    );

    expect(html).toContain('A01: Source Provenance');
    expect(html).toContain('A02: Case Identity');
    expect(html).toContain('A04: Document Quality');
    expect(html).toContain('A05: Classification Match');
  });

  it('provides accessible table with role, scope headers, and export buttons', () => {
    const html = renderToString(
      <MemoryRouter>
        <DataQualityPage />
      </MemoryRouter>
    );

    // Accessible table markup
    expect(html).toContain('role="region"');
    expect(html).toContain('scope="col"');
    expect(html).toContain('Rule ID');
    expect(html).toContain('Severity');
    expect(html).toContain('Document ID');
    expect(html).toContain('Evidence');
    expect(html).toContain('Remediation');

    // Export buttons
    expect(html).toContain('JSON');
    expect(html).toContain('CSV');
  });
});
