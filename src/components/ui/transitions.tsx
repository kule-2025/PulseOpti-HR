'use client';

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type TransitionType = 'fade' | 'slide' | 'scale' | 'flip' | 'none';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  className?: string;
}

export function PageTransition({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const transitions: Record<TransitionType, string> = {
    none: '',
    fade: 'opacity-0',
    slide: 'opacity-0 translate-x-4',
    scale: 'opacity-0 scale-95',
    flip: 'opacity-0 rotate-y-180',
  };

  const transitionsActive: Record<TransitionType, string> = {
    none: '',
    fade: 'opacity-100',
    slide: 'opacity-100 translate-x-0',
    scale: 'opacity-100 scale-100',
    flip: 'opacity-100 rotate-y-0',
  };

  return (
    <div
      className={cn(
        'transition-all ease-out',
        transitions[type],
        isVisible && transitionsActive[type],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredChildrenProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  transitionType?: TransitionType;
  transitionDuration?: number;
}

export function StaggeredChildren({
  children,
  staggerDelay = 50,
  className,
  transitionType = 'fade',
  transitionDuration = 300,
}: StaggeredChildrenProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          key={index}
          type={transitionType}
          duration={transitionDuration}
          delay={index * staggerDelay}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 300,
  direction = 'up',
  distance = 10,
  className,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directions: Record<FadeInProps['direction'], string> = {
    up: 'translate-y',
    down: 'translate-y',
    left: '-translate-x',
    right: 'translate-x',
  };

  const transform = isVisible
    ? 'opacity-100 translate-0'
    : `opacity-0 ${directions[direction]}-${distance}`;

  return (
    <div
      className={cn(
        'transition-all ease-out',
        transform,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({
  children,
  direction = 'right',
  delay = 0,
  duration = 300,
  className,
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const transforms: Record<SlideInProps['direction'], string> = {
    left: '-translate-x-full',
    right: 'translate-x-full',
    up: '-translate-y-full',
    down: 'translate-y-full',
  };

  const transform = isVisible ? 'translate-0' : transforms[direction];

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        transform,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  to?: number;
  className?: string;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  from = 0.95,
  to = 1,
  className,
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const scale = isVisible ? to : from;

  return (
    <div
      className={cn('transition-transform ease-out', className)}
      style={{
        transform: `scale(${scale})`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface RotateInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  to?: number;
  axis?: 'x' | 'y' | 'z';
  className?: string;
}

export function RotateIn({
  children,
  delay = 0,
  duration = 300,
  from = -15,
  to = 0,
  axis = 'z',
  className,
}: RotateInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const rotate = isVisible ? to : from;

  return (
    <div
      className={cn('transition-transform ease-out', className)}
      style={{
        transform: `rotate${axis}(${rotate}deg)`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface BounceInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function BounceIn({
  children,
  delay = 0,
  duration = 500,
  className,
}: BounceInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface PulseInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function PulseIn({
  children,
  delay = 0,
  duration = 600,
  className,
}: PulseInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-in-out',
        isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-50',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface ShimmerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Shimmer({
  children,
  className,
  speed = 2,
}: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent animate-shimmer"
        style={{
          animationDuration: `${speed}s`,
        }}
      />
      {children}
    </div>
  );
}

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
  height?: string;
}

export function SkeletonLoader({
  count = 3,
  className,
  height = 'h-20',
}: SkeletonLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gray-200 dark:bg-gray-800 rounded animate-pulse',
            height,
            className
          )}
        />
      ))}
    </div>
  );
}

// 列表项动画
interface ListItemAnimationProps {
  children: ReactNode;
  index: number;
  className?: string;
  type?: 'slide' | 'fade' | 'scale';
}

export function ListItemAnimation({
  children,
  index,
  className,
  type = 'slide',
}: ListItemAnimationProps) {
  const delay = index * 50;

  if (type === 'fade') {
    return (
      <FadeIn delay={delay} className={className}>
        {children}
      </FadeIn>
    );
  }

  if (type === 'scale') {
    return (
      <ScaleIn delay={delay} className={className}>
        {children}
      </ScaleIn>
    );
  }

  return (
    <SlideIn delay={delay} className={className}>
      {children}
    </SlideIn>
  );
}

// 卡片悬停动画
interface HoverCardProps {
  children: ReactNode;
  className?: string;
  liftAmount?: number;
}

export function HoverCard({
  children,
  className,
  liftAmount = 4,
}: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out cursor-pointer',
        isHovered && `hover:-translate-y-${liftAmount}`,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

// 按钮点击反馈动画
interface ButtonPressProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ButtonPress({
  children,
  className,
  onClick,
}: ButtonPressProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={cn(
        'transition-transform duration-75 active:scale-95',
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 进场动画容器
interface EntranceAnimationProps {
  children: ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  className?: string;
}

export function EntranceAnimation({
  children,
  type = 'fade',
  delay = 0,
  duration = 300,
  className,
}: EntranceAnimationProps) {
  switch (type) {
    case 'slide':
      return (
        <SlideIn delay={delay} duration={duration} className={className}>
          {children}
        </SlideIn>
      );
    case 'scale':
      return (
        <ScaleIn delay={delay} duration={duration} className={className}>
          {children}
        </ScaleIn>
      );
    case 'bounce':
      return (
        <BounceIn delay={delay} duration={duration} className={className}>
          {children}
        </BounceIn>
      );
    default:
      return (
        <FadeIn delay={delay} duration={duration} className={className}>
          {children}
        </FadeIn>
      );
  }
}
