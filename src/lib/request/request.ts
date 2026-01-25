/**
 * API 请求工具
 */

interface RequestConfig extends RequestInit {
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 超时处理
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

/**
 * 统一请求函数
 */
export async function request<T>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { timeout = 30000, ...fetchConfig } = config;

  try {
    const response = await withTimeout(
      fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        ...fetchConfig,
      }),
      timeout
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * GET 请求
 */
export async function get<T>(
  url: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'GET' });
}

/**
 * POST 请求
 */
export async function post<T>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    ...config,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export async function put<T>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    ...config,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export async function del<T>(
  url: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(url, { ...config, method: 'DELETE' });
}

/**
 * PATCH 请求
 */
export async function patch<T>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    ...config,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * 批量请求
 */
export async function batchRequest<T>(
  requests: Array<{ url: string; config?: RequestConfig }>
): Promise<ApiResponse<any>[]> {
  return Promise.all(requests.map((req) => request<any>(req.url, req.config)));
}
