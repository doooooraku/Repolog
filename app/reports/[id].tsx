import { useLocalSearchParams } from 'expo-router';

import ReportEditorScreen from '@/src/features/reports/ReportEditorScreen';

export default function ReportEditorByIdScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const reportId = Array.isArray(id) ? id[0] : id;
  return <ReportEditorScreen reportId={reportId ?? null} />;
}
