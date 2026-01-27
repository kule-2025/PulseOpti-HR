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

/**
 * 虚拟滚动组件 - 高性能渲染长列表
 */
export function VirtualScroll<T>({
  items,
  renderItem,
  itemHeight,
  height,
  overscan = 5,
  className = '',
  style,
}: VirtualScrollProps<T>) {
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

  const totalHeight = itemPositions[itemPositions.length - 1] || 0;

  // 找到第一个可见项
  const startIndex = itemPositions.findIndex((pos, idx) => {
    const nextPos = itemPositions[idx + 1] || totalHeight;
    return pos <= scrollTop + overscan * estimateItemHeight(idx) && nextPos > scrollTop;
  });

  // 计算可见项的结束索引
  const endIndex = itemPositions.findIndex(
    (pos, idx) => pos > scrollTop + height + overscan * estimateItemHeight(idx)
  );

  const visibleStartIndex = Math.max(0, startIndex);
  const visibleEndIndex = Math.min(items.length - 1, endIndex === -1 ? items.length - 1 : endIndex - 1);

  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);
  const offsetY = itemPositions[visibleStartIndex] || 0;

  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-auto ${className}`}
      style={{ height, ...style }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
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
            renderItem(item, visibleStartIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}
