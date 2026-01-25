// 生成订单号
export function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
}

// 格式化订单号显示
export function formatOrderId(orderId: string): string {
  // ORD1734567890ABC123 -> ORD 1734567890 ABC123
  if (orderId.startsWith('ORD') && orderId.length > 15) {
    return `${orderId.substring(0, 3)} ${orderId.substring(3, 13)} ${orderId.substring(13)}`;
  }
  return orderId;
}
