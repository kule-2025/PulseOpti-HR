'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import JobHierarchyContent from './job-hierarchy-content';

export default function JobHierarchyPage() {
  return (
    <DashboardLayout>
      <JobHierarchyContent />
    </DashboardLayout>
  );
}
