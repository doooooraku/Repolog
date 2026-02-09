import type { Report } from '@/src/types/models';
import {
  buildTimelineSections,
  matchesQuery,
  matchesReportFilters,
} from '@/src/features/reports/reportListUtils';

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
  test('matchesQuery checks report name, comment, and tags', () => {
    const report = makeReport('1', '2026-01-31T00:00:00.000Z', {
      reportName: 'Main Bridge',
      comment: 'Inspection completed',
      tags: ['urgent', 'bridge'],
    });
    expect(matchesQuery(report, 'bridge')).toBe(true);
    expect(matchesQuery(report, 'completed')).toBe(true);
    expect(matchesQuery(report, 'urgent')).toBe(true);
    expect(matchesQuery(report, 'missing')).toBe(false);
  });

  test('matchesReportFilters combines query/date/tag/pinned filters', () => {
    const report = makeReport('2', '2026-01-30T08:00:00.000Z', {
      reportName: 'Roof Check',
      comment: 'Need urgent follow-up',
      tags: ['roof', 'urgent'],
      pinned: true,
    });

    expect(
      matchesReportFilters(report, {
        query: 'urgent',
        fromDate: '2026-01-01',
        toDate: '2026-01-31',
        tags: ['roof', 'urgent'],
        pinnedOnly: true,
      }),
    ).toBe(true);

    expect(matchesReportFilters(report, { tags: ['missing'] })).toBe(false);
    expect(matchesReportFilters(report, { fromDate: '2026-02-01' })).toBe(false);
    expect(matchesReportFilters(report, { pinnedOnly: true, query: 'bridge' })).toBe(false);
  });

  test('matchesReportFilters handles reports with no tags', () => {
    const report = makeReport('3', '2026-01-29T08:00:00.000Z', { tags: [] });
    expect(matchesReportFilters(report, { query: '' })).toBe(true);
    expect(matchesReportFilters(report, { tags: ['urgent'] })).toBe(false);
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
