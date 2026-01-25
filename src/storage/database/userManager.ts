import { eq, and, or, SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, insertUserSchema } from "./shared/schema";
import type { User, InsertUser } from "./shared/schema";

export class UserManager {
  async createUser(data: InsertUser): Promise<User> {
    const db = await getDb();
    const validated = insertUserSchema.parse(data);
    const [user] = await db.insert(users).values(validated).returning();
    return user;
  }

  async getUsers(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<User, 'id' | 'companyId' | 'name' | 'email' | 'phone' | 'role' | 'isActive'>>;
  } = {}): Promise<User[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(users.id, filters.id));
    }
    if (filters.companyId !== undefined && filters.companyId !== null) {
      conditions.push(eq(users.companyId, filters.companyId));
    }
    if (filters.name !== undefined && filters.name !== null) {
      conditions.push(eq(users.name, filters.name));
    }
    if (filters.email !== undefined && filters.email !== null) {
      conditions.push(eq(users.email, filters.email));
    }
    if (filters.phone !== undefined && filters.phone !== null) {
      conditions.push(eq(users.phone, filters.phone));
    }
    if (filters.role !== undefined) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(users)
        .where(and(...conditions))
        .limit(limit)
        .offset(skip);
    }

    return db.select().from(users).limit(limit).offset(skip);
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  /**
   * 通过任意账号信息查找用户（邮箱、手机号、用户名）
   * 性能优化：单次查询代替三次查询
   */
  async getUserByAnyAccount(account: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(or(
        eq(users.email, account),
        eq(users.phone, account),
        eq(users.username, account)
      ));
    return user || null;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async updateLastLogin(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCompanyUsers(companyId: string): Promise<User[]> {
    const db = await getDb();
    return db.select().from(users).where(eq(users.companyId, companyId));
  }
}

export const userManager = new UserManager();
