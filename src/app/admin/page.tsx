'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    const user = localStorage.getItem('user');
    const isSuperAdmin = localStorage.getItem('isSuperAdmin');

    if (user && isSuperAdmin === 'true') {
      // 已登录，跳转到仪表盘
      router.push('/admin/dashboard');
    } else {
      // 未登录，跳转到登录页
      router.push('/admin/login');
    }
  }, [router]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
        <p className="mt-4 text-white">加载中...</p>
      </div>
    </div>
  );
}
