import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  authenticateToken, 
  requireRole, 
  requireBaseAccess,
  generateToken,
  hashPassword,
  comparePassword,
  type AuthenticatedRequest
} from "./middleware/auth";
import { 
  insertUserSchema, 
  loginSchema,
  insertPurchaseSchema,
  insertTransferSchema,
  insertAssignmentSchema,
  insertBaseSchema,
  insertAssetSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      
      // Log login
      await storage.createLog({
        userId: user.id,
        actionType: "login",
        newData: { email: user.email },
      });

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          baseId: user.baseId,
        },
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Log user creation
      await storage.createLog({
        userId: req.user!.id,
        actionType: "purchase", // Using purchase as closest match
        resourceId: user.id,
        newData: { email: user.email, role: user.role },
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    res.json({
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role,
      baseId: req.user!.baseId,
    });
  });

  // Bases routes
  app.get("/api/bases", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const bases = await storage.getBases();
      res.json(bases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bases" });
    }
  });

  app.post("/api/bases", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const baseData = insertBaseSchema.parse(req.body);
      const base = await storage.createBase(baseData);
      
      await storage.createLog({
        userId: req.user!.id,
        actionType: "purchase", // Using purchase as closest match
        resourceId: base.id,
        newData: baseData,
      });

      res.status(201).json(base);
    } catch (error) {
      res.status(400).json({ error: "Failed to create base" });
    }
  });

  // Assets routes
  app.get("/api/assets", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", authenticateToken, requireRole(["admin", "logistics"]), async (req: AuthenticatedRequest, res) => {
    try {
      const assetData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(assetData);
      
      await storage.createLog({
        userId: req.user!.id,
        actionType: "purchase", // Using purchase as closest match
        resourceId: asset.id,
        newData: assetData,
      });

      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ error: "Failed to create asset" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { baseId, startDate, endDate } = req.query;
      
      // Role-based filtering
      let filterBaseId: number | undefined;
      if (req.user!.role === "commander" && req.user!.baseId) {
        filterBaseId = req.user!.baseId;
      } else if (baseId) {
        filterBaseId = parseInt(baseId as string);
      }

      const metrics = await storage.getDashboardMetrics(
        filterBaseId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/activity", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { limit = 10 } = req.query;
      
      // Role-based filtering
      let filterBaseId: number | undefined;
      if (req.user!.role === "commander" && req.user!.baseId) {
        filterBaseId = req.user!.baseId;
      }

      const activity = await storage.getRecentActivity(filterBaseId, parseInt(limit as string));
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  // Purchases routes
  app.get("/api/purchases", authenticateToken, requireRole(["admin", "logistics", "commander"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { baseId, assetType, startDate, endDate } = req.query;
      
      let filterBaseId: number | undefined;
      if (req.user!.role === "commander" && req.user!.baseId) {
        filterBaseId = req.user!.baseId;
      } else if (baseId) {
        filterBaseId = parseInt(baseId as string);
      }

      const purchases = await storage.getPurchases(
        filterBaseId,
        assetType as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", authenticateToken, requireRole(["admin", "logistics"]), async (req: AuthenticatedRequest, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      
      // Ensure user can only create purchases for their base (unless admin)
      if (req.user!.role === "logistics" && req.user!.baseId && purchaseData.baseId !== req.user!.baseId) {
        return res.status(403).json({ error: "Can only create purchases for your assigned base" });
      }

      const purchase = await storage.createPurchase({
        ...purchaseData,
        createdBy: req.user!.id,
      });

      // Update stock
      const stock = await storage.getStockByBaseAndAsset(purchaseData.baseId, purchaseData.assetId);
      if (stock) {
        await storage.updateStock(stock.id, {
          closingBalance: stock.closingBalance + purchaseData.quantity,
        });
      }

      // Log purchase
      await storage.createLog({
        userId: req.user!.id,
        actionType: "purchase",
        resourceId: purchase.id,
        newData: purchaseData,
      });

      res.status(201).json(purchase);
    } catch (error) {
      res.status(400).json({ error: "Failed to create purchase" });
    }
  });

  // Transfers routes
  app.get("/api/transfers", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { baseId, assetType, startDate, endDate } = req.query;
      
      let filterBaseId: number | undefined;
      if (req.user!.role === "commander" && req.user!.baseId) {
        filterBaseId = req.user!.baseId;
      } else if (baseId) {
        filterBaseId = parseInt(baseId as string);
      }

      const transfers = await storage.getTransfers(
        filterBaseId,
        assetType as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transfers" });
    }
  });

  app.post("/api/transfers", authenticateToken, requireRole(["admin", "logistics", "commander"]), async (req: AuthenticatedRequest, res) => {
    try {
      const transferData = insertTransferSchema.parse(req.body);
      
      // Role-based access control
      if (req.user!.role === "commander" && req.user!.baseId) {
        if (transferData.fromBaseId !== req.user!.baseId && transferData.toBaseId !== req.user!.baseId) {
          return res.status(403).json({ error: "Can only transfer from/to your assigned base" });
        }
      }

      const transfer = await storage.createTransfer({
        ...transferData,
        initiatedBy: req.user!.id,
      });

      // Log transfer
      await storage.createLog({
        userId: req.user!.id,
        actionType: "transfer",
        resourceId: transfer.id,
        newData: transferData,
      });

      res.status(201).json(transfer);
    } catch (error) {
      res.status(400).json({ error: "Failed to create transfer" });
    }
  });

  app.patch("/api/transfers/:id/status", authenticateToken, requireRole(["admin", "logistics", "commander"]), async (req: AuthenticatedRequest, res) => {
    try {
      const transferId = parseInt(req.params.id);
      const { status } = req.body;

      const transfer = await storage.updateTransferStatus(transferId, status);

      // If completed, update stocks
      if (status === "completed") {
        // Decrease from base stock
        const fromStock = await storage.getStockByBaseAndAsset(transfer.fromBaseId, transfer.assetId);
        if (fromStock) {
          await storage.updateStock(fromStock.id, {
            closingBalance: Math.max(0, fromStock.closingBalance - transfer.quantity),
          });
        }

        // Increase to base stock
        const toStock = await storage.getStockByBaseAndAsset(transfer.toBaseId, transfer.assetId);
        if (toStock) {
          await storage.updateStock(toStock.id, {
            closingBalance: toStock.closingBalance + transfer.quantity,
          });
        }
      }

      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: "Failed to update transfer status" });
    }
  });

  // Assignments routes
  app.get("/api/assignments", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { baseId, status, startDate, endDate } = req.query;
      
      let filterBaseId: number | undefined;
      if (req.user!.role === "commander" && req.user!.baseId) {
        filterBaseId = req.user!.baseId;
      } else if (baseId) {
        filterBaseId = parseInt(baseId as string);
      }

      const assignments = await storage.getAssignments(
        filterBaseId,
        status as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", authenticateToken, requireRole(["admin", "commander"]), async (req: AuthenticatedRequest, res) => {
    try {
      const assignmentData = insertAssignmentSchema.parse(req.body);
      
      // Ensure commander can only assign for their base
      if (req.user!.role === "commander" && req.user!.baseId && assignmentData.baseId !== req.user!.baseId) {
        return res.status(403).json({ error: "Can only assign assets for your base" });
      }

      const assignment = await storage.createAssignment({
        ...assignmentData,
        createdBy: req.user!.id,
      });

      // Update stock
      const stock = await storage.getStockByBaseAndAsset(assignmentData.baseId, assignmentData.assetId);
      if (stock) {
        await storage.updateStock(stock.id, {
          assigned: stock.assigned + assignmentData.quantity,
          closingBalance: Math.max(0, stock.closingBalance - assignmentData.quantity),
        });
      }

      // Log assignment
      await storage.createLog({
        userId: req.user!.id,
        actionType: "assignment",
        resourceId: assignment.id,
        newData: assignmentData,
      });

      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Failed to create assignment" });
    }
  });

  app.patch("/api/assignments/:id/status", authenticateToken, requireRole(["admin", "commander"]), async (req: AuthenticatedRequest, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const { status, reason } = req.body;

      const assignment = await storage.updateAssignmentStatus(assignmentId, status, reason);

      // If expended, update stock
      if (status === "expended") {
        const stock = await storage.getStockByBaseAndAsset(assignment.baseId, assignment.assetId);
        if (stock) {
          await storage.updateStock(stock.id, {
            assigned: Math.max(0, stock.assigned - assignment.quantity),
            expended: stock.expended + assignment.quantity,
          });
        }
      }

      res.json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Failed to update assignment status" });
    }
  });

  // Stocks routes
  app.get("/api/stocks", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { baseId } = req.query;
      
      let filterBaseId: number | undefined;
      if (req.user!.role === "commander" && req.user!.baseId) {
        filterBaseId = req.user!.baseId;
      } else if (baseId) {
        filterBaseId = parseInt(baseId as string);
      }

      const stocks = await storage.getStocks(filterBaseId);
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stocks" });
    }
  });

  // Users routes
  app.get("/api/users", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Audit logs routes
  app.get("/api/logs", authenticateToken, requireRole(["admin", "commander"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, actionType, startDate, endDate } = req.query;
      
      const logs = await storage.getLogs(
        userId ? parseInt(userId as string) : undefined,
        actionType as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      // Map actionType to action for frontend compatibility
      const mappedLogs = logs.map(log => ({
        ...log,
        action: log.actionType || log.action || 'unknown'
      }));

      res.json(mappedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
