// Simple script to check database connection and embeddings table
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Checking database connection...");
    
    // Test connection
    const test = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful");
    
    // Check embeddings table
    console.log("\nChecking embeddings table...");
    
    try {
      const count = await db.execute(sql`SELECT COUNT(*) FROM embeddings`);
      console.log(`Found ${count[0]?.count} embeddings`);
      
      if (count[0]?.count > 0) {
        const sample = await db.execute(sql`SELECT * FROM embeddings LIMIT 1`);
        console.log("\nSample embedding:");
        console.log({
          id: sample[0]?.id,
          content: sample[0]?.content?.substring(0, 100) + '...',
          embedding: '[...vector data]'
        });
      }
    } catch (e) {
      console.log("❌ Error querying embeddings table:", e.message);
      console.log("This might be expected if the table doesn't exist yet.");
    }
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  } finally {
    process.exit(0);
  }
}

main().catch(console.error);
