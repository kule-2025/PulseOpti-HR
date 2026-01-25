'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import CourseManagementContent from './course-management-content';

export default function CourseManagementPage() {
  return (
    <DashboardLayout>
      <CourseManagementContent />
    </DashboardLayout>
  );
}
