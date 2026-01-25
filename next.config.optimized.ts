import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],

  // 图片优化配置 - 启用优化以提升性能
  images: {
    unoptimized: false, // 启用图片优化
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
  reactStrictMode: false,

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
    optimizeCss: true,
  },

  // 生产环境优化
  productionBrowserSourceMaps: false,
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

  // 按需渲染缓存优化
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 秒后清除缓存
    pagesBufferLength: 2, // 只缓存 2 个页面
  },

  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 优化包大小
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // 生产环境优化
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
            },
            // 公共模块分割
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
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
};

export default nextConfig;
