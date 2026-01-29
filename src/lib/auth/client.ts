import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

/**
 * 客户端权限验证 Hook
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // 检查本地存储中的用户信息和 token
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
        });
      } catch (error) {
        // 解析失败，清除无效数据
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        });
      }
    } else {
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      });
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({
      isAuthenticated: true,
      user,
      token,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
  };

  return {
    ...state,
    login,
    logout,
  };
}
