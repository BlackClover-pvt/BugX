import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Create a PostgreSQL connection pool
const isRemote = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("localhost") &&
  !process.env.DATABASE_URL.includes("127.0.0.1")
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
});

// Export the typed Drizzle database instance
export const db = drizzle(pool, { schema });

// Export the pool for use by connect-pg-simple session store
export { pool };
