'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  companyId: string;
  companyName?: string;
  role: string;
  permissions?: string[];
  createdAt: string;
}

export function useAuth() {
  const router = useRouter();

  const getUser = (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  const isAuthenticated = (): boolean => {
    return getUser() !== null && getToken() !== null;
  };

  const hasPermission = (permission: string): boolean => {
    const user = getUser();
    if (!user) return false;

    // 超级管理员拥有所有权限
    if (user.role === 'super_admin') return true;

    // 检查用户是否有指定权限
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    const user = getUser();
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  return {
    user: getUser(),
    token: getToken(),
    isAuthenticated,
    logout,
    hasPermission,
    hasRole,
  };
}

// 服务端认证检查工具
export async function checkAuthOnServer(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    const data = JSON.parse(text);
    return data.data || null;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}

// 路由保护Hook
export function useRequireAuth(redirectUrl: string = '/login') {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  return { isAuthenticated, user };
}

// 权限保护Hook
export function useRequirePermission(permission: string) {
  const { hasPermission, logout } = useAuth();

  useEffect(() => {
    if (!hasPermission(permission)) {
      logout();
    }
  }, [hasPermission, permission, logout]);

  return hasPermission(permission);
}

// 角色保护Hook
export function useRequireRole(roles: string | string[]) {
  const { hasRole, logout } = useAuth();

  useEffect(() => {
    if (!hasRole(roles)) {
      logout();
    }
  }, [hasRole, roles, logout]);

  return hasRole(roles);
}
