type ReportRecord = {
  id: string;
};

type PhotoRecord = {
  id: string;
  reportId: string;
};

export type AppendImportPlan<TReport extends ReportRecord, TPhoto extends PhotoRecord> = {
  reportsToInsert: TReport[];
  photosToInsert: TPhoto[];
  skippedReports: number;
  skippedPhotos: number;
  invalidPhotoRefs: TPhoto[];
};

export function buildAppendImportPlan<TReport extends ReportRecord, TPhoto extends PhotoRecord>({
  reports,
  photos,
  existingReportIds,
  existingPhotoIds,
}: {
  reports: TReport[];
  photos: TPhoto[];
  existingReportIds: ReadonlySet<string>;
  existingPhotoIds: ReadonlySet<string>;
}): AppendImportPlan<TReport, TPhoto> {
  const knownReportIds = new Set(existingReportIds);
  const knownPhotoIds = new Set(existingPhotoIds);
  const reportsToInsert: TReport[] = [];
  const photosToInsert: TPhoto[] = [];
  const invalidPhotoRefs: TPhoto[] = [];
  let skippedReports = 0;
  let skippedPhotos = 0;

  for (const report of reports) {
    if (knownReportIds.has(report.id)) {
      skippedReports += 1;
      continue;
    }
    knownReportIds.add(report.id);
    reportsToInsert.push(report);
  }

  for (const photo of photos) {
    if (!knownReportIds.has(photo.reportId)) {
      invalidPhotoRefs.push(photo);
      continue;
    }
    if (knownPhotoIds.has(photo.id)) {
      skippedPhotos += 1;
      continue;
    }
    knownPhotoIds.add(photo.id);
    photosToInsert.push(photo);
  }

  return {
    reportsToInsert,
    photosToInsert,
    skippedReports,
    skippedPhotos,
    invalidPhotoRefs,
  };
}
