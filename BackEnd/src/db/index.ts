import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export the typed Drizzle database instance
export const db = drizzle(pool, { schema });

// Export the pool for use by connect-pg-simple session store
export { pool };
