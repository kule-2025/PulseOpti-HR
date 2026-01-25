import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 定义环境变量类型
const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.aizhixuan.com.cn';
const USER_DOMAIN = process.env.NEXT_PUBLIC_USER_DOMAIN || 'www.aizhixuan.com.cn';

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  // 去除端口号（本地开发环境）
  const cleanHostname = hostname.split(':')[0];

  // 开发环境才输出日志
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Hostname:', cleanHostname);
    console.log('Middleware - Path:', request.nextUrl.pathname);
    console.log('Middleware - Admin Domain:', ADMIN_DOMAIN);
    console.log('Middleware - User Domain:', USER_DOMAIN);
  }

  // 检查是否是超管端域名
  if (cleanHostname === ADMIN_DOMAIN) {
    // API 路由不重定向
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // 如果访问的是根路径，重定向到 /admin
    if (request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // 如果访问的是 /login，重定向到 /admin/login
    if (request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // 如果访问的是 /register，重定向到 /admin/login（超管端不支持注册）
    if (request.nextUrl.pathname === '/register') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // 检查是否已经在 /admin 路径下
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${request.nextUrl.pathname}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // 检查是否是用户端域名
  if (cleanHostname === USER_DOMAIN || cleanHostname === 'aizhixuan.com.cn') {
    // 如果尝试访问 /admin 路径，重定向到用户端登录页
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // 本地开发环境：检查路径前缀
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
    return NextResponse.next();
  }

  // 其他情况：默认返回用户端
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public folder (公共文件)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
