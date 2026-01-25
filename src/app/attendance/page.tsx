'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import AttendanceContent from './attendance-content';

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <AttendanceContent />
    </DashboardLayout>
  );
}
