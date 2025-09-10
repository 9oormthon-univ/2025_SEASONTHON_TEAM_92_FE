'use client';

import ReportTemplate from '@/components/ReportTemplate';
import { mockReportData } from '@/lib/mockData';

export default function ReportTemplatePage() {
  return <ReportTemplate data={mockReportData} />;
}