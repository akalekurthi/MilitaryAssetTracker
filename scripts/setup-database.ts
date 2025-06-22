import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import { hashPassword } from "../server/middleware/auth";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function setupDatabase() {
  console.log("Setting up database with sample data...");

  try {
    // Create tables (they should already exist from migrations, but this ensures they're there)
    console.log("Creating tables...");

    // Clear existing data for fresh setup
    await db.delete(schema.logs);
    await db.delete(schema.assignments);
    await db.delete(schema.transfers);
    await db.delete(schema.purchases);
    await db.delete(schema.stocks);
    await db.delete(schema.assets);
    await db.delete(schema.users);
    await db.delete(schema.bases);

    // Create bases
    console.log("Creating military bases...");
    const bases = await db.insert(schema.bases).values([
      { name: "Fort Bragg", location: "North Carolina, USA" },
      { name: "Camp Pendleton", location: "California, USA" },
      { name: "Norfolk Naval Base", location: "Virginia, USA" },
    ]).returning();

    // Create assets
    console.log("Creating asset types...");
    const assets = await db.insert(schema.assets).values([
      { type: "weapons", description: "M4A1 Carbine" },
      { type: "weapons", description: "M249 SAW" },
      { type: "weapons", description: "M240B Machine Gun" },
      { type: "vehicles", description: "HUMVEE M1165" },
      { type: "vehicles", description: "M1A2 Abrams Tank" },
      { type: "vehicles", description: "CH-47 Chinook" },
      { type: "ammunition", description: "5.56mm NATO" },
      { type: "ammunition", description: "7.62mm NATO" },
      { type: "ammunition", description: "120mm APFSDS" },
      { type: "equipment", description: "Night Vision Goggles" },
      { type: "equipment", description: "Body Armor Vest" },
      { type: "equipment", description: "Radio Communication Set" },
    ]).returning();

    // Create users with hashed passwords
    console.log("Creating users...");
    const adminPasswordHash = await hashPassword("admin123");
    const commanderPasswordHash = await hashPassword("commander123");
    const logisticsPasswordHash = await hashPassword("logistics123");

    const users = await db.insert(schema.users).values([
      {
        name: "General John Smith",
        email: "admin@military.gov",
        password: adminPasswordHash,
        role: "admin",
      },
      {
        name: "Colonel Mike Johnson",
        email: "commander@fortbragg.mil",
        password: commanderPasswordHash,
        role: "commander",
        baseId: bases[0].id,
      },
      {
        name: "Major Sarah Wilson",
        email: "logistics@pendleton.mil", 
        password: logisticsPasswordHash,
        role: "logistics",
        baseId: bases[1].id,
      },
    ]).returning();

    // Create stocks for each base-asset combination
    console.log("Creating stock records...");
    const stockRecords = [];
    for (const base of bases) {
      for (const asset of assets) {
        const openingBalance = Math.floor(Math.random() * 500) + 50;
        const assigned = Math.floor(openingBalance * 0.3);
        const expended = Math.floor(openingBalance * 0.1);
        
        stockRecords.push({
          baseId: base.id,
          assetId: asset.id,
          openingBalance,
          closingBalance: openingBalance + Math.floor(Math.random() * 100) - 25,
          assigned,
          expended,
        });
      }
    }
    await db.insert(schema.stocks).values(stockRecords);

    // Create sample purchases
    console.log("Creating purchase records...");
    const currentDate = new Date();
    const purchases = [];
    for (let i = 0; i < 15; i++) {
      const purchaseDate = new Date(currentDate);
      purchaseDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 30));
      
      purchases.push({
        assetId: assets[Math.floor(Math.random() * assets.length)].id,
        baseId: bases[Math.floor(Math.random() * bases.length)].id,
        quantity: Math.floor(Math.random() * 50) + 5,
        purchaseDate,
        createdBy: users[Math.floor(Math.random() * users.length)].id,
      });
    }
    await db.insert(schema.purchases).values(purchases);

    // Create sample transfers
    console.log("Creating transfer records...");
    const transfers = [];
    for (let i = 0; i < 10; i++) {
      const transferDate = new Date(currentDate);
      transferDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 20));
      
      const fromBase = bases[Math.floor(Math.random() * bases.length)];
      let toBase = bases[Math.floor(Math.random() * bases.length)];
      while (toBase.id === fromBase.id) {
        toBase = bases[Math.floor(Math.random() * bases.length)];
      }

      transfers.push({
        assetId: assets[Math.floor(Math.random() * assets.length)].id,
        fromBaseId: fromBase.id,
        toBaseId: toBase.id,
        quantity: Math.floor(Math.random() * 20) + 1,
        transferDate,
        initiatedBy: users[Math.floor(Math.random() * users.length)].id,
        status: Math.random() > 0.3 ? "completed" : "pending",
      });
    }
    await db.insert(schema.transfers).values(transfers);

    // Create sample assignments
    console.log("Creating assignment records...");
    const assignments = [];
    const personnelNames = [
      "Alpha Company", "Bravo Company", "Charlie Squad", "Delta Team",
      "Sgt. Johnson", "Lt. Williams", "Cpl. Davis", "Pvt. Miller"
    ];
    
    for (let i = 0; i < 12; i++) {
      const assignedDate = new Date(currentDate);
      assignedDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 15));
      
      assignments.push({
        assetId: assets[Math.floor(Math.random() * assets.length)].id,
        baseId: bases[Math.floor(Math.random() * bases.length)].id,
        assignedTo: personnelNames[Math.floor(Math.random() * personnelNames.length)],
        personnelId: `USM${Math.floor(Math.random() * 900000) + 100000}`,
        quantity: Math.floor(Math.random() * 10) + 1,
        assignedDate,
        status: Math.random() > 0.2 ? "assigned" : "expended",
        reason: "Operational deployment",
        createdBy: users[Math.floor(Math.random() * users.length)].id,
      });
    }
    await db.insert(schema.assignments).values(assignments);

    // Create audit logs
    console.log("Creating audit logs...");
    const auditLogs = [
      {
        userId: users[0].id, // Admin
        action: "login",
        actionType: "authentication",
        details: "Admin user logged in to system",
        ipAddress: "192.168.1.100",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: users[1].id, // Commander
        action: "create",
        actionType: "purchase",
        details: "Created purchase order for M4A1 Carbines - Quantity: 25",
        ipAddress: "192.168.1.101",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        userId: users[2].id, // Logistics
        action: "create",
        actionType: "transfer",
        details: "Initiated transfer of HUMVEE M1165 from Fort Bragg to Camp Pendleton",
        ipAddress: "192.168.1.102",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        userId: users[0].id, // Admin
        action: "update",
        actionType: "assignment",
        details: "Updated assignment status for personnel OFF-2024-001",
        ipAddress: "192.168.1.100",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        userId: users[1].id, // Commander
        action: "create",
        actionType: "assignment",
        details: "Assigned Night Vision Goggles to Rifle Squad Alpha",
        ipAddress: "192.168.1.101",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        userId: users[2].id, // Logistics
        action: "update",
        actionType: "transfer",
        details: "Completed transfer of medical supplies to Norfolk Naval Base",
        ipAddress: "192.168.1.102",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ];
    await db.insert(schema.logs).values(auditLogs);

    console.log("Database setup completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@military.gov / admin123");
    console.log("Commander: commander@fortbragg.mil / commander123");
    console.log("Logistics: logistics@pendleton.mil / logistics123");

  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();