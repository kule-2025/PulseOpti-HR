import Link from 'next/link';
import { Activity, TrendingUp, Zap } from 'lucide-react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
}

export function Logo({
  variant = 'full',
  size = 'md',
  href = '/',
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: { container: 'h-8', icon: 'w-6 h-6', text: 'text-lg', badge: 'text-xs' },
    md: { container: 'h-10', icon: 'w-8 h-8', text: 'text-xl', badge: 'text-xs' },
    lg: { container: 'h-12', icon: 'w-10 h-10', text: 'text-2xl', badge: 'text-sm' },
    xl: { container: 'h-14', icon: 'w-12 h-12', text: 'text-3xl', badge: 'text-sm' },
  };

  const currentSize = sizeClasses[size];

  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Pulse + Trend + Optimization */}
      <div
        className={`relative flex items-center justify-center rounded-xl ${currentSize.container} bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300`}
      >
        {/* 脉搏波形背景 */}
        <Activity className={`${currentSize.icon} text-white`} strokeWidth={2.5} />
        {/* 趋势箭头叠加 */}
        <TrendingUp className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-yellow-400 drop-shadow-md" />
      </div>

      {/* Logo Text */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className={`font-bold ${currentSize.text} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight`}>
            {variant === 'compact' ? 'PulseOpti' : 'PulseOpti HR'}
          </div>
          <div className={`font-semibold text-gray-600 ${currentSize.badge} leading-none tracking-wide`}>
            脉策聚效
          </div>
        </div>
      )}

      {/* Efficiency Badge */}
      {variant === 'full' && (
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full">
          <Zap className="w-3 h-3 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">智能驱动</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}

// 横向Logo（用于页脚等）
export function LogoHorizontal({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-lg">
        <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
        <TrendingUp className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-yellow-400 drop-shadow-md" />
      </div>
      <div className="flex flex-col">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          PulseOpti HR
        </div>
        <div className="text-xs font-semibold text-gray-600 leading-none tracking-wide">
          脉策聚效 · 智能驱动
        </div>
      </div>
    </div>
  );
}

// 纯图标Logo（用于Favicon、小尺寸场景）
export function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl`}>
      <Activity className="text-white" strokeWidth={2.5} />
      <TrendingUp className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-yellow-400 drop-shadow-md" />
    </div>
  );
}
