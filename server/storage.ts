import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, gte, lte, sql, sum } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  LoginUser,
  Base,
  InsertBase,
  Asset,
  InsertAsset,
  Stock,
  Purchase,
  InsertPurchase,
  Transfer,
  InsertTransfer,
  Assignment,
  InsertAssignment,
  Log,
  InsertLog,
} from "@shared/schema";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bases
  getBases(): Promise<Base[]>;
  getBase(id: number): Promise<Base | undefined>;
  createBase(base: InsertBase): Promise<Base>;
  
  // Assets
  getAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  
  // Stocks
  getStocks(baseId?: number): Promise<Stock[]>;
  getStockByBaseAndAsset(baseId: number, assetId: number): Promise<Stock | undefined>;
  updateStock(stockId: number, updates: Partial<Stock>): Promise<Stock>;
  
  // Purchases
  getPurchases(baseId?: number, assetType?: string, startDate?: Date, endDate?: Date): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  
  // Transfers
  getTransfers(baseId?: number, assetType?: string, startDate?: Date, endDate?: Date): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransferStatus(transferId: number, status: string): Promise<Transfer>;
  
  // Assignments
  getAssignments(baseId?: number, status?: string, startDate?: Date, endDate?: Date): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignmentStatus(assignmentId: number, status: string, reason?: string): Promise<Assignment>;
  
  // Dashboard metrics
  getDashboardMetrics(baseId?: number, startDate?: Date, endDate?: Date): Promise<{
    openingBalance: number;
    closingBalance: number;
    netMovement: number;
    assignedAssets: number;
    breakdown: {
      purchases: number;
      transfersIn: number;
      transfersOut: number;
    };
  }>;
  
  // Audit logs
  createLog(log: InsertLog): Promise<Log>;
  getLogs(userId?: number, actionType?: string, startDate?: Date, endDate?: Date): Promise<Log[]>;
  
  // Recent activity
  getRecentActivity(baseId?: number, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async getBases(): Promise<Base[]> {
    return await db.select().from(schema.bases).orderBy(schema.bases.name);
  }

  async getBase(id: number): Promise<Base | undefined> {
    const result = await db.select().from(schema.bases).where(eq(schema.bases.id, id)).limit(1);
    return result[0];
  }

  async createBase(base: InsertBase): Promise<Base> {
    const result = await db.insert(schema.bases).values(base).returning();
    return result[0];
  }

  async getAssets(): Promise<Asset[]> {
    return await db.select().from(schema.assets).orderBy(schema.assets.type, schema.assets.description);
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const result = await db.select().from(schema.assets).where(eq(schema.assets.id, id)).limit(1);
    return result[0];
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const result = await db.insert(schema.assets).values(asset).returning();
    return result[0];
  }

  async getStocks(baseId?: number): Promise<Stock[]> {
    if (baseId) {
      return await db.select().from(schema.stocks)
        .where(eq(schema.stocks.baseId, baseId))
        .orderBy(schema.stocks.baseId, schema.stocks.assetId);
    }
    return await db.select().from(schema.stocks)
      .orderBy(schema.stocks.baseId, schema.stocks.assetId);
  }

  async getStockByBaseAndAsset(baseId: number, assetId: number): Promise<Stock | undefined> {
    const result = await db.select().from(schema.stocks)
      .where(and(eq(schema.stocks.baseId, baseId), eq(schema.stocks.assetId, assetId)))
      .limit(1);
    return result[0];
  }

  async updateStock(stockId: number, updates: Partial<Stock>): Promise<Stock> {
    const result = await db.update(schema.stocks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.stocks.id, stockId))
      .returning();
    return result[0];
  }

  async getPurchases(baseId?: number, assetType?: string, startDate?: Date, endDate?: Date): Promise<Purchase[]> {
    const conditions = [];
    if (baseId) conditions.push(eq(schema.purchases.baseId, baseId));
    if (assetType) conditions.push(eq(schema.assets.type, assetType as any));
    if (startDate) conditions.push(gte(schema.purchases.purchaseDate, startDate));
    if (endDate) conditions.push(lte(schema.purchases.purchaseDate, endDate));

    const query = db.select({
      id: schema.purchases.id,
      assetId: schema.purchases.assetId,
      baseId: schema.purchases.baseId,
      quantity: schema.purchases.quantity,
      purchaseDate: schema.purchases.purchaseDate,
      createdBy: schema.purchases.createdBy,
      createdAt: schema.purchases.createdAt,
      asset: schema.assets,
      base: schema.bases,
      user: schema.users,
    })
    .from(schema.purchases)
    .leftJoin(schema.assets, eq(schema.purchases.assetId, schema.assets.id))
    .leftJoin(schema.bases, eq(schema.purchases.baseId, schema.bases.id))
    .leftJoin(schema.users, eq(schema.purchases.createdBy, schema.users.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(schema.purchases.purchaseDate));
    }

    return await query.orderBy(desc(schema.purchases.purchaseDate));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const result = await db.insert(schema.purchases).values(purchase).returning();
    return result[0];
  }

  async getTransfers(baseId?: number, assetType?: string, startDate?: Date, endDate?: Date): Promise<Transfer[]> {
    const conditions = [];
    if (baseId) {
      conditions.push(
        sql`${schema.transfers.fromBaseId} = ${baseId} OR ${schema.transfers.toBaseId} = ${baseId}`
      );
    }
    if (assetType) conditions.push(eq(schema.assets.type, assetType as any));
    if (startDate) conditions.push(gte(schema.transfers.transferDate, startDate));
    if (endDate) conditions.push(lte(schema.transfers.transferDate, endDate));

    const query = db.select({
      id: schema.transfers.id,
      assetId: schema.transfers.assetId,
      fromBaseId: schema.transfers.fromBaseId,
      toBaseId: schema.transfers.toBaseId,
      quantity: schema.transfers.quantity,
      transferDate: schema.transfers.transferDate,
      initiatedBy: schema.transfers.initiatedBy,
      status: schema.transfers.status,
      createdAt: schema.transfers.createdAt,
      asset: schema.assets,
      fromBase: schema.bases,
      toBase: schema.bases,
      user: schema.users,
    })
    .from(schema.transfers)
    .leftJoin(schema.assets, eq(schema.transfers.assetId, schema.assets.id))
    .leftJoin(schema.bases, eq(schema.transfers.fromBaseId, schema.bases.id))
    .leftJoin(schema.users, eq(schema.transfers.initiatedBy, schema.users.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(schema.transfers.transferDate));
    }

    return await query.orderBy(desc(schema.transfers.transferDate));
  }

  async createTransfer(transfer: InsertTransfer): Promise<Transfer> {
    const result = await db.insert(schema.transfers).values(transfer).returning();
    return result[0];
  }

  async updateTransferStatus(transferId: number, status: string): Promise<Transfer> {
    const result = await db.update(schema.transfers)
      .set({ status: status as any })
      .where(eq(schema.transfers.id, transferId))
      .returning();
    return result[0];
  }

  async getAssignments(baseId?: number, status?: string, startDate?: Date, endDate?: Date): Promise<Assignment[]> {
    const conditions = [];
    if (baseId) conditions.push(eq(schema.assignments.baseId, baseId));
    if (status) conditions.push(eq(schema.assignments.status, status as any));
    if (startDate) conditions.push(gte(schema.assignments.assignedDate, startDate));
    if (endDate) conditions.push(lte(schema.assignments.assignedDate, endDate));

    const query = db.select({
      id: schema.assignments.id,
      assetId: schema.assignments.assetId,
      baseId: schema.assignments.baseId,
      assignedTo: schema.assignments.assignedTo,
      personnelId: schema.assignments.personnelId,
      quantity: schema.assignments.quantity,
      assignedDate: schema.assignments.assignedDate,
      status: schema.assignments.status,
      reason: schema.assignments.reason,
      createdBy: schema.assignments.createdBy,
      createdAt: schema.assignments.createdAt,
      asset: schema.assets,
      base: schema.bases,
      user: schema.users,
    })
    .from(schema.assignments)
    .leftJoin(schema.assets, eq(schema.assignments.assetId, schema.assets.id))
    .leftJoin(schema.bases, eq(schema.assignments.baseId, schema.bases.id))
    .leftJoin(schema.users, eq(schema.assignments.createdBy, schema.users.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(schema.assignments.assignedDate));
    }

    return await query.orderBy(desc(schema.assignments.assignedDate));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const result = await db.insert(schema.assignments).values(assignment).returning();
    return result[0];
  }

  async updateAssignmentStatus(assignmentId: number, status: string, reason?: string): Promise<Assignment> {
    const result = await db.update(schema.assignments)
      .set({ status: status as any, reason })
      .where(eq(schema.assignments.id, assignmentId))
      .returning();
    return result[0];
  }

  async getDashboardMetrics(baseId?: number, startDate?: Date, endDate?: Date) {
    // Get stocks for the base(s)
    const stocks = await this.getStocks(baseId);
    
    const openingBalance = stocks.reduce((sum, stock) => sum + stock.openingBalance, 0);
    const closingBalance = stocks.reduce((sum, stock) => sum + stock.closingBalance, 0);
    const assignedAssets = stocks.reduce((sum, stock) => sum + stock.assigned, 0);

    // Get purchases total
    const purchases = await this.getPurchases(baseId, undefined, startDate, endDate);
    const purchasesTotal = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

    // Get transfers in and out
    const transfers = await this.getTransfers(baseId, undefined, startDate, endDate);
    let transfersIn = 0;
    let transfersOut = 0;

    transfers.forEach(transfer => {
      if (transfer.status === 'completed') {
        if (!baseId || transfer.toBaseId === baseId) {
          transfersIn += transfer.quantity;
        }
        if (!baseId || transfer.fromBaseId === baseId) {
          transfersOut += transfer.quantity;
        }
      }
    });

    const netMovement = purchasesTotal + transfersIn - transfersOut;

    return {
      openingBalance,
      closingBalance,
      netMovement,
      assignedAssets,
      breakdown: {
        purchases: purchasesTotal,
        transfersIn,
        transfersOut,
      },
    };
  }

  async createLog(log: InsertLog): Promise<Log> {
    const result = await db.insert(schema.logs).values(log).returning();
    return result[0];
  }

  async getLogs(userId?: number, actionType?: string, startDate?: Date, endDate?: Date): Promise<Log[]> {
    const conditions = [];
    if (userId) conditions.push(eq(schema.logs.userId, userId));
    if (actionType) conditions.push(eq(schema.logs.actionType, actionType as any));
    if (startDate) conditions.push(gte(schema.logs.timestamp, startDate));
    if (endDate) conditions.push(lte(schema.logs.timestamp, endDate));

    if (conditions.length > 0) {
      return await db.select().from(schema.logs)
        .where(and(...conditions))
        .orderBy(desc(schema.logs.timestamp));
    }

    return await db.select().from(schema.logs)
      .orderBy(desc(schema.logs.timestamp));
  }

  async getRecentActivity(baseId?: number, limit = 10): Promise<any[]> {
    // Get recent purchases, transfers, and assignments
    const recentPurchases = await db.select({
      id: schema.purchases.id,
      type: sql<string>`'purchase'`,
      description: sql<string>`'Purchase of ' || ${schema.purchases.quantity} || ' ' || ${schema.assets.description}`,
      base: schema.bases.name,
      user: schema.users.name,
      timestamp: schema.purchases.createdAt,
    })
    .from(schema.purchases)
    .leftJoin(schema.assets, eq(schema.purchases.assetId, schema.assets.id))
    .leftJoin(schema.bases, eq(schema.purchases.baseId, schema.bases.id))
    .leftJoin(schema.users, eq(schema.purchases.createdBy, schema.users.id))
    .where(baseId ? eq(schema.purchases.baseId, baseId) : sql`true`)
    .orderBy(desc(schema.purchases.createdAt))
    .limit(limit);

    const recentTransfers = await db.select({
      id: schema.transfers.id,
      type: sql<string>`'transfer'`,
      description: sql<string>`'Transfer of ' || ${schema.transfers.quantity} || ' ' || ${schema.assets.description}`,
      base: sql<string>`${schema.bases.name} || ' to ' || ${schema.bases.name}`,
      user: schema.users.name,
      timestamp: schema.transfers.createdAt,
    })
    .from(schema.transfers)
    .leftJoin(schema.assets, eq(schema.transfers.assetId, schema.assets.id))
    .leftJoin(schema.bases, eq(schema.transfers.fromBaseId, schema.bases.id))
    .leftJoin(schema.users, eq(schema.transfers.initiatedBy, schema.users.id))
    .where(baseId ? sql`${schema.transfers.fromBaseId} = ${baseId} OR ${schema.transfers.toBaseId} = ${baseId}` : sql`true`)
    .orderBy(desc(schema.transfers.createdAt))
    .limit(limit);

    const recentAssignments = await db.select({
      id: schema.assignments.id,
      type: sql<string>`'assignment'`,
      description: sql<string>`'Assignment of ' || ${schema.assignments.quantity} || ' ' || ${schema.assets.description}`,
      base: schema.bases.name,
      user: schema.users.name,
      timestamp: schema.assignments.createdAt,
    })
    .from(schema.assignments)
    .leftJoin(schema.assets, eq(schema.assignments.assetId, schema.assets.id))
    .leftJoin(schema.bases, eq(schema.assignments.baseId, schema.bases.id))
    .leftJoin(schema.users, eq(schema.assignments.createdBy, schema.users.id))
    .where(baseId ? eq(schema.assignments.baseId, baseId) : sql`true`)
    .orderBy(desc(schema.assignments.createdAt))
    .limit(limit);

    // Combine and sort by timestamp
    const allActivities = [...recentPurchases, ...recentTransfers, ...recentAssignments];
    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const storage = new DatabaseStorage();
