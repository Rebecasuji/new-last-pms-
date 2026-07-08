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
    console.log("Running migration: add task_owner_id, performance_points, grace_period_days...");

    await client.query(`
      ALTER TABLE project_tasks
        ADD COLUMN IF NOT EXISTS task_owner_id UUID REFERENCES employees(id),
        ADD COLUMN IF NOT EXISTS performance_points INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 2;
    `);

    console.log("✅ Migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
