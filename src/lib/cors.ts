import { NextResponse } from 'next/server';

/**
 * CORS配置
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * 添加CORS头到NextResponse
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * 创建带CORS头的NextResponse
 */
export function corsResponse(data: any, options?: { status?: number }): NextResponse {
  const status = options?.status || 200;
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

/**
 * 处理OPTIONS预检请求
 */
export function handleCorsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
