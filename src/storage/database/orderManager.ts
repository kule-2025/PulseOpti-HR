import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, insertOrderSchema } from "./shared/schema";
import type { Order, InsertOrder } from "./shared/schema";

export class OrderManager {
  async createOrder(data: InsertOrder): Promise<Order> {
    const db = await getDb();
    const validated = insertOrderSchema.parse(data);
    const [order] = await db.insert(orders).values(validated).returning();
    return order;
  }

  async getOrders(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Order, 'id' | 'companyId' | 'userId' | 'orderNo' | 'status' | 'tier'>>;
  } = {}): Promise<Order[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(orders.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(orders.companyId, filters.companyId));
    }
    if (filters.userId !== undefined) {
      conditions.push(eq(orders.userId, filters.userId));
    }
    if (filters.orderNo !== undefined) {
      conditions.push(eq(orders.orderNo, filters.orderNo));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(orders.status, filters.status));
    }
    if (filters.tier !== undefined) {
      conditions.push(eq(orders.tier, filters.tier));
    }

    const query = db.select().from(orders);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.orderBy(desc(orders.createdAt)).limit(limit).offset(skip);
  }

  async getOrderById(id: string): Promise<Order | null> {
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || null;
  }

  async getOrderByOrderNo(orderNo: string): Promise<Order | null> {
    const db = await getDb();
    const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo));
    return order || null;
  }

  async getCompanyOrders(companyId: string): Promise<Order[]> {
    const db = await getDb();
    return db
      .select()
      .from(orders)
      .where(eq(orders.companyId, companyId))
      .orderBy(desc(orders.createdAt));
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const db = await getDb();
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | null> {
    const db = await getDb();
    const [order] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || null;
  }

  async markOrderPaid(id: string, paymentMethod: string, transactionId: string): Promise<Order | null> {
    const db = await getDb();
    const [order] = await db
      .update(orders)
      .set({
        status: 'paid',
        paymentMethod,
        transactionId,
        paymentTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return order || null;
  }

  async cancelOrder(id: string): Promise<Order | null> {
    const db = await getDb();
    const [order] = await db
      .update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || null;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 生成订单号
  generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${timestamp}${random}`;
  }
}

export const orderManager = new OrderManager();
