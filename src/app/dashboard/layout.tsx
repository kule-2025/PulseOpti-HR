'use client';

import DashboardLayout from '@/components/layout/dashboard-layout-optimized';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
