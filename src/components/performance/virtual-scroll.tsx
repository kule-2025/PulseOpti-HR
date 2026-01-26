'use client';

import { useRef, useEffect, useState, useCallback, ReactNode, CSSProperties } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  height: number;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
}

interface VirtualScrollPropsWithIndex<T> {
  items: T[];
  renderItem: (props: { index: number; style: CSSProperties; item: T }) => ReactNode;
  itemHeight: number;
  height: number;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
  useIndexStyle?: boolean;
}

/**
 * 虚拟滚动组件 - 高性能渲染长列表
 */
export function VirtualScroll<T extends any>({
  items,
  renderItem,
  itemHeight,
  height,
  overscan = 5,
  className = '',
  style,
  useIndexStyle = false,
}: VirtualScrollProps<T> | VirtualScrollPropsWithIndex<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 计算可见的索引范围
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );

  // 计算偏移量
  const offsetY = startIndex * itemHeight;

  // 可见项目
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-auto ${className}`}
      style={{ height, ...style }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

interface DynamicVirtualScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateItemHeight: (index: number) => number;
  height: number;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * 动态高度的虚拟滚动
 */
export function DynamicVirtualScroll<T>({
  items,
  renderItem,
  estimateItemHeight,
  height,
  overscan = 5,
  className = '',
  style,
}: DynamicVirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemPositions, setItemPositions] = useState<number[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 计算所有项目的位置
  useEffect(() => {
    const positions: number[] = [];
    let currentPosition = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push(currentPosition);
      currentPosition += estimateItemHeight(i);
    }

    setItemPositions(positions);
  }, [items, estimateItemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 查找起始索引
  const startIndex = useCallback(() => {
    let low = 0;
    let high = items.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const position = itemPositions[mid] || 0;

      if (position < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.max(0, Math.max(0, high - overscan));
  }, [scrollTop, itemPositions, items.length, overscan]);

  const totalHeight = itemPositions[itemPositions.length - 1] || 0;
  const start = startIndex();
  let end = start + overscan;

  // 查找结束索引
  for (let i = start; i < items.length; i++) {
    if (itemPositions[i] > scrollTop + height) {
      end = Math.min(i + overscan, items.length - 1);
      break;
    }
  }

  const visibleItems = items.slice(start, end + 1);
  const offsetY = itemPositions[start] || 0;

  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-auto ${className}`}
      style={{ height, ...style }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = start + index;
          const position = itemPositions[actualIndex] || 0;
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: position,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
