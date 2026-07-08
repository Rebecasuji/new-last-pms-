import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migration: add close_reason and close_requested_by to tickets...");

    await client.query(`
      ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS close_reason TEXT,
      ADD COLUMN IF NOT EXISTS close_requested_by UUID REFERENCES employees(id);
    `);

    console.log("✅ Migration complete! Columns added (or already existed).");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
