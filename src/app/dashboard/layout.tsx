'use client';

import DashboardLayout from '@/components/layout/dashboard-layout-optimized';
import ClientOnly from '@/components/providers/client-only';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-gray-50" />}>
      <DashboardLayout>{children}</DashboardLayout>
    </ClientOnly>
  );
}
