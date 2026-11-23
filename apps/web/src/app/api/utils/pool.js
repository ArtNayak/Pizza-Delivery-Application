import { Pool } from "@neondatabase/serverless";

// Pool (WebSocket) connection, used where an interactive transaction is needed.
// The `sql` tagged template in ./sql.js is HTTP-only and cannot run dependent queries in one transaction.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
