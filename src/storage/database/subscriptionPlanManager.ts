import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscriptionPlans, insertSubscriptionPlanSchema } from "./shared/schema";
import type { SubscriptionPlan, InsertSubscriptionPlan } from "./shared/schema";

export class SubscriptionPlanManager {
  async createPlan(data: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const db = await getDb();
    const validated = insertSubscriptionPlanSchema.parse(data);
    const [plan] = await db.insert(subscriptionPlans).values(validated).returning();
    return plan;
  }

  async getPlans(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<SubscriptionPlan, 'id' | 'tier' | 'isActive'>>;
  } = {}): Promise<SubscriptionPlan[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(subscriptionPlans.id, filters.id));
    }
    if (filters.tier !== undefined) {
      conditions.push(eq(subscriptionPlans.tier, filters.tier));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(subscriptionPlans.isActive, filters.isActive));
    }

    const query = db.select().from(subscriptionPlans);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.orderBy(subscriptionPlans.sortOrder).limit(limit).offset(skip);
  }

  async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    const db = await getDb();
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || null;
  }

  async getPlanByTier(tier: string): Promise<SubscriptionPlan | null> {
    const db = await getDb();
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.tier, tier));
    return plan || null;
  }

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const db = await getDb();
    return db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);
  }

  async updatePlan(id: string, data: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | null> {
    const db = await getDb();
    const [plan] = await db
      .update(subscriptionPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan || null;
  }

  async deletePlan(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 计算价格
  async calculatePrice(tier: string, period: string): Promise<{ amount: number; originalAmount: number } | null> {
    const plan = await this.getPlanByTier(tier);
    if (!plan) return null;

    const basePrice = period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    return {
      amount: basePrice,
      originalAmount: basePrice,
    };
  }
}

export const subscriptionPlanManager = new SubscriptionPlanManager();
