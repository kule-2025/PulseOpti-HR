/**
 * API 客户端封装
 * 统一处理 API 调用、错误处理、加载状态等
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 获取认证 token
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.token || null;
    } catch {
      return null;
    }
  }

  /**
   * 构建请求头
   */
  private buildHeaders(headers?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken();
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let error: ApiError = {
        message: '请求失败',
        status: response.status,
      };

      if (contentType?.includes('application/json')) {
        try {
          const data = await response.json();
          error = {
            message: data.error || data.message || '请求失败',
            code: data.code,
            status: response.status,
          };
        } catch {
          error.message = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      throw error;
    }

    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return {
      success: true,
      data: (await response.text()) as unknown as T,
    };
  }

  /**
   * 构建 URL
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  /**
   * GET 请求
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * POST 请求
   */
  async post<T>(path: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await fetch(path, {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PUT 请求
   */
  async put<T>(path: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await fetch(path, {
      method: 'PUT',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * PATCH 请求
   */
  async patch<T>(path: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * DELETE 请求
   */
  async delete<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * 上传文件
   */
  async upload<T>(
    path: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (onProgress && e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve({
              success: true,
              data: xhr.responseText as unknown as T,
            });
          }
        } else {
          const error: ApiError = {
            message: xhr.statusText || '上传失败',
            status: xhr.status,
          };
          reject(error);
        }
      });

      xhr.addEventListener('error', () => {
        const error: ApiError = {
          message: '网络错误',
        };
        reject(error);
      });

      xhr.open('POST', path);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  /**
   * 下载文件
   */
  async download(
    path: string,
    filename: string,
    params?: Record<string, any>
  ): Promise<void> {
    const url = this.buildUrl(path, params);
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: '下载失败',
        status: response.status,
      };
      throw error;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

/**
 * 常用 API 方法快捷调用
 */
export const api = {
  get: <T>(path: string, params?: Record<string, any>) => apiClient.get<T>(path, params),
  post: <T>(path: string, data?: any) => apiClient.post<T>(path, data),
  put: <T>(path: string, data?: any) => apiClient.put<T>(path, data),
  patch: <T>(path: string, data?: any) => apiClient.patch<T>(path, data),
  delete: <T>(path: string, params?: Record<string, any>) => apiClient.delete<T>(path, params),
  upload: <T>(path: string, formData: FormData, onProgress?: (p: number) => void) =>
    apiClient.upload<T>(path, formData, onProgress),
  download: (path: string, filename: string, params?: Record<string, any>) =>
    apiClient.download(path, filename, params),
};

/**
 * React Hook 用于 API 调用
 */
export function useApi<T>(
  path: string,
  params?: Record<string, any>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (newParams?: Record<string, any>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<T>(path, newParams || params);

        if (response.success && response.data) {
          if (mountedRef.current) {
            setData(response.data);
            options?.onSuccess?.(response.data);
          }
          return response.data;
        } else {
          throw new Error(response.error || '请求失败');
        }
      } catch (err) {
        const apiError = err as ApiError;
        if (mountedRef.current) {
          setError(apiError);
          options?.onError?.(apiError);
        }
        throw apiError;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [path, params, options]
  );

  useEffect(() => {
    mountedRef.current = true;

    if (options?.immediate !== false) {
      execute();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [execute, options?.immediate]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const mutate = useCallback(
    (newData: T) => {
      setData(newData);
    },
    []
  );

  return { data, loading, error, execute, refetch, mutate };
}
