'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import AIPredictionContent from './ai-prediction-content';

export default function AIPredictionPage() {
  return (
    <DashboardLayout>
      <AIPredictionContent />
    </DashboardLayout>
  );
}
