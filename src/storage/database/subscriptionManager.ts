import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscriptions, insertSubscriptionSchema } from "./shared/schema";
import type { Subscription, InsertSubscription } from "./shared/schema";

export class SubscriptionManager {
  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const db = await getDb();
    const validated = insertSubscriptionSchema.parse(data);
    const [subscription] = await db.insert(subscriptions).values(validated).returning();
    return subscription;
  }

  async getSubscriptions(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Subscription, 'id' | 'companyId' | 'tier' | 'status'>>;
  } = {}): Promise<Subscription[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(subscriptions.id, filters.id));
    }
    if (filters.companyId !== undefined) {
      conditions.push(eq(subscriptions.companyId, filters.companyId));
    }
    if (filters.tier !== undefined) {
      conditions.push(eq(subscriptions.tier, filters.tier));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(subscriptions.status, filters.status));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(subscriptions)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(subscriptions).limit(limit).offset(skip);
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    const db = await getDb();
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription || null;
  }

  async updateSubscription(id: string, data: Partial<InsertSubscription>): Promise<Subscription | null> {
    const db = await getDb();
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription || null;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(subscriptions).where(eq(subscriptions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveSubscription(companyId: string): Promise<Subscription | null> {
    const db = await getDb();
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.companyId, companyId),
        eq(subscriptions.status, 'active')
      ));
    return subscription || null;
  }

  async checkSubscriptionStatus(companyId: string): Promise<{
    isValid: boolean;
    tier: string;
    maxEmployees: number;
    expiresAt: Date | null;
  }> {
    const subscription = await this.getActiveSubscription(companyId);
    
    if (!subscription) {
      return {
        isValid: false,
        tier: 'free',
        maxEmployees: 30,
        expiresAt: null
      };
    }

    const now = new Date();
    const isExpired = subscription.endDate && subscription.endDate < now;

    return {
      isValid: !isExpired,
      tier: subscription.tier,
      maxEmployees: subscription.maxEmployees,
      expiresAt: subscription.endDate
    };
  }
}

export const subscriptionManager = new SubscriptionManager();
