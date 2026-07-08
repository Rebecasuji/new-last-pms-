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
    console.log("Running update: change reminder_frequency from 4 times to 1 time...");

    const res = await client.query(`
      UPDATE project_tasks
      SET reminder_frequency = '1 Time'
      WHERE LOWER(reminder_frequency) = '4 times';
    `);

    console.log(`✅ Update complete! Rows affected: ${res.rowCount}`);
  } catch (err) {
    console.error("❌ Update failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
