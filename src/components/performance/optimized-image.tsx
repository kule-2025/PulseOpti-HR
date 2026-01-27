/**
 * 响应式图片组件 - 根据设备选择合适的图片尺寸
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = [
    { media: '(max-width: 640px)', width: 640 },
    { media: '(max-width: 1024px)', width: 1024 },
    { width: 1920 },
  ],
  className = '',
  ...props
}: LazyImageProps & {
  sizes?: Array<{ media?: string; width: number }>;
}) {
  // 使用第一个尺寸的图片（简化版本）
  const primarySize = sizes[0]?.width || 1920;

  return (
    <LazyImage
      src={`${src}?w=${primarySize}`}
      alt={alt}
      className={className}
      {...props}
    />
  );
}
