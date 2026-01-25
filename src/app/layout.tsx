import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';

// 暂时禁用 Google Fonts，由于网络问题无法加载
// import { Geist, Geist_Mono } from 'next/font/google';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

// 使用系统字体作为临时替代
const geistSans = { variable: '--font-geist-sans' };
const geistMono = { variable: '--font-geist-mono' };

export const metadata: Metadata = {
  title: {
    default: 'PulseOpti HR 脉策聚效 - 赋能企业人效提升的智能HR SaaS平台',
    template: '%s | PulseOpti HR 脉策聚效',
  },
  description:
    'PulseOpti HR脉策聚效是一款赋能中小企业的智能人力资源管理SaaS平台。采用HRBP/COE/SSC三支柱架构，集成AI智能招聘、人才盘点、绩效预测、离职分析等核心功能，助力企业降本增效、控险赋能。',
  keywords: [
    'PulseOpti HR',
    '脉策聚效',
    '人力资源管理',
    'HR SaaS',
    'HRBP',
    '人才管理',
    '智能招聘',
    '人才盘点',
    '绩效管理',
    '薪酬管理',
    '离职管理',
    'AI面试',
    '人效分析',
    '中小企业HR',
  ],
  authors: [{ name: 'PulseOpti HR Team' }],
  generator: 'PulseOpti HR',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PulseOpti HR',
  },
  openGraph: {
    title: 'PulseOpti HR 脉策聚效 - 赋能企业人效提升的智能HR SaaS平台',
    description: '采用HRBP/COE/SSC三支柱架构，集成AI智能招聘、人才盘点、绩效预测等核心功能，助力企业降本增效。价格仅为竞品的3%-20%。',
    url: 'https://pulseopti.com',
    siteName: 'PulseOpti HR 脉策聚效',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                const BROWSER_EXTENSION_ERRORS = [
                  'runtime.lastError',
                  'message channel closed',
                  'async response',
                  'chrome-extension://',
                  'moz-extension://',
                  'webextension',
                ];

                function isBrowserExtensionError(message) {
                  if (!message) return false;
                  const lowerMessage = message.toLowerCase();
                  return BROWSER_EXTENSION_ERRORS.some(keyword =>
                    lowerMessage.includes(keyword.toLowerCase())
                  );
                }

                function isCSPError(message) {
                  if (!message) return false;
                  return message.toLowerCase().includes('content security policy');
                }

                window.addEventListener('error', function(event) {
                  const errorMessage = event.message || '';
                  const errorSource = event.filename || '';

                  if (isBrowserExtensionError(errorMessage) ||
                      isBrowserExtensionError(errorSource)) {
                    console.warn('[忽略浏览器扩展错误]', errorMessage);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }

                  if (errorSource.includes('chrome-extension://') ||
                      errorSource.includes('moz-extension://')) {
                    console.warn('[忽略扩展脚本错误]', errorMessage);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }

                  if (isCSPError(errorMessage)) {
                    console.warn('[CSP警告]', errorMessage);
                    return false;
                  }

                  console.error('[全局错误]', event.error || errorMessage);
                  return true;
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  const errorMessage = event.reason?.message || String(event.reason);

                  if (isBrowserExtensionError(errorMessage)) {
                    console.warn('[忽略浏览器扩展 Promise 错误]', errorMessage);
                    event.preventDefault();
                    return;
                  }

                  console.error('[未捕获的 Promise 错误]', event.reason);
                }, true);

                if (window.SecurityPolicyViolationEvent) {
                  document.addEventListener('securitypolicyviolation', function(event) {
                    console.warn('[CSP 违规]', {
                      violatedDirective: event.violatedDirective,
                      blockedURI: event.blockedURI,
                      documentURI: event.documentURI,
                    });
                  });
                }

                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && isBrowserExtensionError(message)) {
                    console.warn('[浏览器扩展警告]', ...args);
                    return;
                  }
                  originalError.apply(console, args);
                };

                console.log('✅ 全局错误处理器已初始化');
              })();
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
