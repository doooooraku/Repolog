import type { Report } from '@/src/types/models';
import { buildTimelineSections, matchesQuery } from '@/src/features/reports/reportListUtils';

const makeReport = (id: string, createdAt: string, overrides: Partial<Report> = {}): Report => ({
  id,
  createdAt,
  updatedAt: createdAt,
  reportName: `Report ${id}`,
  weather: 'none',
  locationEnabledAtCreation: false,
  lat: null,
  lng: null,
  latLngCapturedAt: null,
  address: null,
  addressSource: null,
  addressLocale: null,
  comment: '',
  tags: [],
  pinned: false,
  ...overrides,
});

describe('reportListUtils', () => {
  test('matchesQuery checks report name and comment', () => {
    const report = makeReport('1', '2026-01-31T00:00:00.000Z', {
      reportName: 'Main Bridge',
      comment: 'Inspection completed',
    });
    expect(matchesQuery(report, 'bridge')).toBe(true);
    expect(matchesQuery(report, 'completed')).toBe(true);
    expect(matchesQuery(report, 'missing')).toBe(false);
  });

  test('buildTimelineSections groups pinned and date sections', () => {
    const reports = [
      makeReport('1', '2026-01-31T10:00:00.000Z', { pinned: true }),
      makeReport('2', '2026-01-31T08:00:00.000Z'),
      makeReport('3', '2026-01-30T08:00:00.000Z'),
    ];
    const sections = buildTimelineSections(reports, '', 'Pinned');
    expect(sections[0].title).toBe('Pinned');
    expect(sections[0].data).toHaveLength(1);
    expect(sections[1].title).toBe('2026-01-31');
    expect(sections[2].title).toBe('2026-01-30');
  });
});
