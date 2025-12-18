import sql from 'mssql';

const config: sql.config = {
  user: process.env.AZURE_SQL_USER || 'fbsadmin',
  password: process.env.AZURE_SQL_PASSWORD || '',
  server: process.env.AZURE_SQL_SERVER || 'fbs-audit-sql-server.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'fbs-audit-db',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export async function query<T>(queryString: string, params?: Record<string, unknown>): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.query(queryString);
  return result.recordset as T[];
}

export async function execute(queryString: string, params?: Record<string, unknown>): Promise<number> {
  const pool = await getPool();
  const request = pool.request();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.query(queryString);
  return result.rowsAffected[0];
}

export { sql };
