import { buildAppendImportPlan } from '@/src/features/backup/backupImportPlanner';

describe('backupImportPlanner', () => {
  test('buildAppendImportPlan appends only missing records and skips duplicates', () => {
    const plan = buildAppendImportPlan({
      reports: [{ id: 'r1' }, { id: 'r2' }, { id: 'r2' }],
      photos: [
        { id: 'p1', reportId: 'r1' },
        { id: 'p2', reportId: 'r2' },
        { id: 'p2', reportId: 'r2' },
      ],
      existingReportIds: new Set(['r1']),
      existingPhotoIds: new Set(['p1']),
    });

    expect(plan.reportsToInsert.map((report) => report.id)).toEqual(['r2']);
    expect(plan.photosToInsert.map((photo) => photo.id)).toEqual(['p2']);
    expect(plan.skippedReports).toBe(2);
    expect(plan.skippedPhotos).toBe(2);
    expect(plan.invalidPhotoRefs).toEqual([]);
  });

  test('buildAppendImportPlan detects invalid photo references', () => {
    const plan = buildAppendImportPlan({
      reports: [{ id: 'r1' }],
      photos: [{ id: 'p1', reportId: 'r-missing' }],
      existingReportIds: new Set<string>(),
      existingPhotoIds: new Set<string>(),
    });

    expect(plan.reportsToInsert.map((report) => report.id)).toEqual(['r1']);
    expect(plan.photosToInsert).toEqual([]);
    expect(plan.invalidPhotoRefs.map((photo) => photo.id)).toEqual(['p1']);
  });

  test('buildAppendImportPlan is idempotent for repeated imports', () => {
    const first = buildAppendImportPlan({
      reports: [{ id: 'r1' }],
      photos: [{ id: 'p1', reportId: 'r1' }],
      existingReportIds: new Set<string>(),
      existingPhotoIds: new Set<string>(),
    });
    const second = buildAppendImportPlan({
      reports: [{ id: 'r1' }],
      photos: [{ id: 'p1', reportId: 'r1' }],
      existingReportIds: new Set(['r1']),
      existingPhotoIds: new Set(['p1']),
    });

    expect(first.reportsToInsert).toHaveLength(1);
    expect(first.photosToInsert).toHaveLength(1);
    expect(second.reportsToInsert).toHaveLength(0);
    expect(second.photosToInsert).toHaveLength(0);
    expect(second.skippedReports).toBe(1);
    expect(second.skippedPhotos).toBe(1);
  });
});
