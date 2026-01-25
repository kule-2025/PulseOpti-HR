import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    // 启用图片优化以提升性能
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf3-static.bytednsdoc.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    // 优化设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 图片加载优化
    loader: 'default',
  },

  // 性能优化
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true, // 启用StrictMode确保React 19正确渲染

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@radix-ui/react-icons', 'recharts'],
    optimizeCss: true,
  },

  // 生产环境优化
  productionBrowserSourceMaps: false,
  // 启用静态生成优化
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // 输出优化 - 使用 standalone 减少构建输出
  output: 'standalone',

  // 编译优化
  compiler: {
    // 生产环境移除 console
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 按需渲染缓存优化 - 禁用以减少 hydration 问题
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 增加到 60 秒
    pagesBufferLength: 2, // 只缓存 2 个页面
  },

  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 优化包大小
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // 生产环境优化 - 简化代码分割策略以减少加载错误
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // vendor 分割
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              minSize: 0,
              reuseExistingChunk: true,
            },
            // 公共模块分割
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              minSize: 0,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://pulseopti-hr.vercel.app',
  },

  // Turbopack配置
  turbopack: {},

  // HTTP Headers 配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' data: blob:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: https://*.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' blob: data:",
              "img-src 'self' data: blob: https://lf3-static.bytednsdoc.com https://*.vercel.app https://*.cloudflareinsights.com",
              "font-src 'self' data: blob:",
              "connect-src 'self' blob: data: https://*.vercel.app https://www.aizhixuan.com.cn https://*.cloudflareinsights.com",
              "frame-src 'self' blob:",
              "worker-src 'self' blob: data:",
              "child-src 'self' blob: data:",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;
