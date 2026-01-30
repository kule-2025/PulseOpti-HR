import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
