'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import JobPostingContent from './job-posting-content';

export default function JobPostingPage() {
  return (
    <DashboardLayout>
      <JobPostingContent />
    </DashboardLayout>
  );
}
