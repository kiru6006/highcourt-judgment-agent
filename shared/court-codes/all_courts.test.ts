import { describe, it, expect } from 'vitest';
import { ALL_25_HIGH_COURTS, getHighCourtByCode, getBenchesForCourt } from './all_courts';

describe('ALL_25_HIGH_COURTS Canonical Registry', () => {
  it('contains exactly 25 official Indian High Courts', () => {
    expect(ALL_25_HIGH_COURTS).toHaveLength(25);
  });

  it('maps Madras High Court with Principal Seat and Madurai Bench', () => {
    const madras = getHighCourtByCode('33_10');
    expect(madras).toBeDefined();
    expect(madras?.court_name).toBe('Madras High Court');
    expect(madras?.benches).toHaveLength(2);
    expect(madras?.benches.map(b => b.bench_name)).toContain('Madurai Bench');
  });

  it('maps Bombay High Court with all three permanent benches', () => {
    const bombay = getHighCourtByCode('1_1');
    expect(bombay).toBeDefined();
    expect(bombay?.benches.map(b => b.bench_name)).toEqual(
      expect.arrayContaining([
        'Principal Seat at Mumbai',
        'Nagpur Bench',
        'Aurangabad Bench (Chhatrapati Sambhajinagar)',
        'Panaji Bench (Goa)'
      ])
    );
  });

  it('maps Calcutta High Court circuit benches at Port Blair and Jalpaiguri', () => {
    const calcutta = getHighCourtByCode('19_16');
    expect(calcutta).toBeDefined();
    const benchNames = calcutta?.benches.map(b => b.bench_name);
    expect(benchNames).toContain('Circuit Bench at Port Blair');
    expect(benchNames).toContain('Circuit Bench at Jalpaiguri');
  });

  it('supports lookup with tilde or underscore separator', () => {
    expect(getHighCourtByCode('33~10')?.court_id).toBe('madras');
    expect(getHighCourtByCode('33_10')?.court_id).toBe('madras');
  });

  it('returns benches dynamically for any court', () => {
    const benches = getBenchesForCourt('29_3'); // Karnataka
    expect(benches.length).toBeGreaterThanOrEqual(3);
    expect(benches.map(b => b.city)).toContain('Dharwad');
  });

  it('validates official judgment portal URLs for all 25 courts', () => {
    for (const court of ALL_25_HIGH_COURTS) {
      expect(court.official_judgment_portal).toMatch(/^https?:\/\//);
      expect(court.available_years).toContain(2026);
    }
  });
});
